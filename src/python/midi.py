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
            
            # Initialize MIDI input
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            
            # Open first available output port
            if available_outputs:
                self.midi_out.open_port(0)
            
            # Open specified or first available input port
            if available_inputs:
                if midi_input_id is not None:
                    try:
                        port_index = int(midi_input_id)
                        if 0 <= port_index < len(available_inputs):
                            self.midi_in.open_port(port_index)
                            self._current_input_id = midi_input_id
                    except (ValueError, IndexError):
                        self.midi_in.open_port(0)
                        self._current_input_id = "0"
                else:
                    self.midi_in.open_port(0)
                    self._current_input_id = "0"
                
                # Set up MIDI input callback
                self.midi_in.set_callback(self._midi_callback)
            
            self.dispatch_event(MidiEvent(MidiEvent.CONNECTION_EVENT))
            
        except Exception as e:
            print(f'Failed to get MIDI access - {e}')

    def _midi_callback(self, event, data=None) -> None:
        """Handle incoming MIDI messages"""
        message, deltatime = event
        if len(message) >= 3:
            command, note, velocity = message[0], message[1], message[2]
            notation_list = [*Note.sharp_notations, *Note.sharp_notations]
            notation = notation_list[note % len(Note.sharp_notations)]
            octave = note // len(Note.sharp_notations) - 1
            
            if command == 144:  # Note on message
                if velocity > 0:
                    self.on_note_down(notation, octave)
                else:
                    self.on_note_up(notation, octave)

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
            self.dispatch_event(MidiEvent(MidiEvent.NOTE_EVENT))

    def on_note_up(self, notation: str, octave: int) -> None:
        """Handle note up event"""
        note_str = notation + str(octave)
        if note_str in self._notes:
            self._notes.remove(note_str)
            self._notes = Note.sort(self._notes)
            self.dispatch_event(MidiEvent(MidiEvent.NOTE_EVENT))

    def choose_input(self, input_id: str) -> None:
        """Choose MIDI input by ID"""
        try:
            port_index = int(input_id)
            if self.midi_in:
                self.midi_in.close_port()
            
            self.midi_in = rtmidi.MidiIn()
            available_inputs = self.midi_in.get_ports()
            
            if 0 <= port_index < len(available_inputs):
                self.midi_in.open_port(port_index)
                self._current_input_id = input_id
                self.midi_in.set_callback(self._midi_callback)
                self.dispatch_event(MidiEvent(MidiEvent.CONNECTION_EVENT))
        except (ValueError, IndexError) as e:
            print(f"Error choosing MIDI input: {e}")

    def close(self) -> None:
        """Close MIDI connections"""
        if self.midi_out:
            self.midi_out.close_port()
        if self.midi_in:
            self.midi_in.close_port()

