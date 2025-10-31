# Auto-Detection Algorithm Fixes

## Problem Analysis

Compared the auto-generated driver (`deco_640_osx2.json`) with the working driver (`drivers/xp_pen_deco_640_osx.json`) and found significant byte mapping errors:

### What Was Wrong

| Field | Expected | Auto-Generated | Issue |
|-------|----------|----------------|-------|
| X | bytes [2, 3] | bytes [2, 3] | ✓ Correct |
| Y | bytes [4, 5] | bytes [**3, 4**] | ❌ **Overlapping!** |
| Pressure | bytes [6, 7] | bytes [5, 6] | ❌ Off by 1 |
| TiltX | byte 8 | byte 7 | ❌ Off by 1 |
| TiltY | byte 9 | byte 8 | ❌ Off by 1 |
| Buttons | byte 2 | byte 1 | ❌ Detected status byte instead |
| Status | byte 1 (many codes) | byte 1 (2 codes) | ⚠️ Incomplete |

### Root Cause

**Overlapping Byte Detection:** The Y coordinate was detected as bytes [3, 4] when it should be [4, 5]. Byte 3 is the **high byte of X**, not the low byte of Y!

This happened because the old algorithm looked for "adjacent bytes with variance" without checking for overlaps. Since byte 3 changes during movement (as part of X), it appeared to be a coordinate byte, leading to the false detection of [3, 4] as Y.

## Fixes Implemented

### 1. Fixed Coordinate Detection (`_find_coordinates`)

**Problem:** Algorithm allowed overlapping byte pairs.

**Solution:**
- Check byte pairs at **even positions** (2, 4, 6) first to avoid overlap
- Add validation: max values must be < 50,000 (not 65,000+ noise)
- Require minimum variance of 100
- Ensure Y is at least 2 bytes after X (no overlap)
- Fall back to odd positions only if needed and no overlap detected

```python
# Old (WRONG): Could pick [2,3] and [3,4]
for byte_idx in range(2, 9):
    if byte_idx in variances and byte_idx + 1 in variances:
        # Could overlap!

# New (CORRECT): Non-overlapping pairs
for byte_idx in range(2, 8, 2):  # Step by 2!
    # Check [2,3], [4,5], [6,7] - no overlap possible
```

**Result:** Now correctly identifies:
- X at bytes [2, 3]
- Y at bytes [4, 5]
- With reasonable max values (32000, 18000)

### 2. Fixed Pressure Detection (`_find_pressure`)

**Problem:** Could detect coordinate bytes as pressure due to overlap.

**Solution:**
- Start search at byte 6 (after coordinates at 2-3 and 4-5)
- Only check even positions (6, 8) to avoid overlap
- Add scoring system based on pressure characteristics:
  - Prefer min value close to 0 (+3 points)
  - Prefer typical pressure levels: 8192 (+3), 16384 (+3), 32768 (+2)
  - Reject values > 65,000 (noise)
  - Require variance > 1000

**Result:** Now correctly identifies pressure at bytes [6, 7] with max ~16383.

### 3. Fixed Button Detection (`_find_buttons`)

**Problem:** Detected byte 1 (status byte) as button byte instead of byte 2.

**Solution:**
- **Skip byte 1** entirely (always status byte)
- Start search at byte 2
- Add scoring system:
  - Score +2 for each power-of-2 value (1, 2, 4, 8, 16, 32, 64, 128)
  - Score +1 for combination values (multiple buttons)
  - Pick byte with highest score

```python
# Old (WRONG): Started at byte 1
for byte_idx in range(1, 5):

# New (CORRECT): Start at byte 2
for byte_idx in range(2, 5):  # Skip status byte!
```

**Result:** Now correctly identifies buttons at byte 2.

### 4. Enhanced Status Detection (`_find_status_byte`)

**Problem:** Only detected basic states (hover, contact), missed stylus button states.

**Solution:**
- Collect **ALL unique values** from each test phase (not just most common)
- Map all observed values to their states
- Capture stylus button variations (hover+button, contact+button)
- Updated test prompts to encourage pressing stylus buttons

