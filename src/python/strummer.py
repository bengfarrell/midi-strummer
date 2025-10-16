from typing import List, Optional, Dict, Any
from note import NoteObject

class Strummer:
    def __init__(self):
        self._width: float = 1.0
        self._height: float = 1.0
        self._notes: List[NoteObject] = []
        self.last_x: float = -1.0
        self.last_strummed_index: int = -1

    @property
    def notes(self) -> List[NoteObject]:
        return self._notes

    @notes.setter
    def notes(self, notes: List[NoteObject]) -> None:
        self._notes = notes
        self.update_bounds(self._width, self._height)

    def strum(self, x: float, y: float, pressure: float, tilt_x: float, tilt_y: float) -> Optional[Dict[str, Any]]:
        """Process strumming input and return note/velocity if triggered"""
        if len(self._notes) > 0:
            string_width = self._width / len(self._notes)
            index = min(int(x / string_width), len(self._notes) - 1)
            self.last_x = x
            
            if self.last_strummed_index != index:
                self.last_strummed_index = index
                return {
                    'note': self._notes[index],
                    'velocity': int(pressure * 127)
                }
        return None

    def clear_strum(self) -> None:
        """Clear the last strummed index"""
        self.last_strummed_index = -1

    def update_bounds(self, width: float, height: float) -> None:
        """Update the bounds of the strummer"""
        self._width = width
        self._height = height


# Global strummer instance
strummer = Strummer()

