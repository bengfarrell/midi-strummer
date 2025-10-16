"""
MIDI Strummer Python Implementation

A Python port of the MIDI Strummer application that processes tablet input
and generates MIDI output for musical performance.
"""

__version__ = "1.0.0"
__author__ = "Converted from TypeScript/Node.js implementation"

from .server import main
from .strummer import strummer
from .midi import Midi
from .nodemidi import NodeMidi
from .note import Note, NoteObject

__all__ = [
    'main',
    'strummer', 
    'Midi',
    'NodeMidi',
    'Note',
    'NoteObject'
]

