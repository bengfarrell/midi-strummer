import time
import threading
import queue
from typing import List, Optional, Tuple
try:
    import jack
except ImportError:
    jack = None
from note import Note, NoteObject
from midievent import MidiConnectionEvent, MidiNoteEvent, NOTE_EVENT, CONNECTION_EVENT
from eventlistener import EventEmitter


class JackMidi(EventEmitter):
    """
    Jack MIDI implementation compatible with the Midi interface.
    Outputs MIDI through Jack Audio Connection Kit for integration with Zynthian and other Jack-based systems.
    
    IMPORTANT: Jack MIDI events must be sent from within the process callback for real-time performance.
    This implementation uses a queue to pass events from Python threads to the Jack process callback.
    """
    
    def __init__(self, midi_strum_channel: Optional[int] = None, client_name: str = "midi_strummer"):
        super().__init__()
        
        if jack is None:
            raise ImportError(
                "JACK-Client library not installed. "
                "Install with: pip install JACK-Client"
            )
        
        self.client_name = client_name
        self._midi_strum_channel: Optional[int] = midi_strum_channel
        self._notes: List[str] = []
        self._active_note_timers: dict = {}  # Track active note-off timers
        self._timer_lock = threading.Lock()
        self._note_start_times: dict = {}  # Track when each note started
        
        # Jack client and ports
        self.jack_client: Optional[jack.Client] = None
        self.midi_out_port: Optional[jack.MidiPort] = None
        self.midi_in_port: Optional[jack.MidiPort] = None
        
        # MIDI event queue for real-time processing
        # Queue items are tuples: (timestamp_offset, midi_message_bytes)
        self._midi_queue: queue.Queue = queue.Queue(maxsize=1000)
        
        # Debug tracking
        self._events_sent_count: int = 0
        self._last_callback_error: Optional[str] = None
        
        # MIDI input callback support
        self._current_input_id: Optional[str] = None
    
    @property
    def current_input(self):
        """Get current MIDI input (Jack port)"""
        return self.midi_in_port
    
    @property
    def notes(self) -> List[str]:
        """Get current notes"""
        return self._notes
    
    def refresh_connection(self, midi_input_id: Optional[str] = None) -> None:
        """Initialize Jack MIDI connections"""
        try:
            # Create Jack client
            self.jack_client = jack.Client(self.client_name)
            
            # Register MIDI output port
            self.midi_out_port = self.jack_client.midi_outports.register('midi_out')
            
            # Register MIDI input port
            self.midi_in_port = self.jack_client.midi_inports.register('midi_in')
            
            # Set up process callback for handling incoming MIDI
            self.jack_client.set_process_callback(self._process_callback)
            
            # Activate the client
            self.jack_client.activate()
            
            print(f"[Jack MIDI] ✓ Client '{self.client_name}' activated")
            print(f"[Jack MIDI] ✓ Output port: {self.jack_client.name}:{self.midi_out_port.name}")
            print(f"[Jack MIDI] ✓ Input port: {self.jack_client.name}:{self.midi_in_port.name}")
            print(f"[Jack MIDI] ✓ Sample rate: {self.jack_client.samplerate} Hz")
            print(f"[Jack MIDI] ✓ Buffer size: {self.jack_client.blocksize} frames")
            print()
            print("=" * 60)
            print("🎵 JACK MIDI IS ACTIVE - ZYNTHIAN SETUP:")
            print("=" * 60)
            
            # List available synth engines to connect to
            try:
                all_ports = self.jack_client.get_ports(is_midi=True, is_input=True)
                if all_ports:
                    print("Available MIDI Input Ports (Synths):")
                    for port in all_ports:
                        if 'strumboli' not in port.name.lower():
                            print(f"  • {port.name}")
                    print()
                    print("TO CONNECT IN ZYNTHIAN:")
                    print("  1. Go to Main Menu → Audio Mixer")
                    print("  2. Look for 'strumboli:midi_out' in MIDI sources")
                    print("  3. Connect it to your active synth")
                    print()
                    print("OR CONNECT MANUALLY VIA SSH:")
                    synth_ports = [p.name for p in all_ports if 'strumboli' not in p.name.lower()]
                    if synth_ports:
                        example_synth = synth_ports[0]
                        print(f"  jack_connect {self.jack_client.name}:{self.midi_out_port.name} {example_synth}")
                    print()
                else:
                    print("⚠ No MIDI input ports found")
                    print("  Start a synth engine in Zynthian first, then connect")
                    print()
            except Exception as e:
                print(f"⚠ Could not list ports: {e}")
                print()
            
            print("=" * 60)
            print()
            
            # Auto-connect to ZynMidiRouter if available (for Zynthian)
            self._auto_connect_to_synths()
            
            # Emit connection event
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(
                    connected=True,
                    input_port=f"{self.jack_client.name}:{self.midi_in_port.name}",
                    output_port=f"{self.jack_client.name}:{self.midi_out_port.name}"
                )
            )
            
        except Exception as e:
            print(f'✗ Failed to initialize Jack MIDI - {e}')
            import traceback
            traceback.print_exc()
            
            # Emit disconnection event
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(connected=False)
            )
    
    def _process_callback(self, frames: int) -> None:
        """
        Jack process callback for handling incoming/outgoing MIDI.
        This runs in the Jack audio thread - keep it real-time safe!
        """
        # Clear the output port buffer
        self.midi_out_port.clear_buffer()
        
        # Send all queued MIDI events
        events_sent = 0
        while not self._midi_queue.empty():
            try:
                offset, midi_message = self._midi_queue.get_nowait()
                self.midi_out_port.write_midi_event(offset, midi_message)
                events_sent += 1
            except queue.Empty:
                break
            except Exception as e:
                # Store exception for later (can't print in callback)
                self._last_callback_error = str(e)
        
        # Debug: track if we're sending events
        if events_sent > 0:
            self._events_sent_count = getattr(self, '_events_sent_count', 0) + events_sent
        
        # Process incoming MIDI events
        for offset, data in self.midi_in_port.incoming_midi_events():
            if len(data) >= 3:
                command, note, velocity = data[0], data[1], data[2]
                notation_list = [*Note.sharp_notations, *Note.sharp_notations]
                notation = notation_list[note % len(Note.sharp_notations)]
                octave = note // len(Note.sharp_notations) - 1
                
                if command == 0x90:  # Note on message
                    if velocity > 0:
                        self.on_note_down(notation, octave)
                    else:
                        self.on_note_up(notation, octave)
                elif command == 0x80:  # Note off message
                    self.on_note_up(notation, octave)
    
    def _auto_connect_to_synths(self) -> None:
        """
        Auto-connect to available synths/MIDI routers.
        Tries ZynMidiRouter first (Zynthian), then other synths.
        """
        if not self.jack_client or not self.midi_out_port:
            return
        
        try:
            # Get all MIDI input ports
            all_ports = self.jack_client.get_ports(is_midi=True, is_input=True)
            
            # Priority 1: Try to connect to ZynMidiRouter (Zynthian's MIDI router)
            zyn_router_ports = [p for p in all_ports if 'ZynMidiRouter' in p.name and 'dev0_in' in p.name]
            if zyn_router_ports:
                try:
                    self.jack_client.connect(self.midi_out_port, zyn_router_ports[0])
                    print(f"✅ AUTO-CONNECTED to {zyn_router_ports[0].name}")
                    print(f"   Your tablet is now ready to play Chain 0!")
                    print()
                    return
                except Exception as e:
                    print(f"⚠ Could not auto-connect to {zyn_router_ports[0].name}: {e}")
            
            # Priority 2: Try common synth engines
            common_synths = ['ZynAddSubFX', 'setBfree', 'FluidSynth', 'LinuxSampler']
            for synth_name in common_synths:
                synth_ports = [p for p in all_ports if synth_name in p.name and 'midi_in' in p.name.lower()]
                if synth_ports:
                    try:
                        self.jack_client.connect(self.midi_out_port, synth_ports[0])
                        print(f"✅ AUTO-CONNECTED to {synth_ports[0].name}")
                        print(f"   Your tablet is now ready to play!")
                        print()
                        return
                    except Exception as e:
                        print(f"⚠ Could not auto-connect to {synth_ports[0].name}: {e}")
            
            # Priority 3: Try first available synth (excluding system/internal ports)
            user_synths = [p for p in all_ports 
                          if 'strumboli' not in p.name.lower() 
                          and 'system' not in p.name.lower()
                          and 'ttymidi' not in p.name.lower()
                          and 'a2j' not in p.name.lower()
                          and 'Midi Through' not in p.name]
            
            if user_synths:
                try:
                    self.jack_client.connect(self.midi_out_port, user_synths[0])
                    print(f"✅ AUTO-CONNECTED to {user_synths[0].name}")
                    print(f"   Your tablet is now ready to play!")
                    print()
                    return
                except Exception as e:
                    print(f"⚠ Could not auto-connect to {user_synths[0].name}: {e}")
            
            # No suitable ports found
            print("⚠ No synths found to auto-connect to")
            print("  Load a synth in Zynthian, then manually connect with:")
            print(f"  jack_connect {self.jack_client.name}:{self.midi_out_port.name} ZynMidiRouter:dev0_in")
            print()
            
        except Exception as e:
            print(f"⚠ Auto-connect error: {e}")
            print()
    
    def _queue_midi_event(self, midi_message: bytes, offset: int = 0) -> None:
        """
        Queue a MIDI event to be sent in the next process callback.
        This is thread-safe and can be called from any thread.
        """
        try:
            self._midi_queue.put_nowait((offset, midi_message))
            print(f"[Jack MIDI] Queued event: {midi_message.hex()} (queue size: {self._midi_queue.qsize()})")
        except queue.Full:
            print("[Jack MIDI] Warning: MIDI queue full, dropping event")
    
    def send_pitch_bend(self, bend_value: float) -> None:
        """
        Send a pitch bend message.
        
        Args:
            bend_value: Float between -1.0 (full down) and 1.0 (full up), 0 is center
        """
        if not self.jack_client or not self.midi_out_port:
            return
        
        # Clamp bend_value to valid range
        bend_value = max(-1.0, min(1.0, bend_value))
        
        # Convert to 14-bit MIDI pitch bend value (0-16383, center is 8192)
        midi_bend = int((bend_value + 1.0) * 8192)
        midi_bend = max(0, min(16383, midi_bend))
        
        # Split into LSB and MSB (7 bits each)
        lsb = midi_bend & 0x7F
        msb = (midi_bend >> 7) & 0x7F
        
        # Determine which channels to send on
        if self._midi_strum_channel is not None:
            channels = [self._midi_strum_channel - 1]
        else:
            channels = list(range(16))
        
        # Queue pitch bend messages (0xE0 + channel)
        for channel in channels:
            pitch_bend_message = bytes([0xE0 + channel, lsb, msb])
            self._queue_midi_event(pitch_bend_message)
    
    def release_notes(self, notes: List[NoteObject]) -> None:
        """Immediately release specific notes by canceling timers and sending note-offs"""
        if not self.jack_client or not self.midi_out_port or not notes:
            return
        
        # Determine which channels to send on
        if self._midi_strum_channel is not None:
            channels = [self._midi_strum_channel - 1]
        else:
            channels = list(range(16))
        
        # Convert notes to MIDI note numbers and release them
        for note in notes:
            midi_note = Note.notation_to_midi(note.notation + str(note.octave))
            note_key = (midi_note, tuple(channels))
            
            # Cancel the timer if it exists
            with self._timer_lock:
                if note_key in self._active_note_timers:
                    timer = self._active_note_timers[note_key]
                    timer.cancel()
                    del self._active_note_timers[note_key]
                if note_key in self._note_start_times:
                    del self._note_start_times[note_key]
            
            # Queue note-off messages
            for channel in channels:
                note_off_message = bytes([0x80 + channel, midi_note, 0x40])
                print(f"[Jack MIDI] Sending NOTE_OFF: channel={channel+1}, note={midi_note}")
                self._queue_midi_event(note_off_message)
    
    def send_note(self, note: NoteObject, velocity: int, duration: float = 1.5) -> None:
        """Send a MIDI note with non-blocking note-off"""
        if not self.jack_client or not self.midi_out_port:
            return
        
        midi_note = Note.notation_to_midi(note.notation + str(note.octave))
        
        # Determine which channels to send on
        if self._midi_strum_channel is not None:
            channels = [self._midi_strum_channel - 1]
        else:
            channels = list(range(16))
        
        # Create unique key for this note+channels combination
        note_key = (midi_note, tuple(channels))
        
        # Cancel any existing timer for this note to prevent premature note-off
        with self._timer_lock:
            if note_key in self._active_note_timers:
                old_timer = self._active_note_timers[note_key]
                old_timer.cancel()
                del self._active_note_timers[note_key]
        
        # Queue note-on messages
        for channel in channels:
            note_on_message = bytes([0x90 + channel, midi_note, velocity])
            # Only log first few notes to avoid spam
            if not hasattr(self, '_note_count'):
                self._note_count = 0
            if self._note_count < 5:
                print(f"[Jack MIDI] Sending NOTE_ON: channel={channel+1}, note={midi_note}, velocity={velocity}")
                self._note_count += 1
            elif self._note_count == 5:
                print(f"[Jack MIDI] (Further MIDI events will not be logged - Jack is working!)")
                self._note_count += 1
            self._queue_midi_event(note_on_message)
        
        # Track when this note started
        with self._timer_lock:
            self._note_start_times[note_key] = time.time()
        
        # Schedule note-off with a timer that can be cancelled
        def send_note_off():
            if self.jack_client and self.midi_out_port:
                for channel in channels:
                    note_off_message = bytes([0x80 + channel, midi_note, 0x40])
                    self._queue_midi_event(note_off_message)
            
            # Remove this timer from active timers
            with self._timer_lock:
                if note_key in self._active_note_timers:
                    del self._active_note_timers[note_key]
                if note_key in self._note_start_times:
                    del self._note_start_times[note_key]
        
        # Create and store the timer
        timer = threading.Timer(duration, send_note_off)
        timer.daemon = True
        with self._timer_lock:
            self._active_note_timers[note_key] = timer
        timer.start()
    
    def send_raw_note(self, midi_note: int, velocity: int, channel: Optional[int] = None, duration: float = 1.5) -> None:
        """
        Send a raw MIDI note number on a specific channel with non-blocking note-off
        
        Args:
            midi_note: MIDI note number (0-127)
            velocity: MIDI velocity (0-127)
            channel: MIDI channel (1-16), or None to use strum channel or all channels
            duration: Duration in seconds before note-off
        """
        if not self.jack_client or not self.midi_out_port:
            return
        
        # Determine which channel to send on
        if channel is not None:
            channels = [channel - 1]
        elif self._midi_strum_channel is not None:
            channels = [self._midi_strum_channel - 1]
        else:
            channels = list(range(16))
        
        # Create unique key for this note+channels combination
        note_key = (midi_note, tuple(channels))
        
        # Cancel any existing timer for this note to prevent premature note-off
        with self._timer_lock:
            if note_key in self._active_note_timers:
                old_timer = self._active_note_timers[note_key]
                old_timer.cancel()
                del self._active_note_timers[note_key]
        
        # Queue note-on messages
        for ch in channels:
            note_on_message = bytes([0x90 + ch, midi_note, velocity])
            self._queue_midi_event(note_on_message)
        
        # Track when this note started
        with self._timer_lock:
            self._note_start_times[note_key] = time.time()
        
        # Schedule note-off with a timer that can be cancelled
        def send_note_off():
            if self.jack_client and self.midi_out_port:
                for ch in channels:
                    note_off_message = bytes([0x80 + ch, midi_note, 0x40])
                    self._queue_midi_event(note_off_message)
            
            # Remove this timer from active timers
            with self._timer_lock:
                if note_key in self._active_note_timers:
                    del self._active_note_timers[note_key]
                if note_key in self._note_start_times:
                    del self._note_start_times[note_key]
        
        timer = threading.Timer(duration, send_note_off)
        timer.daemon = True
        
        # Store timer to allow cancellation
        with self._timer_lock:
            self._active_note_timers[note_key] = timer
        
        timer.start()
    
    def on_note_down(self, notation: str, octave: int) -> None:
        """Handle note down event"""
        note_str = notation + str(octave)
        if note_str not in self._notes:
            self._notes.append(note_str)
            self._notes = Note.sort(self._notes)
            
            # Emit event with proper event object
            self.emit(
                NOTE_EVENT,
                MidiNoteEvent(
                    notes=self._notes.copy(),
                    added=note_str
                )
            )
    
    def on_note_up(self, notation: str, octave: int) -> None:
        """Handle note up event"""
        note_str = notation + str(octave)
        if note_str in self._notes:
            self._notes.remove(note_str)
            self._notes = Note.sort(self._notes)
            
            # Emit event with proper event object
            self.emit(
                NOTE_EVENT,
                MidiNoteEvent(
                    notes=self._notes.copy(),
                    removed=note_str
                )
            )
    
    def choose_input(self, input_id: str) -> None:
        """Choose MIDI input - for Jack, this is handled via external connections"""
        print(f"[Jack MIDI] Input selection not applicable - use Jack connection tools to route MIDI")
        self._current_input_id = input_id
    
    def close(self) -> None:
        """Close Jack MIDI connections"""
        # Cancel all active note timers
        with self._timer_lock:
            for timer in self._active_note_timers.values():
                timer.cancel()
            self._active_note_timers.clear()
            self._note_start_times.clear()
        
        if self.jack_client:
            try:
                self.jack_client.deactivate()
                self.jack_client.close()
                print("[Jack MIDI] Client closed")
            except Exception as e:
                print(f"[Jack MIDI] Error closing client: {e}")
        
        # Emit disconnection event
        self.emit(
            CONNECTION_EVENT,
            MidiConnectionEvent(connected=False)
        )

