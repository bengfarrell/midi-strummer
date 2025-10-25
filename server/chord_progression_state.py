"""
Chord progression state management.
Tracks current position in a chord progression and provides navigation.
"""

from typing import List, Optional
from note import Note


class ChordProgressionState:
    """
    Manages the state of a chord progression, tracking the current index
    and providing methods to navigate through the progression.
    """
    
    def __init__(self):
        """Initialize chord progression state."""
        self.progression_name: Optional[str] = None
        self.chords: List[str] = []
        self.current_index: int = 0
    
    def load_progression(self, progression_name: str) -> bool:
        """
        Load a chord progression by name.
        
        Args:
            progression_name: Name of the progression to load
            
        Returns:
            True if progression was loaded successfully, False otherwise
        """
        # Ensure chord progressions are loaded
        Note.load_chord_progressions()
        
        if progression_name not in Note.chord_progressions:
            print(f"[ChordProgressionState] Unknown progression: {progression_name}")
            return False
        
        self.progression_name = progression_name
        self.chords = Note.chord_progressions[progression_name]
        self.current_index = 0
        
        print(f"[ChordProgressionState] Loaded progression '{progression_name}' with {len(self.chords)} chords")
        return True
    
    def set_index(self, index: int) -> int:
        """
        Set the current index to a specific position (with wrapping).
        
        Args:
            index: Index to set (can be any integer, will wrap around)
            
        Returns:
            The actual index after wrapping
        """
        if not self.chords:
            print("[ChordProgressionState] No progression loaded")
            return 0
        
        # Wrap the index using modulo
        self.current_index = index % len(self.chords)
        return self.current_index
    
    def increment_index(self, amount: int = 1) -> int:
        """
        Increment the current index by a given amount (with wrapping).
        
        Args:
            amount: Amount to increment (can be negative, will wrap around)
            
        Returns:
            The new index after incrementing and wrapping
        """
        if not self.chords:
            print("[ChordProgressionState] No progression loaded")
            return 0
        
        # Add amount and wrap using modulo
        self.current_index = (self.current_index + amount) % len(self.chords)
        return self.current_index
    
    def get_current_chord(self) -> Optional[str]:
        """
        Get the chord at the current index.
        
        Returns:
            The current chord notation, or None if no progression is loaded
        """
        if not self.chords:
            return None
        
        return self.chords[self.current_index]
    
    def get_chord_at_index(self, index: int) -> Optional[str]:
        """
        Get the chord at a specific index (with wrapping).
        
        Args:
            index: Index to retrieve (will wrap around)
            
        Returns:
            The chord at the given index, or None if no progression is loaded
        """
        if not self.chords:
            return None
        
        wrapped_index = index % len(self.chords)
        return self.chords[wrapped_index]
    
    def get_info(self) -> dict:
        """
        Get information about the current progression state.
        
        Returns:
            Dictionary with progression info
        """
        return {
            'progression_name': self.progression_name,
            'total_chords': len(self.chords),
            'current_index': self.current_index,
            'current_chord': self.get_current_chord(),
            'chords': self.chords
        }
    
    def reset(self) -> None:
        """Reset to the beginning of the progression."""
        self.current_index = 0

