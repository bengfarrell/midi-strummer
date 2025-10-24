import json
import sys
import os
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
from datahelpers import apply_effect
from config import Config

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


def find_settings_file() -> str:
    """
    Find settings.json file in various locations.
    Checks (in order):
    1. Same directory as executable/script
    2. Parent directory (for bundled apps)
    3. Current working directory
    4. User's home directory
    """
    # Get the directory where the executable/script is located
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        app_dir = os.path.dirname(sys.executable)
        # For macOS .app bundles, also check parent directories
        if sys.platform == 'darwin' and '.app/Contents/MacOS' in app_dir:
            # Try the .app/Contents/Resources directory
            bundle_dir = os.path.join(app_dir, '..', 'Resources')
            if os.path.exists(os.path.join(bundle_dir, 'settings.json')):
                return os.path.join(bundle_dir, 'settings.json')
            # Try the directory containing the .app bundle
            parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(app_dir)))
            if os.path.exists(os.path.join(parent_dir, 'settings.json')):
                return os.path.join(parent_dir, 'settings.json')
    else:
        # Running as script
        app_dir = os.path.dirname(os.path.abspath(__file__))
    
    # List of paths to check
    search_paths = [
        os.path.join(app_dir, 'settings.json'),
        os.path.join(os.path.dirname(app_dir), 'settings.json'),
        os.path.join(os.getcwd(), 'settings.json'),
        os.path.join(os.path.expanduser('~'), 'settings.json'),
    ]
    
    for path in search_paths:
        if os.path.exists(path):
            return path
    
    return None


def load_config() -> Config:
    """Load configuration from settings.json with fallback to defaults"""
    settings_path = find_settings_file()
    
    if settings_path is None:
        print("Warning: settings.json not found")
        print("\nSearched in:")
        print("  - Application directory")
        print("  - Parent directory")
        print("  - Current working directory")
        print("  - Home directory")
        print("\nUsing default configuration.")
        return Config()
    
    print(f"Loading configuration from: {settings_path}")
    return Config.from_file(settings_path)