**Before:**
```json
"values": {
  "160": {"state": "hover"},
  "161": {"state": "contact"}
}
```

**After:**
```json
"values": {
  "192": {"state": "none"},
  "160": {"state": "hover"},
  "162": {"state": "hover"},  // hover + stylus button
  "164": {"state": "hover"},  // hover + other button
  "161": {"state": "contact"},
  "163": {"state": "contact"}, // contact + button
  "165": {"state": "contact"}, // contact + button
  "240": {"state": "buttons"}
}
```

### 5. Updated Interactive Prompts

Added instructions to press stylus buttons during testing:

```
2. HOVER stylus above tablet (don't touch)
   Also try pressing stylus buttons while hovering  ← NEW

3. TOUCH stylus to tablet lightly
   Also try pressing stylus buttons while touching  ← NEW
```

## Algorithm Improvements Summary

### Coordinate Detection
- ✅ Non-overlapping pairs (step by 2)
- ✅ Reasonable max value validation (< 50K)
- ✅ Minimum variance requirement (> 100)
- ✅ Overlap detection and prevention

### Pressure Detection
- ✅ Start after coordinates (byte 6+)
- ✅ Scoring system for typical pressure levels
- ✅ Reject noise values (> 65K)
- ✅ Require significant variance (> 1000)

### Button Detection
- ✅ Skip status byte (byte 1)
- ✅ Scoring based on bit patterns
- ✅ Prefer power-of-2 values
- ✅ Consider combination presses

### Status Detection
- ✅ Collect all unique values (not just common)
- ✅ Map all stylus button combinations
- ✅ Capture complete state machine
- ✅ Better test instructions

## Expected Results

With these fixes, auto-generated drivers should now match working drivers:

```json
{
  "x": {"byteIndices": [2, 3], "max": 32000},
  "y": {"byteIndices": [4, 5], "max": 18000},
  "pressure": {"byteIndices": [6, 7], "max": 16383},
  "tiltX": {"byteIndex": 8},
  "tiltY": {"byteIndex": 9},
  "tabletButtons": {"byteIndex": 2},
  "status": {
    "byteIndex": 1,
    "values": {
      "192": {"state": "none"},
      "160": {"state": "hover"},
      "161": {"state": "contact"},
      "240": {"state": "buttons"}
      // Plus stylus button variations
    }
  }
}
```

## Testing Recommendations

To test the fixes:

1. **Run discovery on XP-Pen Deco 640 (macOS)**
2. **Follow ALL prompts** (especially press stylus buttons during hover/contact)
3. **Compare output** with `drivers/xp_pen_deco_640_osx.json`
4. **Verify:**
   - X/Y at correct bytes with reasonable max values
   - Pressure at bytes 6-7 with ~16K max
   - Buttons at byte 2
   - Status at byte 1 with multiple codes

## Technical Notes

### Why Overlapping is Bad

```
Correct layout:
Byte 2-3: X (16-bit, little-endian)
Byte 4-5: Y (16-bit, little-endian)

Incorrect overlap:
Byte 2-3: X (correct)
Byte 3-4: Y (WRONG - byte 3 is already part of X!)
```

When byte 3 is counted twice, ALL subsequent bytes shift by 1:
- Pressure moves from 6-7 to 5-6 ❌
- TiltX moves from 8 to 7 ❌
- TiltY moves from 9 to 8 ❌

### Why Step-by-2 Works

By checking pairs at positions 2, 4, 6, 8, we ensure:
- [2, 3] and [4, 5] cannot overlap ✓
- [4, 5] and [6, 7] cannot overlap ✓
- Each byte belongs to exactly one field ✓

### Why Scoring Systems Help

Instead of taking the first match, scoring allows:
- Comparing multiple candidates
- Preferring typical patterns
- Rejecting suspicious values
- Choosing the "most likely" match

## Future Improvements

Potential enhancements:
1. **Visual validation** - Show detected bytes graphically
2. **Confidence scores** - Display detection certainty
3. **Manual override** - Allow user to correct mistakes
4. **Learning system** - Improve detection based on feedback
5. **Edge case handling** - Support unusual byte layouts

