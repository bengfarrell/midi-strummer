import time
from typing import List, Optional, Callable
import rtmidi
from note import Note, NoteObject
from midievent import MidiEvent
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
            
            # Initialize MIDI input
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            print(f"Available MIDI input ports: {available_inputs}")
            
            # Open first available output port
            if available_outputs:
                self.midi_out.open_port(0)
                print(f"Opened MIDI output port: {available_outputs[0]}")
            else:
                print("WARNING: No MIDI output ports available")
            
            # Open specified or first available input port
            if available_inputs:
                port_index = 0
                if midi_input_id is not None:
                    # Try to parse as integer first
                    try:
                        port_index = int(midi_input_id)
                        if 0 <= port_index < len(available_inputs):
                            self._current_input_id = midi_input_id
                        else:
                            print(f"WARNING: Invalid MIDI input index {midi_input_id}, using port 0")
                            port_index = 0
                            self._current_input_id = "0"
                    except ValueError:
                        # If not an integer, try to find port by name
                        found = False
                        for idx, port_name in enumerate(available_inputs):
                            if port_name == midi_input_id or midi_input_id in port_name:
                                port_index = idx
                                self._current_input_id = str(idx)
                                found = True
                                print(f"Found MIDI input port '{midi_input_id}' at index {idx}")
                                break
                        if not found:
                            print(f"WARNING: MIDI input port '{midi_input_id}' not found, using port 0")
                            port_index = 0
                            self._current_input_id = "0"
                else:
                    self._current_input_id = "0"
                
                self.midi_in.open_port(port_index)
                print(f"Opened MIDI input port {port_index}: {available_inputs[port_index]}")
                
                # Set up MIDI input callback
                self.midi_in.set_callback(self._midi_callback)
                print("MIDI input callback registered")
            else:
                print("WARNING: No MIDI input ports available")
            
            print(f"✓ MIDI connections established successfully")
            self.dispatch_event(MidiEvent(MidiEvent.CONNECTION_EVENT))
            
        except Exception as e:
            print(f'✗ Failed to get MIDI access - {e}')
            import traceback
            traceback.print_exc()

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

    def send_note(self, note: NoteObject, velocity: int) -> None:
        """Send a MIDI note"""
        if self.midi_out:
            midi_note = Note.notation_to_midi(note.notation + str(note.octave))
            note_on_message = [0x90, midi_note, velocity]
            note_off_message = [0x80, midi_note, 0x40]
            
            self.midi_out.send_message(note_on_message)
            # Schedule note off after 700ms (simplified - in real implementation you'd use threading)
            time.sleep(0.7)
            self.midi_out.send_message(note_off_message)

    def on_note_down(self, notation: str, octave: int) -> None:
        """Handle note down event"""
        note_str = notation + str(octave)
        if note_str not in self._notes:
            self._notes.append(note_str)
            self._notes = Note.sort(self._notes)
            print(f"Note added - Current notes: {self._notes}")
            self.dispatch_event(MidiEvent(MidiEvent.NOTE_EVENT))
        else:
            print(f"Note {note_str} already in list")

    def on_note_up(self, notation: str, octave: int) -> None:
        """Handle note up event"""
        note_str = notation + str(octave)
        if note_str in self._notes:
            self._notes.remove(note_str)
            self._notes = Note.sort(self._notes)
            print(f"Note removed - Current notes: {self._notes}")
            self.dispatch_event(MidiEvent(MidiEvent.NOTE_EVENT))
        else:
            print(f"Note {note_str} not in list to remove")

    def choose_input(self, input_id: str) -> None:
        """Choose MIDI input by ID (can be port index or port name)"""
        try:
            if self.midi_in:
                self.midi_in.close_port()
            
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            
            port_index = 0
            # Try to parse as integer first
            try:
                port_index = int(input_id)
                if not (0 <= port_index < len(available_inputs)):
                    print(f"Error: Invalid MIDI input index {input_id}")
                    return
            except ValueError:
                # If not an integer, try to find port by name
                found = False
                for idx, port_name in enumerate(available_inputs):
                    if port_name == input_id or input_id in port_name:
                        port_index = idx
                        found = True
                        break
                if not found:
                    print(f"Error: MIDI input port '{input_id}' not found")
                    return
            
            self.midi_in.open_port(port_index)
            self._current_input_id = str(port_index)
            self.midi_in.set_callback(self._midi_callback)
            print(f"Switched to MIDI input port {port_index}: {available_inputs[port_index]}")
            self.dispatch_event(MidiEvent(MidiEvent.CONNECTION_EVENT))
        except Exception as e:
            print(f"Error choosing MIDI input: {e}")

    def close(self) -> None:
        """Close MIDI connections"""
        if self.midi_out:
            self.midi_out.close_port()
        if self.midi_in:
            self.midi_in.close_port()

