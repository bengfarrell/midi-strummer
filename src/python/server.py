import json
import sys
import signal
import threading
import time
import atexit
import asyncio
from typing import Dict, Any, Union, Optional
from dataclasses import asdict

from finddevice import get_tablet_device
from datahelpers import parse_code, parse_range_data, parse_wrapped_range_data
from strummer import strummer
from midi import Midi
from midievent import MidiEvent
from note import Note
from socketserver import SocketServer

# Global references for cleanup
_device = None
_midi = None
_socket_server = None
_event_loop = None
_loop_thread = None


def cleanup_resources():
    """Clean up device and MIDI resources"""
    global _device, _midi, _socket_server, _event_loop, _loop_thread
    
    print("\nCleaning up resources...")
    
    # Close socket server first
    if _socket_server is not None:
        try:
            print("Closing socket server...")
            _socket_server.stop()
            _socket_server = None
            print("Socket server closed successfully")
        except Exception as e:
            print(f"Error closing socket server: {e}")
            _socket_server = None
    
    # Stop event loop
    if _event_loop is not None and _event_loop.is_running():
        try:
            print("Stopping event loop...")
            _event_loop.call_soon_threadsafe(_event_loop.stop)
            if _loop_thread is not None:
                _loop_thread.join(timeout=2.0)
            print("Event loop stopped successfully")
        except Exception as e:
            print(f"Error stopping event loop: {e}")
    
    # Close device first - this is critical for device release
    if _device is not None:
        try:
            print("Closing HID device...")
            # Try to ensure the device is in a good state before closing
            try:
                _device.set_nonblocking(False)
            except:
                pass  # Ignore if this fails
            
            _device.close()
            print("HID device closed successfully")
            _device = None
            
            # Give the OS more time to fully release the device handle
            # This is crucial for HID devices on macOS
            print("Waiting for OS to release device handle...")
            time.sleep(0.5)
            print("Device should be released now")
            
        except Exception as e:
            print(f"Error closing device: {e}")
            _device = None  # Clear reference even if close failed
    
    # Close MIDI
    if _midi is not None:
        try:
            print("Closing MIDI connections...")
            _midi.close()
            _midi = None
            print("MIDI connections closed successfully")
        except Exception as e:
            print(f"Error closing MIDI: {e}")
            _midi = None


