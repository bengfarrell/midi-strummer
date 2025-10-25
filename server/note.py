from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import math
import json
import os


@dataclass
class NoteObject:
    notation: str
    octave: int
    secondary: bool = False
    
    def transpose(self, semitones: int) -> 'NoteObject':
        """Transpose the note by a given number of semitones"""
        if semitones == 0:
            return self
        
        # Convert to MIDI note number
        from note import Note
        try:
            note_index = Note.sharp_notations.index(self.notation)
        except ValueError:
            try:
                note_index = Note.flat_notations.index(self.notation)
            except ValueError:
                note_index = 0
        
        midi_number = self.octave * 12 + note_index
        
        # Add semitones
        transposed_midi = midi_number + semitones
        
        # Convert back to notation and octave
        new_octave = transposed_midi // 12
        new_note_index = transposed_midi % 12
        
        # Prefer to use the same notation style (sharp vs flat) as the original
        if '#' in self.notation:
            new_notation = Note.sharp_notations[new_note_index]
        elif 'b' in self.notation:
            new_notation = Note.flat_notations[new_note_index]
        else:
            new_notation = Note.sharp_notations[new_note_index]
        
        return NoteObject(notation=new_notation, octave=new_octave, secondary=self.secondary)


class Note:
    """Note static class"""
    
    # Cached key signature lookup table
    keys: Dict[str, Any] = {}
    
    common_notations = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
    
    # Incremental tones as sharp notation
    sharp_notations = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    
    # Incremental tones as flat notation
    flat_notations = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
    
    # Odd notations
    odd_notations = ["B#", "Cb", "E#", "Fb"]
    
    # Corrected notations
    corrected_notations = ["C", "C", "F", "F"]
    
    # Chord progression presets (loaded from JSON file)
    chord_progressions: Dict[str, List[str]] = {}
    
    # Track if progressions have been loaded
    _progressions_loaded = False

    @classmethod
    def load_chord_progressions(cls) -> None:
        """
        Load chord progressions from JSON file.
        Called automatically on first access, but can be called manually.
        """
        if cls._progressions_loaded:
            return
        
        # Find the chord_progressions.json file
        # Check in the same directory as this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        progressions_file = os.path.join(current_dir, 'chord_progressions.json')
        
        if not os.path.exists(progressions_file):
            print(f"[NOTE] Warning: chord_progressions.json not found at {progressions_file}")
            print("[NOTE] Chord progression presets will not be available")
            cls._progressions_loaded = True
            return
        
        try:
            with open(progressions_file, 'r') as f:
                progressions_data = json.load(f)
            
            # Flatten the nested structure (categories -> progressions)
            for category, progressions in progressions_data.items():
                cls.chord_progressions.update(progressions)
            
            cls._progressions_loaded = True
            print(f"[NOTE] Loaded {len(cls.chord_progressions)} chord progression presets")
            
        except json.JSONDecodeError as e:
            print(f"[NOTE] Error parsing chord_progressions.json: {e}")
            cls._progressions_loaded = True
        except Exception as e:
            print(f"[NOTE] Error loading chord_progressions.json: {e}")
            cls._progressions_loaded = True
    
    @classmethod
    def index_of_notation(cls, notation: str) -> int:
        """Get notation index when notation is either flat or sharp"""
        try:
            return cls.sharp_notations.index(notation)
        except ValueError:
            try:
                return cls.flat_notations.index(notation)
            except ValueError:
                return -1

    @classmethod
    def notation_at_index(cls, index: int, prefer_flat: bool = False) -> str:
        """Get notation given an index"""
        if index >= len(cls.sharp_notations):
            index = index % len(cls.sharp_notations)
        
        if prefer_flat:
            return cls.flat_notations[index]
        else:
            return cls.sharp_notations[index]

    @classmethod
    def midi_to_notation(cls, index: int) -> str:
        """Translate index from MIDI to notation"""
        position = index % len(cls.sharp_notations)
        return cls.sharp_notations[position]

    @classmethod
    def notation_to_midi(cls, notation: str) -> int:
        """Translate notation and octave to MIDI index"""
        nt_obj = cls.parse_notation(notation)
        try:
            nt_indx = cls.sharp_notations.index(nt_obj.notation)
        except ValueError:
            try:
                nt_indx = cls.flat_notations.index(nt_obj.notation)
            except ValueError:
                nt_indx = 0
        return nt_obj.octave * len(cls.sharp_notations) + nt_indx

    @classmethod
    def sort(cls, notes: List[str]) -> List[str]:
        """Sort notes by octave and then by notation"""
        def sort_key(note: str):
            octave = int(note[-1]) if note[-1].isdigit() else 4
            notation = note[:-1] if note[-1].isdigit() else note
            try:
                notation_index = cls.sharp_notations.index(notation)
            except ValueError:
                notation_index = 0
            return (octave, notation_index)
        
        return sorted(notes, key=sort_key)

    @classmethod
    def parse_notation(cls, notation: str) -> NoteObject:
        """Parse notation to notation and octave"""
        # Only supports one digit octaves
        octave_char = notation[-1]
        if octave_char.isdigit():
            octave = int(octave_char)
            if len(notation) == 3:
                note_notation = notation[:2]
            else:
                note_notation = notation[0]
        else:
            octave = 4  # default
            note_notation = notation
        
        return NoteObject(notation=note_notation, octave=octave)

    @classmethod
    def get_frequency_for_notation(cls, nt: str) -> Optional[float]:
        """Turn a notation into a frequency"""
        octave = 4
        
        # Does notation include the octave?
        if nt[-1].isdigit():
            octave = int(nt[-1])
            nt = nt[:-1]
        
        # Correct any flat/sharps that resolve to a natural
        if nt in cls.odd_notations:
            nt = cls.corrected_notations[cls.odd_notations.index(nt)]
        
        try:
            indx = cls.sharp_notations.index(nt)
        except ValueError:
            try:
                indx = cls.flat_notations.index(nt)
            except ValueError:
                return None
        
        indx += (octave - 4) * len(cls.sharp_notations)
        freq = 440 * (2 ** (indx / 12))
        return freq

    @classmethod
    def notes_in_key_signature(cls, key: str, major: bool, octave: Optional[int] = None) -> List[str]:
        """Get notes in a specific key signature"""
        key = key.upper()
        
        # Correct any flat/sharps that resolve to a natural
        if key in cls.odd_notations:
            key = cls.corrected_notations[cls.odd_notations.index(key)]
        
        # Find the correct note and notation
        if key in cls.sharp_notations:
            notes_to_index = cls.sharp_notations.copy()
            start_pos = cls.sharp_notations.index(key)
        else:
            notes_to_index = cls.flat_notations.copy()
            start_pos = cls.flat_notations.index(key)
        
        # Double the array length
        original_length = len(notes_to_index)
        for c in range(original_length):
            if octave is not None:
                notes_to_index.append(notes_to_index[c] + str(octave + 1))
            else:
                notes_to_index.append(notes_to_index[c])
        
        # Add octave notation to the first half of the array
        if octave is not None:
            for c in range(len(cls.flat_notations)):
                notes_to_index[c] += str(octave)
        
        # Chop off the front of the array to start at the root key
        notes_to_index = notes_to_index[start_pos:]
        
        notes_in_key = []
        
        # Build the key signature
        if major:
            # MAJOR: whole step, whole step, half step, whole step, whole step, whole step, half step
            indices = [0, 2, 4, 5, 7, 9, 11]
        else:
            # MINOR: whole step, half step, whole step, whole step, half step, whole step, whole step
            indices = [0, 2, 3, 5, 7, 8, 10]
        
        for idx in indices:
            if idx < len(notes_to_index):
                notes_in_key.append(notes_to_index[idx])
        
        return notes_in_key

    @classmethod
    def generate_key_signature_lookup(cls):
        """Pregenerate a key signature lookup table for every note"""
        for key in cls.sharp_notations:
            cls.keys[key] = cls.notes_in_key_signature(key, True)
            cls.keys[key + 'm'] = cls.notes_in_key_signature(key, False)

    @classmethod
    def parse_chord(cls, chord_notation: str, octave: int = 4) -> List[NoteObject]:
        """
        Parse a chord notation into a list of notes.
        
        Args:
            chord_notation: Chord notation (e.g., "C", "Gm", "Am7", "Fmaj7", "Ddim", "Esus4")
            octave: Base octave for the root note (default: 4)
            
        Returns:
            List of NoteObject instances representing the chord
        """
        # Define chord intervals (semitones from root)
        chord_intervals = {
            # Triads
            'maj': [0, 4, 7],           # Major triad
            'min': [0, 3, 7],           # Minor triad
            'm': [0, 3, 7],             # Minor triad (short form)
            'dim': [0, 3, 6],           # Diminished triad
            'aug': [0, 4, 8],           # Augmented triad
            'sus2': [0, 2, 7],          # Suspended 2nd
            'sus4': [0, 5, 7],          # Suspended 4th
            '5': [0, 7],                # Power chord (root + fifth)
            
            # Seventh chords
            '7': [0, 4, 7, 10],         # Dominant 7th
            'maj7': [0, 4, 7, 11],      # Major 7th
            'min7': [0, 3, 7, 10],      # Minor 7th
            'm7': [0, 3, 7, 10],        # Minor 7th (short form)
            'dim7': [0, 3, 6, 9],       # Diminished 7th
            'aug7': [0, 4, 8, 10],      # Augmented 7th
            'maj9': [0, 4, 7, 11, 14],  # Major 9th
            'min9': [0, 3, 7, 10, 14],  # Minor 9th
            'm9': [0, 3, 7, 10, 14],    # Minor 9th (short form)
            '9': [0, 4, 7, 10, 14],     # Dominant 9th
            
            # Extended chords
            'add9': [0, 4, 7, 14],      # Major add 9
            '6': [0, 4, 7, 9],          # Major 6th
            'min6': [0, 3, 7, 9],       # Minor 6th
            'm6': [0, 3, 7, 9],         # Minor 6th (short form)
        }
        
        # Parse the root note and chord type
        # Extract root note (first 1-2 characters)
        if len(chord_notation) >= 2 and chord_notation[1] in ['#', 'b']:
            root = chord_notation[:2]
            chord_type = chord_notation[2:]
        else:
            root = chord_notation[0]
            chord_type = chord_notation[1:]
        
        # Default to major triad if no chord type specified
        if not chord_type:
            chord_type = 'maj'
        
        # Get the intervals for this chord type
        intervals = chord_intervals.get(chord_type)
        if intervals is None:
            # Unknown chord type, default to major triad
            print(f"[NOTE] Unknown chord type '{chord_type}', defaulting to major triad")
            intervals = chord_intervals['maj']
        
        # Parse the root note
        root_note = cls.parse_notation(root + str(octave))
        root_index = cls.index_of_notation(root_note.notation)
        
        # Build the chord notes
        chord_notes = []
        for interval in intervals:
            note_index = (root_index + interval) % 12
            # Calculate which octave this note should be in
            note_octave = octave + (root_index + interval) // 12
            
            notation = cls.sharp_notations[note_index]
            chord_notes.append(NoteObject(notation=notation, octave=note_octave))
        
        return chord_notes
    
    @classmethod
    def fill_note_spread(cls, notes: List[NoteObject], lower_spread: int = 0, upper_spread: int = 0) -> List[NoteObject]:
        """Fill note spread with upper and lower notes"""
        # If no notes provided, return empty list
        if not notes:
            return []
        
        upper = []
        for c in range(upper_spread):
            note_index = c % len(notes)
            octave_increase = c // len(notes)
            upper.append(NoteObject(
                notation=notes[note_index].notation,
                octave=notes[note_index].octave + octave_increase + 1,
                secondary=True
            ))
        
        lower = []
        for c in range(lower_spread):
            note_index = c % len(notes)
            octave_decrease = c // len(notes)
            reverse_index = len(notes) - 1 - note_index
            lower.append(NoteObject(
                notation=notes[reverse_index].notation,
                octave=notes[reverse_index].octave - octave_decrease - 1,
                secondary=True
            ))
        
        return [*lower, *notes, *upper]

