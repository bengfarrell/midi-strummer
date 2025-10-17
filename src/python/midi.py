import time
import threading
from typing import List, Optional
import rtmidi
from note import Note, NoteObject
from midievent import MidiConnectionEvent, MidiNoteEvent, NOTE_EVENT, CONNECTION_EVENT
from eventlistener import EventEmitter


class Midi(EventEmitter):
    def __init__(self):
        super().__init__()
        self.midi_out: Optional[rtmidi.MidiOut] = None
        self.midi_in: Optional[rtmidi.MidiIn] = None
        self.outs: List[rtmidi.MidiOut] = []
        self.inputs: List[rtmidi.MidiIn] = []
        self._current_input_id: Optional[str] = None
        self._notes: List[str] = []

    @property
    def current_input(self) -> Optional[rtmidi.MidiIn]:
        """Get current MIDI input"""
        return self.midi_in

    @property
    def notes(self) -> List[str]:
        """Get current notes"""
        return self._notes

    def refresh_connection(self, midi_input_id: Optional[str] = None) -> None:
        """Refresh MIDI connections"""
        try:
            # Initialize MIDI output
            self.midi_out = rtmidi.MidiOut()
            available_outputs = self.midi_out.get_ports()
            print(f"Available MIDI output ports: {available_outputs}")
            
            output_port = None
            if available_outputs:
                self.midi_out.open_port(0)
                output_port = available_outputs[0]
                print(f"Opened MIDI output port: {output_port}")
            else:
                print("WARNING: No MIDI output ports available")
            
            # Initialize MIDI input
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            print(f"Available MIDI input ports: {available_inputs}")
            
            input_port = None
            if available_inputs:
                port_index = 0
                if midi_input_id is not None:
                    port_index = self._resolve_input_id(midi_input_id, available_inputs)
                else:
                    self._current_input_id = "0"
                
                self.midi_in.open_port(port_index)
                input_port = available_inputs[port_index]
                print(f"Opened MIDI input port {port_index}: {input_port}")
                
                # Set up MIDI input callback
                self.midi_in.set_callback(self._midi_callback)
                print("MIDI input callback registered")
            else:
                print("WARNING: No MIDI input ports available")
            
            print(f"✓ MIDI connections established successfully")
            
            # Emit connection event with proper event object
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(
                    connected=True,
                    input_port=input_port,
                    output_port=output_port
                )
            )
            
        except Exception as e:
            print(f'✗ Failed to get MIDI access - {e}')
            import traceback
            traceback.print_exc()
            
            # Emit disconnection event
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(connected=False)
            )
    
    def _resolve_input_id(self, midi_input_id: str, available_inputs: List[str]) -> int:
        """Resolve input ID to port index."""
        try:
            port_index = int(midi_input_id)
            if 0 <= port_index < len(available_inputs):
                self._current_input_id = midi_input_id
                return port_index
            else:
                print(f"WARNING: Invalid MIDI input index {midi_input_id}, using port 0")
                self._current_input_id = "0"
                return 0
        except ValueError:
            # Try to find port by name
            for idx, port_name in enumerate(available_inputs):
                if port_name == midi_input_id or midi_input_id in port_name:
                    self._current_input_id = str(idx)
                    print(f"Found MIDI input port '{midi_input_id}' at index {idx}")
                    return idx
            
            print(f"WARNING: MIDI input port '{midi_input_id}' not found, using port 0")
            self._current_input_id = "0"
            return 0

    def _midi_callback(self, event, data=None) -> None:
        """Handle incoming MIDI messages"""
        message, deltatime = event
        print(f"MIDI callback triggered - Message: {message}, Deltatime: {deltatime}")
        
        if len(message) >= 3:
            command, note, velocity = message[0], message[1], message[2]
            print(f"Command: {command}, Note: {note}, Velocity: {velocity}")
            
            notation_list = [*Note.sharp_notations, *Note.sharp_notations]
            notation = notation_list[note % len(Note.sharp_notations)]
            octave = note // len(Note.sharp_notations) - 1
            
            if command == 144:  # Note on message
                if velocity > 0:
                    print(f"Note ON: {notation}{octave}")
                    self.on_note_down(notation, octave)
                else:
                    print(f"Note OFF (via velocity 0): {notation}{octave}")
                    self.on_note_up(notation, octave)
            elif command == 128:  # Note off message
                print(f"Note OFF: {notation}{octave}")
                self.on_note_up(notation, octave)
        else:
            print(f"MIDI message too short: {message}")

    def send_note(self, note: NoteObject, velocity: int, duration: float = 0.1) -> None:
        """Send a MIDI note with non-blocking note-off"""
        if self.midi_out:
            midi_note = Note.notation_to_midi(note.notation + str(note.octave))
            note_on_message = [0x90, midi_note, velocity]
            note_off_message = [0x80, midi_note, 0x40]
            
            # Send note-on immediately
            self.midi_out.send_message(note_on_message)
            
            # Schedule note-off in a separate thread to avoid blocking
            def send_note_off():
                time.sleep(duration)
                if self.midi_out:
                    self.midi_out.send_message(note_off_message)
            
            threading.Thread(target=send_note_off, daemon=True).start()

    def on_note_down(self, notation: str, octave: int) -> None:
        """Handle note down event"""
        note_str = notation + str(octave)
        if note_str not in self._notes:
            self._notes.append(note_str)
            self._notes = Note.sort(self._notes)
            print(f"Note added - Current notes: {self._notes}")
            
            # Emit event with proper event object
            self.emit(
                NOTE_EVENT,
                MidiNoteEvent(
                    notes=self._notes.copy(),
                    added=note_str
                )
            )
        else:
            print(f"Note {note_str} already in list")

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
        """Choose MIDI input by ID (can be port index or port name)"""
        try:
            if self.midi_in:
                self.midi_in.close_port()
            
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            
            port_index = self._resolve_input_id(input_id, available_inputs)
            
            self.midi_in.open_port(port_index)
            self.midi_in.set_callback(self._midi_callback)
            
            input_port = available_inputs[port_index]
            print(f"Switched to MIDI input port {port_index}: {input_port}")
            
            # Emit connection event
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(
                    connected=True,
                    input_port=input_port
                )
            )
        except Exception as e:
            print(f"Error choosing MIDI input: {e}")
            self.emit(
                CONNECTION_EVENT,
                MidiConnectionEvent(connected=False)
            )

    def close(self) -> None:
        """Close MIDI connections"""
        if self.midi_out:
            self.midi_out.close_port()
        if self.midi_in:
            self.midi_in.close_port()
        
        # Emit disconnection event
        self.emit(
            CONNECTION_EVENT,
            MidiConnectionEvent(connected=False)
        )

