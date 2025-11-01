import math
from typing import List, Union, Dict, Any


def parse_range_data(data: List[int], byte_index: int, min_val: int = 0, max_val: int = 0) -> float:
    """Parse range data from byte array"""
    value = data[byte_index]
    if max_val == min_val:
        return 0.0
    return (value - min_val) / (max_val - min_val)


def parse_multi_byte_range_data(data: List[int], byte_indices: List[int], 
                                 min_val: int = 0, max_val: int = 0, debug_name: str = None) -> float:
    """
    Parse multi-byte range data from byte array.
    
    Combines multiple bytes (typically low byte + high byte) into a single value.
    For example, for 14-bit pressure: value = low_byte + (high_byte << 8)
    
    Args:
        data: List of byte values
        byte_indices: List of byte indices to combine [low_byte_index, high_byte_index, ...]
        min_val: Minimum value in the combined range
        max_val: Maximum value in the combined range
        debug_name: Optional name for debug logging
        
    Returns:
        Normalized float value (0.0 to 1.0)
    """
    if not byte_indices:
        return 0.0
    
    # Combine bytes: each subsequent byte is shifted by 8 bits more
    value = 0
    for i, byte_idx in enumerate(byte_indices):
        if byte_idx < len(data):
            value += data[byte_idx] << (8 * i)
    
    if max_val == min_val:
        return 0.0
    
    normalized = (value - min_val) / (max_val - min_val)
    
    # Debug logging for pressure values (disabled for cleaner logs)
    # if debug_name == "pressure" and value > 1000:  # Only log when there's significant pressure
    #     print(f"[PRESSURE] Raw value: {value}, Max: {max_val}, Normalized: {normalized:.4f}")
    
    return normalized


def parse_bipolar_range_data(data: List[int], byte_index: int, 
                           pos_min: int = 0, pos_max: int = 0, 
                           neg_min: int = 0, neg_max: int = 0) -> float:
    """
    Parse bipolar range data from byte array.
    
    Handles values that have both positive and negative ranges where byte values
    "wrap around" at the byte boundary (e.g., 0-60 = positive, 196-255 = negative).
    Common for tilt sensors and other bipolar controls.
    """
    value = data[byte_index]
    if value < neg_max:
        if pos_max == pos_min:
            return 0.0
        return value / (pos_max - pos_min)
    else:
        if neg_min == neg_max:
            return 0.0
        return -(neg_min - value) / (neg_min - neg_max)


def parse_code(data: List[int], byte_index: int, values) -> Union[int, float, dict]:
    """Parse code from byte array using lookup values (dict or list)"""
    code = data[byte_index]
    
    # Handle dictionary-based lookup (like status codes)
    if isinstance(values, dict):
        code_str = str(code)
        if code_str in values:
            return values[code_str]
        return {}
    
    # Handle list-based lookup (legacy)
    if isinstance(values, list) and code < len(values):
        return values[code]
    
    return 0


def parse_bit_flags(data: List[int], byte_index: int, button_count: int = 8) -> Dict[str, bool]:
    """
    Parse bit flags from a byte into individual button states.
    
    Each bit represents a button (0=released, 1=pressed).
    For example, byte value 5 (binary 0b00000101) means buttons 1 and 3 are pressed.
    
    Args:
        data: List of byte values
        byte_index: Index of the byte containing button flags
        button_count: Number of buttons to parse (default: 8)
        
    Returns:
        Dictionary with button states: {'button1': True, 'button2': False, ...}
    """
    if byte_index >= len(data):
        return {}
    
    flags = data[byte_index]
    result = {}
    
    for i in range(button_count):
        button_key = f'button{i + 1}'
        # Check if bit i is set (button is pressed)
        result[button_key] = bool(flags & (1 << i))
    
    return result


def apply_curve(value: float, curve: float = 1.0, input_range: tuple = (0.0, 1.0)) -> float:
    """
    Apply an exponential curve mapping to a normalized value.
    
    Args:
        value: Input value to map (should be within input_range)
        curve: Curve parameter that controls the response curve:
               - curve = 1.0: Linear (no change)
               - curve > 1.0: Logarithmic/exponential - makes low values more sensitive
               - curve < 1.0: Compressed - reduces sensitivity at low values
               
               Recommended values:
               - 1.0 = Linear (default/bypass)
               - 2.0 = Gentle curve
               - 3.0 = Moderate curve
               - 4.0 = Steep curve
        input_range: Tuple of (min, max) for input value normalization
    
    Returns:
        Curved value in the same range as input
    """
    min_val, max_val = input_range
    
    # Handle edge cases
    if value <= min_val:
        return min_val
    if value >= max_val:
        return max_val
    if curve == 1.0:
        return value  # Linear passthrough for efficiency
    
    # Normalize to 0-1 range
    normalized = (value - min_val) / (max_val - min_val)
    
    # Apply exponential curve: (e^(curve*x) - 1) / (e^curve - 1)
    curved = (math.exp(curve * normalized) - 1) / (math.exp(curve) - 1)
    
    # Scale back to original range
    return min_val + (curved * (max_val - min_val))


