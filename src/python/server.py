import json
import sys
import signal
import threading
import time
import atexit
import asyncio
import math
from typing import Dict, Any, Union, Optional, Callable
from dataclasses import asdict

from finddevice import get_tablet_device
from strummer import strummer
from midi import Midi
from midievent import MidiNoteEvent, NOTE_EVENT
from note import Note
from socketserver import SocketServer
from hidreader import HIDReader


def apply_velocity_curve(velocity: int, curve: float = 1.0) -> int:
    """
    Apply a velocity curve mapping to MIDI velocity values.
    
    Args:
        velocity: Linear MIDI velocity value (0 to 127)
        curve: Curve parameter that controls the response curve:
               - curve = 1.0: Linear (no change)
               - curve > 1.0: Logarithmic/exponential - makes low velocities more sensitive
               - curve < 1.0: Compressed - reduces sensitivity at low velocities
               
               Recommended values:
               - 1.0 = Linear (default/bypass)
               - 2.0 = Gentle curve
               - 3.0 = Moderate curve
               - 4.0 = Steep curve
    
    Returns:
        Curved MIDI velocity value (0 to 127)
    """
    if velocity <= 0:
        return 0
    if velocity >= 127:
        return 127
    if curve == 1.0:
        return velocity  # Linear passthrough for efficiency
    
    # Normalize to 0-1 range
    normalized = velocity / 127.0
    
    # Apply exponential curve: (e^(curve*x) - 1) / (e^curve - 1)
    curved = (math.exp(curve * normalized) - 1) / (math.exp(curve) - 1)
    
    return int(curved * 127)

# Global references for cleanup
_hid_reader = None
_midi = None
_socket_server = None
_event_loop = None
_loop_thread = None