def load_config() -> Dict[str, Any]:
    """Load configuration from settings.json"""
    try:
        with open('settings-python.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: settings.json not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing settings.json: {e}")
        sys.exit(1)


def setup_midi_and_strummer(cfg: Dict[str, Any], socket_server: Optional[SocketServer] = None) -> Midi:
    """Setup MIDI connection and strummer configuration"""
    # Initialize strummer with initial notes if provided
    if 'initialNotes' in cfg and cfg['initialNotes']:
        initial_notes = [Note.parse_notation(n) for n in cfg['initialNotes']]
        strummer.notes = Note.fill_note_spread(
            initial_notes, 
            cfg.get('lowerNoteSpread', 0), 
            cfg.get('upperNoteSpread', 0)
        )
    
    # Setup MIDI
    midi = Midi()
    
    def on_midi_note_event(event):
        """Handle MIDI note events"""
        midi_notes = [Note.parse_notation(n) for n in midi.notes]
        strummer.notes = Note.fill_note_spread(
            midi_notes,
            cfg.get('lowerNoteSpread', 0),
            cfg.get('upperNoteSpread', 0)
        )
        
        # Broadcast notes to socket server if enabled
        if socket_server is not None:
            try:
                message = json.dumps({
                    'type': 'notes',
                    'notes': [asdict(note) for note in strummer.notes],
                    'timestamp': time.time()
                })
                socket_server.send_message_sync(message)
            except Exception as e:
                print(f"[SERVER] Error broadcasting to WebSocket: {e}")

    midi.add_event_listener(MidiEvent.NOTE_EVENT, on_midi_note_event)
    midi.refresh_connection(cfg.get('midiInputId'))
    
    return midi


def start_socket_server(port: int) -> tuple[SocketServer, asyncio.AbstractEventLoop, threading.Thread]:
    """Start socket server in a separate thread with its own event loop"""
    socket_server = SocketServer()
    
    def run_event_loop(loop, server, port):
        """Run the event loop in a separate thread"""
        asyncio.set_event_loop(loop)
        loop.run_until_complete(server.start(port))
        loop.run_forever()
    
    # Create a new event loop for the socket server
    loop = asyncio.new_event_loop()
    
    # Start the event loop in a separate thread
    thread = threading.Thread(target=run_event_loop, args=(loop, socket_server, port), daemon=True)
    thread.start()
    
    # Give the server a moment to start
    time.sleep(0.5)
    
    return socket_server, loop, thread


def process_device_data(data: bytes, cfg: Dict[str, Any], midi: Midi) -> None:
    """Process incoming device data"""
    # Convert bytes to list of integers
    data_list = list(data)
    
    result: Dict[str, Union[str, int, float]] = {}
    
    # Process each mapping in the configuration
    for key, mapping in cfg['mappings'].items():
        mapping_type = mapping.get('type')
        byte_index = mapping.get('byteIndex', 0)
        
        if byte_index >= len(data_list):
            continue
            
        if mapping_type == 'range':
            result[key] = parse_range_data(
                data_list, 
                byte_index, 
                mapping.get('min', 0), 
                mapping.get('max', 0)
            )
        elif mapping_type == 'wrapped-range':
            result[key] = parse_wrapped_range_data(
                data_list,
                byte_index,
                mapping.get('positiveMin', 0),
                mapping.get('positiveMax', 0),
                mapping.get('negativeMin', 0),
                mapping.get('negativeMax', 0)
            )
        elif mapping_type == 'code':
            code_result = parse_code(data_list, byte_index, mapping.get('values', []))
            if isinstance(code_result, dict):
                result.update(code_result)
            else:
                result[key] = code_result
    
    # Process strumming
    x = result.get('x', 0.0)
    y = result.get('y', 0.0)
    pressure = result.get('pressure', 0.0)
    tilt_x = result.get('tiltX', 0.0)
    tilt_y = result.get('tiltY', 0.0)
    
    strum = strummer.strum(float(x), float(y), float(pressure), float(tilt_x), float(tilt_y))
    
    if strum:
        print(strum['note'])
        midi.send_note(strum['note'], strum['velocity'])
        print(f"Note: {strum['note'].notation}{strum['note'].octave}")


def main():
    """Main application entry point"""
    global _device, _midi, _socket_server, _event_loop, _loop_thread
    
    # Register cleanup function to run on exit
    atexit.register(cleanup_resources)
    
    # Load configuration
    cfg = load_config()
    
    # Optionally start socket server
    if cfg.get('useSocketServer', False):
        port = cfg.get('socketServerPort', 8080)
        print(f"[SERVER] Starting WebSocket server on port {port}...")
        try:
            _socket_server, _event_loop, _loop_thread = start_socket_server(port)
            print(f"[SERVER] WebSocket server started successfully")
        except Exception as e:
            print(f"[SERVER] Failed to start WebSocket server: {e}")
            _socket_server = None
    else:
        print("[SERVER] WebSocket server disabled in configuration")
    
    # Setup MIDI and strummer
    _midi = setup_midi_and_strummer(cfg, _socket_server)
    
    # Get tablet device
    _device = get_tablet_device(cfg['device'])
    if not _device:
        print("Failed to initialize device")
        sys.exit(1)
    
    print("MIDI Strummer server started. Press Ctrl+C to exit.")
    
    # Setup signal handler for graceful shutdown
    def signal_handler(sig, frame):
        signal_name = signal.Signals(sig).name
        print(f"\nReceived {signal_name} signal, shutting down gracefully...")
        cleanup_resources()
        sys.exit(0)
    
    # Handle various termination signals
    signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
    signal.signal(signal.SIGTERM, signal_handler)  # kill command
    signal.signal(signal.SIGTSTP, signal_handler)  # Ctrl+Z
    signal.signal(signal.SIGHUP, signal_handler)   # Terminal closed
    
    # Main device reading loop
    try:
        # Use non-blocking mode to allow signal handling
        print("Setting device to non-blocking mode...")
        _device.set_nonblocking(True)
        
        print("Starting device reading loop...")
        print("Try interacting with your tablet now (touch, move stylus, etc.)...")
        
        read_count = 0
        empty_read_count = 0
        
        while True:
            try:
                # Read data from device (non-blocking)
                data = _device.read(64)
                read_count += 1
                
                if data:
                    empty_read_count = 0  # Reset empty count
                    #print(f"Read #{read_count}: Raw data received: {data} (length: {len(data)})")
                    # Convert to hex for easier debugging
                    hex_data = ' '.join(f'{b:02x}' for b in data)
                    #print(f"Read #{read_count}: Hex data: {hex_data}")
                    process_device_data(bytes(data), cfg, _midi)
                else:
                    empty_read_count += 1
                    if empty_read_count % 1000 == 0:  # Print occasionally to show it's still running
                        print(f"Still listening... ({empty_read_count} empty reads)")
                    # Small sleep to prevent CPU spinning, but short enough for responsive signal handling
                    time.sleep(0.001)
                    
            except OSError as e:
                # Handle device disconnection
                if "read error" in str(e).lower() or "device" in str(e).lower():
                    print(f"Device disconnected or error: {e}")
                    break
                print(f"Error reading from device: {e}")
                time.sleep(0.1)
            except Exception as e:
                print(f"Unexpected error: {e}")
                time.sleep(0.1)
                
    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt")
        cleanup_resources()
        sys.exit(0)
    except Exception as e:
        print(f"\nUnexpected error in main loop: {e}")
        cleanup_resources()
        sys.exit(1)


if __name__ == "__main__":
    main()