def calculate_effect_value(input_value: float, min_val: float, max_val: float, 
                          multiplier: float = 1.0, curve: float = 1.0, 
                          spread: str = "direct") -> float:
    """
    Calculate an effect value using a unified approach.
    
    This function applies multiplier, curve, and range mapping to transform
    a normalized input value (0-1) into an output value in the specified range.
    
    Args:
        input_value: Normalized input value (0-1)
        min_val: Minimum output value
        max_val: Maximum output value
        multiplier: Multiplier applied to input before curve (default: 1.0)
        curve: Exponential curve parameter (default: 1.0 = linear)
        spread: Control how input maps to output (default: "direct"):
                - "direct": Normal mapping (min input → min output, max input → max output)
                - "inverse": Inverted mapping (min input → max output, max input → min output)
                - "central": Center input → max output, edge inputs → min output (bidirectional curve)
    
    Returns:
        Calculated effect value in the range [min_val, max_val]
    """
    # Apply multiplier to input
    scaled_input = input_value * multiplier
    # Clamp to 0-1 range after multiplier
    scaled_input = max(0.0, min(1.0, scaled_input))
    
    # Apply spread mapping
    if spread == "central":
        # Central mode: center (0.5) maps to max, edges (0.0 and 1.0) map to min
        # Calculate distance from center and normalize to 0-1 range
        distance_from_center = abs(scaled_input - 0.5) * 2.0  # 0 at center, 1 at edges
        
        # Apply curve to the distance
        curved_distance = apply_curve(distance_from_center, curve, input_range=(0.0, 1.0))
        
        # Invert so that center (distance=0) gives max output, edges (distance=1) give min output
        return max_val - (curved_distance * (max_val - min_val))
    
    elif spread == "inverse":
        # Inverse mode: high input = low output
        curved_value = apply_curve(scaled_input, curve, input_range=(0.0, 1.0))
        return max_val - (curved_value * (max_val - min_val))
    
    else:  # "direct" or default
        # Direct mode: normal mapping (low input = low output)
        curved_value = apply_curve(scaled_input, curve, input_range=(0.0, 1.0))
        return min_val + (curved_value * (max_val - min_val))


def apply_effect(effect_config: Dict[str, Any], control_inputs: Dict[str, float], 
                 effect_name: str = "") -> float:
    """
    Apply an effect calculation based on its control configuration.
    
    This function looks up which control input should be used for an effect
    (e.g., 'yaxis', 'pressure', 'tiltX', 'tiltY', 'tiltXY') and applies
    the effect calculation with the configured parameters. If no control is
    configured, returns the default value from the effect configuration.
    
    Args:
        effect_config: Effect configuration dictionary containing:
                      - 'control': Which input to use ('yaxis', 'pressure', 'tiltX', 'tiltY', 'tiltXY')
                      - 'min': Minimum output value
                      - 'max': Maximum output value
                      - 'multiplier': Input multiplier (default: 1.0)
                      - 'curve': Curve parameter (default: 1.0)
                      - 'spread': Spread mode ('direct', 'inverse', 'central')
                      - 'default': Default value when no control is configured
        control_inputs: Dictionary mapping control names to their normalized values (0-1)
                       Example: {'yaxis': 0.5, 'pressure': 0.8, 'tiltXY': 0.3}
        effect_name: Optional name of effect for debugging purposes
        
    Returns:
        Calculated effect value in the range [min, max], or the default value
        
    Example:
        >>> control_inputs = {'yaxis': 0.5, 'pressure': 0.8, 'tiltXY': 0.3}
        >>> config = {'control': 'pressure', 'min': 0, 'max': 127, 'curve': 2.0, 'default': 64}
        >>> apply_effect(config, control_inputs, 'velocity')
        112.5
    """
    control_type = effect_config.get('control')
    
    # Return default if no control configured or control not available
    if not control_type or control_type not in control_inputs:
        return effect_config.get('default', 0.0)
    
    # Get the input value for this control type
    input_value = control_inputs[control_type]
    
    # Apply effect calculation
    return calculate_effect_value(
        input_value,
        effect_config.get('min', 0.0),
        effect_config.get('max', 1.0),
        effect_config.get('multiplier', 1.0),
        effect_config.get('curve', 1.0),
        effect_config.get('spread', 'direct')
    )
