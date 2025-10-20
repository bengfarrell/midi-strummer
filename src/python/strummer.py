from typing import List, Optional, Dict, Any
from note import NoteObject

class Strummer:
    def __init__(self):
        self._width: float = 1.0
        self._height: float = 1.0
        self._notes: List[NoteObject] = []
        self.last_x: float = -1.0
        self.last_strummed_index: int = -1
        self.last_pressure: float = 0.0
        self.pressure_threshold: float = 0.1  # Minimum pressure to trigger a strum

    @property
    def notes(self) -> List[NoteObject]:
        return self._notes

    @notes.setter
    def notes(self, notes: List[NoteObject]) -> None:
        self._notes = notes
        self.update_bounds(self._width, self._height)

    def strum(self, x: float, y: float, pressure: float, tilt_x: float, tilt_y: float) -> Optional[Dict[str, Any]]:
        """Process strumming input and return dict with type and notes/velocities if triggered"""
        if len(self._notes) > 0:
            string_width = self._width / len(self._notes)
            index = min(int(x / string_width), len(self._notes) - 1)
            
            # Detect pressure transitions (pen down/up)
            pressure_down = self.last_pressure < self.pressure_threshold and pressure >= self.pressure_threshold
            pressure_up = self.last_pressure >= self.pressure_threshold and pressure < self.pressure_threshold
            
            # Reset strummed index when pressure is released
            if pressure_up:
                self.last_strummed_index = -1
                self.last_pressure = pressure
                return None
            
            self.last_x = x
            self.last_pressure = pressure
            
            # Trigger strum if:
            # 1. Index changed (moving across strings), OR
            # 2. Pressure just went from low to high (tap/press down)
            # BUT ONLY if we have sufficient pressure
            has_sufficient_pressure = pressure >= self.pressure_threshold
            if has_sufficient_pressure and (self.last_strummed_index != index or pressure_down):
                # Calculate all strings crossed between last and current position
                notes_to_play = []
                
                if self.last_strummed_index == -1 or pressure_down:
                    # First strum or new tap - just play this note
                    note = self._notes[index]
                    notes_to_play.append({
                        'note': note,
                        'velocity': int(pressure * 127)
                    })
                else:
                    # Play all intermediate notes between last and current index
                    start = min(self.last_strummed_index, index)
                    end = max(self.last_strummed_index, index)
                    
                    # Determine direction for proper ordering
                    if self.last_strummed_index < index:
                        # Moving right/forward
                        indices = range(self.last_strummed_index + 1, index + 1)
                    else:
                        # Moving left/backward  
                        indices = range(self.last_strummed_index - 1, index - 1, -1)
                    
                    for i in indices:
                        note = self._notes[i]
                        notes_to_play.append({
                            'note': note,
                            'velocity': int(pressure * 127)
                        })
                
                self.last_strummed_index = index
                return {'type': 'strum', 'notes': notes_to_play} if notes_to_play else None
        return None

    def clear_strum(self) -> None:
        """Clear the last strummed index and pressure"""
        self.last_strummed_index = -1
        self.last_pressure = 0.0

    def update_bounds(self, width: float, height: float) -> None:
        """Update the bounds of the strummer"""
        self._width = width
        self._height = height


# Global strummer instance
strummer = Strummer()

