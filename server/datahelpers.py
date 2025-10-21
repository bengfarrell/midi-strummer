import math
from typing import List, Union


def parse_range_data(data: List[int], byte_index: int, min_val: int = 0, max_val: int = 0) -> float:
    """Parse range data from byte array"""
    value = data[byte_index]
    if max_val == min_val:
        return 0.0
    return (value - min_val) / (max_val - min_val)


def parse_wrapped_range_data(data: List[int], byte_index: int, 
                           pos_min: int = 0, pos_max: int = 0, 
                           neg_min: int = 0, neg_max: int = 0) -> float:
    """Parse wrapped range data from byte array"""
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
