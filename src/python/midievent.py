"""
Pythonic MIDI event definitions using dataclasses.
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class MidiConnectionEvent:
    """Event fired when MIDI connection status changes."""
    connected: bool
    input_port: Optional[str] = None
    output_port: Optional[str] = None


@dataclass  
class MidiNoteEvent:
    """Event fired when MIDI notes change."""
    notes: List[str]  # List of active note strings like ['C4', 'E4', 'G4']
    added: Optional[str] = None  # Note that was just added (if any)
    removed: Optional[str] = None  # Note that was just removed (if any)


# Event type constants
NOTE_EVENT = 'note'
CONNECTION_EVENT = 'connection'