def on_midi_note_event(event: MidiNoteEvent, cfg: Config, socket_server: Optional[SocketServer] = None):
    """Handle MIDI note events - defined at module level to avoid garbage collection"""
    # Use notes from the event object instead of accessing midi.notes directly
    midi_notes = [Note.parse_notation(n) for n in event.notes]
    strumming_cfg = cfg.get('strumming', {})
    strummer.notes = Note.fill_note_spread(
        midi_notes,
        strumming_cfg.get('lowerNoteSpread', 0),
        strumming_cfg.get('upperNoteSpread', 0)
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


def setup_midi_and_strummer(cfg: Config, socket_server: Optional[SocketServer] = None) -> Midi:
    """Setup MIDI connection and strummer configuration"""
    # Configure strummer parameters
    strumming_cfg = cfg.get('strumming', {})
    strummer.configure(
        pluck_velocity_scale=strumming_cfg.get('pluckVelocityScale', 4.0),
        pressure_threshold=strumming_cfg.get('pressureThreshold', 0.1)
    )
    
    # Initialize strummer with initial notes if provided
    strumming_cfg = cfg.get('strumming', {})
    if 'initialNotes' in strumming_cfg and strumming_cfg['initialNotes']:
        initial_notes = [Note.parse_notation(n) for n in strumming_cfg['initialNotes']]
        strummer.notes = Note.fill_note_spread(
            initial_notes, 
            strumming_cfg.get('lowerNoteSpread', 0), 
            strumming_cfg.get('upperNoteSpread', 0)
        )
    
    # Setup MIDI
    midi = Midi(midi_strum_channel=cfg.get('strumming', {}).get('midiChannel'))
    
    # Create a lambda that captures cfg and socket_server
    def handler(event):
        on_midi_note_event(event, cfg, socket_server)
    
    # Store handler reference to prevent garbage collection
    midi._note_handler = handler
    
    # Use Pythonic event handler registration
    midi.on(NOTE_EVENT, handler)
    midi.refresh_connection(cfg.get('midiInputId'))
    
    return midi


def update_config(cfg: Config, updates: Dict[str, Any]) -> None:
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


def start_socket_server(port: int, cfg: Config) -> tuple[SocketServer, asyncio.AbstractEventLoop, threading.Thread]:
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


def create_hid_data_handler(cfg: Config, midi: Midi) -> Callable[[Dict[str, Union[str, int, float]]], None]:
    """
    Create a callback function to handle processed HID data
    
    Args:
        cfg: Configuration instance
        midi: MIDI instance
        
    Returns:
        Callback function that processes HID data and sends MIDI messages
    """
    # Storage for note repeater feature
    repeater_state = {
        'notes': [],
        'last_repeat_time': 0,
        'is_holding': False
    }
    
    def handle_hid_data(result: Dict[str, Union[str, int, float]]) -> None:
        """Handle processed HID data - send MIDI messages based on strumming"""
        
        # Extract raw data values
        x = result.get('x', 0.0)
        y = result.get('y', 0.0)
        pressure = result.get('pressure', 0.0)
        tilt_x = result.get('tiltX', 0.0)
        tilt_y = result.get('tiltY', 0.0)
        
        # Calculate all possible input values (normalized 0-1)
        y_val = float(y)
        pressure_val = float(pressure)
        tilt_x_val = float(tilt_x)
        tilt_y_val = float(tilt_y)
        tilt_xy_val = math.sqrt(tilt_x_val * tilt_x_val + tilt_y_val * tilt_y_val)
        
        # Create mapping of control names to input values
        control_inputs = {
            'yaxis': y_val,
            'pressure': pressure_val,
            'tiltX': tilt_x_val,
            'tiltY': tilt_y_val,
            'tiltXY': tilt_xy_val
        }
        
        # Get effect configurations
        pitch_bend_cfg = cfg.get('pitchBend', {})
        note_duration_cfg = cfg.get('noteDuration', {})
        note_velocity_cfg = cfg.get('noteVelocity', {})
        
        # Apply pitch bend effect
        bend_value = apply_effect(pitch_bend_cfg, control_inputs, 'pitchBend')
        midi.send_pitch_bend(bend_value)
        
        # Apply note duration and velocity effects
        duration = apply_effect(note_duration_cfg, control_inputs, 'noteDuration')
        velocity = apply_effect(note_velocity_cfg, control_inputs, 'noteVelocity')
        
        strum_result = strummer.strum(float(x), float(pressure))
        
        # Get note repeater configuration
        note_repeater_cfg = cfg.get('noteRepeater', {})
        note_repeater_enabled = note_repeater_cfg.get('active', False)
        pressure_multiplier = note_repeater_cfg.get('pressureMultiplier', 1.0)
        frequency_multiplier = note_repeater_cfg.get('frequencyMultiplier', 1.0)
        
        # Handle strum result based on type
        if strum_result:
            if strum_result.get('type') == 'strum':
                # Store notes for repeater and mark as holding
                repeater_state['notes'] = strum_result['notes']
                repeater_state['is_holding'] = True
                repeater_state['last_repeat_time'] = time.time()
                
                # Play notes from strum
                for note_data in strum_result['notes']:
                    # Skip notes with velocity 0 (these would act as note-off in MIDI)
                    if note_data['velocity'] > 0:
                        midi.send_note(note_data['note'], note_data['velocity'], duration)
            
            elif strum_result.get('type') == 'release':
                # Stop holding - no more repeats
                repeater_state['is_holding'] = False
                repeater_state['notes'] = []
                
                # Handle strum release - send configured MIDI note
                strum_release_cfg = cfg.get('strumRelease', {})
                release_note = strum_release_cfg.get('midiNote')
                release_channel = strum_release_cfg.get('midiChannel')
                release_max_duration = strum_release_cfg.get('maxDuration', 0.25)
                release_velocity_multiplier = strum_release_cfg.get('velocityMultiplier', 1.0)
                
                # Only trigger release note if duration is within the max duration threshold
                if release_note is not None and duration <= release_max_duration:
                    # Use the velocity from the strum and apply multiplier
                    base_velocity = strum_result.get('velocity', 64)
                    release_velocity = int(base_velocity * release_velocity_multiplier)
                    # Clamp to MIDI range 1-127
                    release_velocity = max(1, min(127, release_velocity))
                    # Send the raw MIDI note on the specified channel
                    midi.send_raw_note(release_note, release_velocity, release_channel, duration)
        
        # Handle note repeater - fire repeatedly while holding
        if note_repeater_enabled and repeater_state['is_holding'] and repeater_state['notes']:
            current_time = time.time()
            time_since_last_repeat = current_time - repeater_state['last_repeat_time']
            
            # Apply frequency multiplier to duration (higher = faster repeats)
            repeat_interval = duration / frequency_multiplier if frequency_multiplier > 0 else duration
            
            # Check if it's time for another repeat
            if time_since_last_repeat >= repeat_interval:
                # Apply pressure multiplier to velocity
                repeat_velocity = int(velocity * pressure_multiplier)
                # Clamp to MIDI range 1-127
                repeat_velocity = max(1, min(127, repeat_velocity))
                
                for note_data in repeater_state['notes']:
                    if repeat_velocity > 0:
                        midi.send_note(note_data['note'], repeat_velocity, duration)
                
                repeater_state['last_repeat_time'] = current_time
    
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
    # Extract only device identification keys, not mappings
    device_filter = {k: v for k, v in cfg['device'].items() if k != 'mappings'}
    device = get_tablet_device(device_filter)
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

