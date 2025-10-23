import json
from typing import Dict, Any, Optional
from pathlib import Path


class Config:
    """
    Configuration manager for MIDI Strummer.
    Provides hard-coded defaults that can be overridden by JSON settings.
    """
    
    # Default configuration values
    DEFAULTS = {
        "device": {
            "product": "Deco 640",
            "usage": 1,
            "interface": 2
        },
        "useSocketServer": True,
        "noteDuration": {
            "min": 0.15,
            "max": 1.5,
            "multiplier": 1.0,
            "curve": 1.0,
            "spread": "inverse",
            "control": "tiltXY",
            "default": 1.0
        },
        "pitchBend": {
            "min": -1.0,
            "max": 1.0,
            "multiplier": 1.0,
            "curve": 4.0,
            "spread": "central",
            "control": "yaxis",
            "default": 0.0
        },
        "noteVelocity": {
            "min": 0,
            "max": 127,
            "multiplier": 1.0,
            "curve": 4.0,
            "spread": "direct",
            "control": "pressure",
            "default": 64
        },
        "socketServerPort": 8080,
        "midiInputId": None,
        "midiStrumChannel": None,
        "initialNotes": ["C4", "E4", "G4"],
        "upperNoteSpread": 3,
        "lowerNoteSpread": 3,
        "strumming": {
            "pluckVelocityScale": 4.0,
            "pressureThreshold": 0.1,
            "releaseMIDINote": 38,
            "releaseMIDIChannel": None,
            "releaseMaxDuration": 0.25,
            "releaseVelocityMultiplier": 1.0
        },
        "mappings": {
            "status": {
                "byteIndex": 1,
                "max": 63,
                "type": "code",
                "values": {
                    "192": {"state": "none"},
                    "160": {"state": "hover"},
                    "162": {"state": "hover", "secondaryButtonPressed": True},
                    "164": {"state": "hover", "primaryButtonPressed": True},
                    "161": {"state": "contact"},
                    "163": {"state": "contact", "secondaryButtonPressed": True},
                    "165": {"state": "contact", "primaryButtonPressed": True},
                    "240": {"state": "buttons"}
                }
            },
            "x": {"byteIndex": 3, "max": 124, "type": "range"},
            "y": {"byteIndex": 5, "max": 70, "type": "range"},
            "pressure": {"byteIndex": 7, "max": 63, "type": "range"},
            "tiltX": {
                "byteIndex": 8,
                "positiveMax": 60,
                "negativeMin": 256,
                "negativeMax": 196,
                "type": "wrapped-range"
            },
            "tiltY": {
                "byteIndex": 9,
                "positiveMax": 60,
                "negativeMin": 256,
                "negativeMax": 196,
                "type": "wrapped-range"
            }
        }
    }
    
    def __init__(self, config_dict: Optional[Dict[str, Any]] = None):
        """
        Initialize configuration with optional overrides.
        
        Args:
            config_dict: Optional dictionary to override defaults
        """
        self._config = self._deep_merge(self.DEFAULTS.copy(), config_dict or {})
    
    @classmethod
    def from_file(cls, file_path: str) -> 'Config':
        """
        Load configuration from a JSON file.
        
        Args:
            file_path: Path to JSON configuration file
            
        Returns:
            Config instance with loaded settings
        """
        path = Path(file_path)
        if not path.exists():
            print(f"Warning: Config file '{file_path}' not found. Using defaults.")
            return cls()
        
        try:
            with open(path, 'r') as f:
                config_dict = json.load(f)
            print(f"Loaded configuration from '{file_path}'")
            return cls(config_dict)
        except json.JSONDecodeError as e:
            print(f"Error parsing config file '{file_path}': {e}")
            print("Using default configuration.")
            return cls()
        except Exception as e:
            print(f"Error loading config file '{file_path}': {e}")
            print("Using default configuration.")
            return cls()
    
    def _deep_merge(self, base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep merge two dictionaries, with override taking precedence.
        
        Args:
            base: Base dictionary (defaults)
            override: Dictionary with override values
            
        Returns:
            Merged dictionary
        """
        result = base.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                # Recursively merge nested dictionaries
                result[key] = self._deep_merge(result[key], value)
            else:
                # Override the value
                result[key] = value
        
        return result
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value by key.
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        return self._config.get(key, default)
    
    def __getitem__(self, key: str) -> Any:
        """Allow dictionary-style access."""
        return self._config[key]
    
    def __setitem__(self, key: str, value: Any) -> None:
        """Allow dictionary-style assignment."""
        self._config[key] = value
    
    def __contains__(self, key: str) -> bool:
        """Support 'in' operator."""
        return key in self._config
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Get the full configuration as a dictionary.
        
        Returns:
            Complete configuration dictionary
        """
        return self._config.copy()
    
    def save(self, file_path: str) -> bool:
        """
        Save current configuration to a JSON file.
        
        Args:
            file_path: Path to save the configuration
            
        Returns:
            True if successful, False otherwise
        """
        try:
            path = Path(file_path)
            with open(path, 'w') as f:
                json.dump(self._config, f, indent=2)
            print(f"Configuration saved to '{file_path}'")
            return True
        except Exception as e:
            print(f"Error saving config to '{file_path}': {e}")
            return False
    
    # Convenience properties for common config values
    
    @property
    def device(self) -> Dict[str, Any]:
        """Get device configuration."""
        return self._config.get('device', {})
    
    @property
    def use_socket_server(self) -> bool:
        """Get whether to use socket server."""
        return self._config.get('useSocketServer', True)
    
    @property
    def socket_server_port(self) -> int:
        """Get socket server port."""
        return self._config.get('socketServerPort', 8080)
    
    @property
    def midi_input_id(self) -> Optional[str]:
        """Get MIDI input ID."""
        return self._config.get('midiInputId')
    
    @property
    def midi_strum_channel(self) -> Optional[int]:
        """Get MIDI strum channel."""
        return self._config.get('midiStrumChannel')
    
    @property
    def initial_notes(self) -> list:
        """Get initial notes."""
        return self._config.get('initialNotes', ["C4", "E4", "G4"])
    
    @property
    def upper_note_spread(self) -> int:
        """Get upper note spread."""
        return self._config.get('upperNoteSpread', 3)
    
    @property
    def lower_note_spread(self) -> int:
        """Get lower note spread."""
        return self._config.get('lowerNoteSpread', 3)
    
    @property
    def note_duration(self) -> Dict[str, Any]:
        """Get note duration configuration."""
        return self._config.get('noteDuration', {})
    
    @property
    def pitch_bend(self) -> Dict[str, Any]:
        """Get pitch bend configuration."""
        return self._config.get('pitchBend', {})
    
    @property
    def note_velocity(self) -> Dict[str, Any]:
        """Get note velocity configuration."""
        return self._config.get('noteVelocity', {})
    
    @property
    def mappings(self) -> Dict[str, Any]:
        """Get HID data mappings."""
        return self._config.get('mappings', {})

