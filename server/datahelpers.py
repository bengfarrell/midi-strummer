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
