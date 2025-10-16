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


def parse_code(data: List[int], byte_index: int, values: List[Union[int, float]]) -> Union[int, float]:
    """Parse code from byte array using lookup values"""
    code = data[byte_index]
    if code < len(values):
        return values[code]
    return 0
