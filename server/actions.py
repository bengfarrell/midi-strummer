"""
Action handlers for stylus button and other input actions.
Provides a centralized way to handle user actions like toggling features.
"""

from typing import Dict, Any, Optional, Union, List
from config import Config
from strummer import strummer
from note import Note
from chord_progression_state import ChordProgressionState
from eventlistener import EventEmitter


class Actions(EventEmitter):
    """
    Handles various user actions that can be triggered by stylus buttons or other inputs.
    
    Actions are executed through the execute() method by passing an action definition.
    Actions can be specified as:
    - A string: "toggle-repeater"
    - An array: ["transpose", 12] where first item is action name, rest are parameters
    - Nested arrays: ["set-strum-notes", ["C4", "E4", "G4"]] for complex parameters
    - Chord notation: ["set-strum-chord", "Cmaj7", 3] for chord-based note setting
    """
    
    def __init__(self, config: Config):
        """
        Initialize Actions with a configuration instance.
        
        Args:
            config: Configuration instance that will be modified by actions
        """
        super().__init__()
        self.config = config
        
        # Map action names to handler methods
        self._action_handlers = {
            'toggle-repeater': self.toggle_repeater,
            'transpose': self.transpose,
            'set-strum-notes': self.set_strum_notes,
            'set-strum-chord': self.set_strum_chord,
            'set-chord-in-progression': self.set_chord_in_progression,
            'increment-chord-in-progression': self.increment_chord_in_progression,
        }
        
        # Chord progression state
        self.progression_state = ChordProgressionState()
    
    def execute(self, action_def: Union[str, List, None], context: Optional[Dict[str, Any]] = None) -> bool:
        """
        Execute an action by definition.
        
        Args:
            action_def: Action definition - can be:
                       - String: "toggle-repeater"
                       - List: ["transpose", 12] (action name + parameters)
                       - Nested list: ["set-strum-notes", ["C4", "E4", "G4"]]
                       - None/empty: no action
            context: Optional context data for the action (e.g., which button triggered it)
            
        Returns:
            True if action was executed successfully, False if action not found or invalid
        """
        if action_def is None or action_def == 'none' or action_def == '':
            return False
        
        # Parse action definition
        if isinstance(action_def, str):
            action_name = action_def
            params = []
        elif isinstance(action_def, list) and len(action_def) > 0:
            action_name = action_def[0]
            params = action_def[1:] if len(action_def) > 1 else []
        else:
            print(f"[ACTIONS] Warning: Invalid action definition: {action_def}")
            return False
        
        # Execute the action
        handler = self._action_handlers.get(action_name)
        if handler:
            handler(params, context or {})
            return True
        else:
            print(f"[ACTIONS] Warning: Unknown action '{action_name}'")
            return False
    
    def toggle_repeater(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Toggle the note repeater feature on/off.
        
        Args:
            params: Optional parameters (not used for this action)
            context: Context data (e.g., which button triggered the action)
        """
        note_repeater_cfg = self.config.get('noteRepeater', {})
        current_active = note_repeater_cfg.get('active', False)
        new_state = not current_active
        self.config.set('noteRepeater.active', new_state)
        
        # Log which button triggered the action if available
        button = context.get('button', 'Unknown')
        print(f"[ACTIONS] {button} button toggled repeater: {'ON' if new_state else 'OFF'}")
        
        # Emit config changed event
        self.emit('config_changed')
    
    def transpose(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Toggle transpose on/off with specified semitones.
        
        Args:
            params: Required parameters:
                   - params[0] (int): Semitones to transpose (e.g., 12 for one octave up)
            context: Context data (e.g., which button triggered the action)
        """
        if len(params) == 0 or not isinstance(params[0], (int, float)):
            print(f"[ACTIONS] Error: transpose action requires semitones parameter")
            return
        
        semitones = int(params[0])
        transpose_cfg = self.config.get('transpose', {})
        button = context.get('button', 'Unknown')
        
        # Toggle: if currently active with same semitones, turn off; otherwise turn on with new semitones
        if transpose_cfg.get('active', False) and transpose_cfg.get('semitones', 0) == semitones:
            # Turn off
            self.config.set('transpose.active', False)
            self.config.set('transpose.semitones', 0)
            print(f"[ACTIONS] {button} button disabled transpose")
        else:
            # Turn on with specified semitones
            self.config.set('transpose.active', True)
            self.config.set('transpose.semitones', semitones)
            print(f"[ACTIONS] {button} button enabled transpose: {semitones:+d} semitones")
        
        # Emit config changed event
        self.emit('config_changed')
    
    def get_transpose_semitones(self) -> int:
        """
        Get the current transpose semitones.
        
        Returns:
            Current transpose semitones (0 if transpose is not active)
        """
        transpose_cfg = self.config.get('transpose', {})
        if transpose_cfg.get('active', False):
            return transpose_cfg.get('semitones', 0)
        return 0
    
    def is_transpose_active(self) -> bool:
        """
        Check if transpose is currently active.
        
        Returns:
            True if transpose is active, False otherwise
        """
        transpose_cfg = self.config.get('transpose', {})
        return transpose_cfg.get('active', False)
    
    def set_strum_notes(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Set the strumming notes to a specific set of notes.
        
        Args:
            params: Required parameters:
                   - params[0] (list): Array of note strings in notation format (e.g., ["C4", "E4", "G4"])
            context: Context data (e.g., which button triggered the action)
        """
        if len(params) == 0 or not isinstance(params[0], list):
            print(f"[ACTIONS] Error: set-strum-notes action requires an array of note strings")
            return
        
        note_strings = params[0]
        
        # Validate that all items are strings
        if not all(isinstance(n, str) for n in note_strings):
            print(f"[ACTIONS] Error: set-strum-notes requires all notes to be strings")
            return
        
        if len(note_strings) == 0:
            print(f"[ACTIONS] Error: set-strum-notes requires at least one note")
            return
        
        try:
            # Parse note strings into Note objects
            notes = [Note.parse_notation(n) for n in note_strings]
            
            # Get note spread configuration
            strumming_cfg = self.config.get('strumming', {})
            lower_spread = strumming_cfg.get('lowerNoteSpread', 0)
            upper_spread = strumming_cfg.get('upperNoteSpread', 0)
            
            # Apply note spread and set strummer notes
            strummer.notes = Note.fill_note_spread(notes, lower_spread, upper_spread)
            
            # Log the action
            button = context.get('button', 'Unknown')
            note_names = ', '.join(note_strings)
            print(f"[ACTIONS] {button} button set strum notes: [{note_names}]")
            
            # Note: broadcast happens automatically via strummer's notes_changed event
            
        except Exception as e:
            print(f"[ACTIONS] Error parsing notes: {e}")
    
    def set_strum_chord(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Set the strumming notes using chord notation.
        
        Args:
            params: Required parameters:
                   - params[0] (str): Chord notation (e.g., "C", "Gm", "Am7", "Fmaj7")
                   - params[1] (int, optional): Octave (default: 4)
            context: Context data (e.g., which button triggered the action)
        """
        if len(params) == 0 or not isinstance(params[0], str):
            print(f"[ACTIONS] Error: set-strum-chord action requires chord notation string")
            return
        
        chord_notation = params[0]
        octave = 4  # Default octave
        
        # Check for optional octave parameter
        if len(params) > 1 and isinstance(params[1], (int, float)):
            octave = int(params[1])
        
        try:
            # Parse chord into notes
            notes = Note.parse_chord(chord_notation, octave)
            
            if not notes:
                print(f"[ACTIONS] Error: Failed to parse chord '{chord_notation}'")
                return
            
            # Get note spread configuration
            strumming_cfg = self.config.get('strumming', {})
            lower_spread = strumming_cfg.get('lowerNoteSpread', 0)
            upper_spread = strumming_cfg.get('upperNoteSpread', 0)
            
            # Apply note spread and set strummer notes
            strummer.notes = Note.fill_note_spread(notes, lower_spread, upper_spread)
            
            # Log the action
            button = context.get('button', 'Unknown')
            note_names = ', '.join([f"{n.notation}{n.octave}" for n in notes])
            print(f"[ACTIONS] {button} button set strum chord: {chord_notation} [{note_names}]")
            
            # Note: broadcast happens automatically via strummer's notes_changed event
            
        except Exception as e:
            print(f"[ACTIONS] Error parsing chord: {e}")
    
    def set_chord_in_progression(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Set the chord progression to a specific index and apply that chord.
        
        Args:
            params: Required parameters:
                   - params[0] (str): Progression name (e.g., "c-major-pop")
                   - params[1] (int): Index to set (wraps around if out of range)
                   - params[2] (int, optional): Octave (default: 4)
            context: Context data (e.g., which button triggered the action)
        """
        if len(params) < 2:
            print(f"[ACTIONS] Error: set-chord-in-progression requires progression name and index")
            return
        
        if not isinstance(params[0], str):
            print(f"[ACTIONS] Error: First parameter must be progression name (string)")
            return
        
        if not isinstance(params[1], (int, float)):
            print(f"[ACTIONS] Error: Second parameter must be index (integer)")
            return
        
        progression_name = params[0]
        index = int(params[1])
        octave = 4  # Default octave
        
        # Check for optional octave parameter
        if len(params) > 2 and isinstance(params[2], (int, float)):
            octave = int(params[2])
        
        # Load progression if different from current
        if self.progression_state.progression_name != progression_name:
            if not self.progression_state.load_progression(progression_name):
                return
        
        # Set the index
        actual_index = self.progression_state.set_index(index)
        chord_notation = self.progression_state.get_current_chord()
        
        if not chord_notation:
            print(f"[ACTIONS] Error: Could not get chord from progression")
            return
        
        try:
            # Parse chord into notes
            notes = Note.parse_chord(chord_notation, octave)
            
            if not notes:
                print(f"[ACTIONS] Error: Failed to parse chord '{chord_notation}'")
                return
            
            # Get note spread configuration
            strumming_cfg = self.config.get('strumming', {})
            lower_spread = strumming_cfg.get('lowerNoteSpread', 0)
            upper_spread = strumming_cfg.get('upperNoteSpread', 0)
            
            # Apply note spread and set strummer notes
            strummer.notes = Note.fill_note_spread(notes, lower_spread, upper_spread)
            
            # Log the action
            button = context.get('button', 'Unknown')
            print(f"[ACTIONS] {button} button set progression '{progression_name}' to index {actual_index}: {chord_notation}")
            
            # Note: broadcast happens automatically via strummer's notes_changed event
            
        except Exception as e:
            print(f"[ACTIONS] Error setting chord in progression: {e}")
    
    def increment_chord_in_progression(self, params: List[Any], context: Dict[str, Any]) -> None:
        """
        Increment the current chord progression index and apply that chord.
        
        Args:
            params: Required parameters:
                   - params[0] (str): Progression name (e.g., "c-major-pop")
                   - params[1] (int, optional): Amount to increment (default: 1, can be negative)
                   - params[2] (int, optional): Octave (default: 4)
            context: Context data (e.g., which button triggered the action)
        """
        if len(params) < 1:
            print(f"[ACTIONS] Error: increment-chord-in-progression requires progression name")
            return
        
        if not isinstance(params[0], str):
            print(f"[ACTIONS] Error: First parameter must be progression name (string)")
            return
        
        progression_name = params[0]
        increment_amount = 1  # Default increment
        octave = 4  # Default octave
        
        # Check for optional increment amount parameter
        if len(params) > 1 and isinstance(params[1], (int, float)):
            increment_amount = int(params[1])
        
        # Check for optional octave parameter
        if len(params) > 2 and isinstance(params[2], (int, float)):
            octave = int(params[2])
        
        # Load progression if different from current
        if self.progression_state.progression_name != progression_name:
            if not self.progression_state.load_progression(progression_name):
                return
        
        # Increment the index
        actual_index = self.progression_state.increment_index(increment_amount)
        chord_notation = self.progression_state.get_current_chord()
        
        if not chord_notation:
            print(f"[ACTIONS] Error: Could not get chord from progression")
            return
        
        try:
            # Parse chord into notes
            notes = Note.parse_chord(chord_notation, octave)
            
            if not notes:
                print(f"[ACTIONS] Error: Failed to parse chord '{chord_notation}'")
                return
            
            # Get note spread configuration
            strumming_cfg = self.config.get('strumming', {})
            lower_spread = strumming_cfg.get('lowerNoteSpread', 0)
            upper_spread = strumming_cfg.get('upperNoteSpread', 0)
            
            # Apply note spread and set strummer notes
            strummer.notes = Note.fill_note_spread(notes, lower_spread, upper_spread)
            
            # Log the action
            button = context.get('button', 'Unknown')
            direction = "forward" if increment_amount > 0 else "backward"
            print(f"[ACTIONS] {button} button incremented progression '{progression_name}' {direction} by {abs(increment_amount)} to index {actual_index}: {chord_notation}")
            
            # Note: broadcast happens automatically via strummer's notes_changed event
            
        except Exception as e:
            print(f"[ACTIONS] Error incrementing chord in progression: {e}")
    
    def register_action(self, action_name: str, handler_func) -> None:
        """
        Register a custom action handler.
        
        Args:
            action_name: Name of the action
            handler_func: Function to call when action is executed
                         Should accept (params: List[Any], context: Dict[str, Any]) parameters
        """
        self._action_handlers[action_name] = handler_func
        print(f"[ACTIONS] Registered custom action: {action_name}")
    
    def get_available_actions(self) -> list:
        """
        Get list of all available action names.
        
        Returns:
            List of action names that can be executed
        """
        return list(self._action_handlers.keys())