def cleanup_resources():
    """Clean up device and MIDI resources"""
    global _hid_reader, _midi, _socket_server, _event_loop, _loop_thread
    
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
    
    # Stop and close HID reader
    if _hid_reader is not None:
        try:
            _hid_reader.stop()
            _hid_reader.close()
            _hid_reader = None
        except Exception as e:
            print(f"Error closing HID reader: {e}")
            _hid_reader = None
    
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
        with open('settings.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: settings.json not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing settings.json: {e}")
        sys.exit(1)


def on_midi_note_event(event: MidiNoteEvent, cfg: Dict[str, Any], socket_server: Optional[SocketServer] = None):
    """Handle MIDI note events - defined at module level to avoid garbage collection"""
    # Use notes from the event object instead of accessing midi.notes directly
    midi_notes = [Note.parse_notation(n) for n in event.notes]
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
    midi = Midi(midi_strum_channel=cfg.get('midiStrumChannel'))
    
    # Create a lambda that captures cfg and socket_server
    def handler(event):
        on_midi_note_event(event, cfg, socket_server)
    
    # Store handler reference to prevent garbage collection
    midi._note_handler = handler
    
    # Use Pythonic event handler registration
    midi.on(NOTE_EVENT, handler)
    midi.refresh_connection(cfg.get('midiInputId'))
    
    return midi


def update_config(cfg: Dict[str, Any], updates: Dict[str, Any]) -> None:
    """
    Update configuration with key-value pairs from incoming messages.
    Supports nested keys using dot notation (e.g., "device.product").
    """
    for key, value in updates.items():
        # Handle nested keys with dot notation
        if '.' in key:
            keys = key.split('.')
            target = cfg
            # Navigate to the nested dictionary
            for k in keys[:-1]:
                if k not in target:
                    target[k] = {}
                target = target[k]
            # Set the final value
            target[keys[-1]] = value
            print(f'[CONFIG] Updated {key} = {value}')
        else:
            # Direct key update
            cfg[key] = value
            print(f'[CONFIG] Updated {key} = {value}')


def start_socket_server(port: int, cfg: Dict[str, Any]) -> tuple[SocketServer, asyncio.AbstractEventLoop, threading.Thread]:
    """Start socket server in a separate thread with its own event loop"""
    
    # Create message handler that updates config
    def handle_message(data: Dict[str, Any]):
        """Handle incoming WebSocket messages"""
        try:
            update_config(cfg, data)
        except Exception as e:
            print(f'[SERVER] Error updating config: {e}')
    
    socket_server = SocketServer(on_message=handle_message, config=cfg)
    
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


def create_hid_data_handler(cfg: Dict[str, Any], midi: Midi) -> Callable[[Dict[str, Union[str, int, float]]], None]:
    """
    Create a callback function to handle processed HID data
    
    Args:
        cfg: Configuration dictionary
        midi: MIDI instance
        
    Returns:
        Callback function that processes HID data and sends MIDI messages
    """
    def handle_hid_data(result: Dict[str, Union[str, int, float]]) -> None:
        """Handle processed HID data - send MIDI messages based on strumming"""
        # Extract data values
        x = result.get('x', 0.0)
        y = result.get('y', 0.0)
        pressure = result.get('pressure', 0.0)
        tilt_x = result.get('tiltX', 0.0)
        tilt_y = result.get('tiltY', 0.0)
        
        # Send pitch bend if enabled (send continuously based on tilt)
        if cfg.get('allowPitchBend', False):
            xyTilt = math.sqrt(float(tilt_x) * float(tilt_x) + float(tilt_y) * float(tilt_y))
            clamping = cfg.get('pitchBend.clamp', [0,1])
            clampedXYTilt = max(clamping[0], min(xyTilt, clamping[1]))
            multiplier = cfg.get('pitchBend.multiplier', 1)
            midi.send_pitch_bend(clampedXYTilt * multiplier)
        
        # Get button press states and adjustments from config
        primary_button_pressed = result.get('primaryButtonPressed', False)
        secondary_button_pressed = result.get('secondaryButtonPressed', False)
        primary_adjustment = cfg.get('primaryButtonSemitoneAdjustment', 0)
        secondary_adjustment = cfg.get('secondaryButtonSemitoneAdjustment', 0)

        strum_result = strummer.strum(
            float(x), float(y), float(pressure), float(tilt_x), float(tilt_y),
            primary_button_pressed, secondary_button_pressed,
            primary_adjustment, secondary_adjustment
        )
        
        # Handle strum result based on type
        if strum_result:
            if strum_result.get('type') == 'strum':
                # Calculate note duration based on Y position
                # Center Y = max duration, edges (top/bottom) = min duration
                y_max = cfg.get('mappings.y.max', 1.0)
                y_center = y_max / 2.0
                distance_from_center = abs(float(y) - y_center)
                max_distance = y_center
                normalized_distance = min(distance_from_center / max_distance, 1.0)  # Clamp to 1.0
                
                max_duration = cfg.get('maxNoteDuration', 1.5)
                min_duration = cfg.get('minNoteDuration', 0.2)
                duration = max_duration - (normalized_distance * (max_duration - min_duration))
                
                # Play notes from strum
                for note_data in strum_result['notes']:
                    # Skip notes with velocity 0 (these would act as note-off in MIDI)
                    if note_data['velocity'] > 0:
                        # Apply velocity curve and multiplier
                        curve = cfg.get('noteVelocity', {}).get('curve', 1.0)
                        multiplier = cfg.get('noteVelocity', {}).get('multiplier', 1.0)
                        
                        # First apply curve, then multiply
                        curved_velocity = apply_velocity_curve(note_data['velocity'], curve)
                        final_velocity = int(curved_velocity * multiplier)
                        
                        # Clamp to valid MIDI range
                        final_velocity = max(0, min(127, final_velocity))
                        
                        midi.send_note(note_data['note'], final_velocity, duration)
    
    return handle_hid_data


def main():
    """Main application entry point"""
    global _hid_reader, _midi, _socket_server, _event_loop, _loop_thread
    
    # Register cleanup function to run on exit
    atexit.register(cleanup_resources)
    
    # Load configuration
    cfg = load_config()
    
    # Optionally start socket server
    if cfg.get('useSocketServer', False):
        port = cfg.get('socketServerPort', 8080)
        print(f"[SERVER] Starting WebSocket server on port {port}...")
        try:
            _socket_server, _event_loop, _loop_thread = start_socket_server(port, cfg)
            print(f"[SERVER] WebSocket server started successfully")
        except Exception as e:
            print(f"[SERVER] Failed to start WebSocket server: {e}")
            _socket_server = None
    else:
        print("[SERVER] WebSocket server disabled in configuration")
    
    # Setup MIDI and strummer
    _midi = setup_midi_and_strummer(cfg, _socket_server)
    
    # Get tablet device (optional)
    device = get_tablet_device(cfg['device'])
    if not device:
        print("HID device not available - continuing with MIDI-only mode")
        print("MIDI Strummer server started (MIDI-only mode). Press Ctrl+C to exit.")
    else:
        print("MIDI Strummer server started with HID device. Press Ctrl+C to exit.")
        # Create HID reader with callback
        data_handler = create_hid_data_handler(cfg, _midi)
        _hid_reader = HIDReader(device, cfg, data_handler)
    
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
    
    # Main device reading loop (only if device is available)
    try:
        if _hid_reader:
            # Start reading from HID device (blocking call)
            _hid_reader.start_reading()
        else:
            # No device available - just keep the application running for MIDI functionality
            while True:
                time.sleep(1.0)  # Keep the main thread alive
                
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

