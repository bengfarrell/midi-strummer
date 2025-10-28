"""
MIDI Strummer Python Implementation

A Python port of the MIDI Strummer application that processes tablet input
and generates MIDI output for musical performance.
"""

__version__ = "1.0.0"
__author__ = "Converted from TypeScript/Node.js implementation"

from .main import main
from .strummer import strummer
from .midi import Midi
from .note import Note, NoteObject

__all__ = [
    'main',
    'strummer', 
    'Midi',
    'Note',
    'NoteObject'
]

