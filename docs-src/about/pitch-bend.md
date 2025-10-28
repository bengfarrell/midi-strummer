---
layout: page.njk
title: Pitch Bend
description: Add expressive pitch bend to your notes
---

# Pitch Bend

Controls MIDI pitch bend based on tablet input. Pitch bend adds expressive pitch variation, similar to bending strings on a guitar or using a pitch wheel.

## Settings

### control

**Type:** `string`  
**Default:** `"tiltXY"`  
**Options:** `"pressure"`, `"tiltX"`, `"tiltY"`, `"tiltXY"`, `"xaxis"`, `"yaxis"`  
**Description:** Which tablet input controls pitch bend

**Examples:**
```json
{
  "pitchBend": {
    "control": "tiltX"
  }
}
```

Common mappings:
- `"tiltX"` - Left/right tilt
- `"tiltY"` - Forward/back tilt
- `"tiltXY"` - Combined tilt magnitude
- `"yaxis"` - Vertical position

---

### min

**Type:** `float`  
**Default:** `-1.0`  
**Range:** -1.0 to 0  
**Description:** Minimum pitch bend (down)

**Examples:**
```json
{
  "pitchBend": {
    "min": -0.5
  }
}
```

-1.0 = full bend down (typically -2 semitones, depends on receiving device).

---

### max

**Type:** `float`  
**Default:** `1.0`  
**Range:** 0 to 1.0  
**Description:** Maximum pitch bend (up)

**Examples:**
```json
{
  "pitchBend": {
    "max": 0.5
  }
}
```

1.0 = full bend up (typically +2 semitones, depends on receiving device).

---

### default

**Type:** `float`  
**Default:** `0`  
**Range:** Between min and max  
**Description:** Default pitch bend (no bend)

**Examples:**
```json
{
  "pitchBend": {
    "default": 0
  }
}
```

Always use 0 for no bend.

---

### curve

**Type:** `float`  
**Default:** `4.0`  
**Range:** > 0  
**Description:** Response curve shape

**Values:**
- `1.0` - Linear (no curve)
- `2.0` - Gentle curve
- `3.0` - Moderate curve
- `4.0` - Steep curve (very sensitive at low end)

**Examples:**
```json
{
  "pitchBend": {
    "curve": 3.0
  }
}
```

---

### spread

**Type:** `string`  
**Default:** `"direct"`  
**Options:** `"direct"`, `"inverse"`, `"central"`  
**Description:** How input maps to output range

**Values:**
- `"direct"` - 0 → min (down), 1 → max (up)
- `"inverse"` - 0 → max (up), 1 → min (down)
- `"central"` - 0.5 → default (no bend), edges → min/max

**Examples:**
```json
{
  "pitchBend": {
    "spread": "central"
  }
}
```

`"central"` is useful for tilt-based bend where neutral position = no bend.

---

### multiplier

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** Overall scale factor applied to final value

**Examples:**
```json
{
  "pitchBend": {
    "multiplier": 0.5
  }
}
```

## Configuration Example

```json
{
  "pitchBend": {
    "min": -1.0,
    "max": 1.0,
    "default": 0,
    "multiplier": 1.0,
    "curve": 4.0,
    "spread": "direct",
    "control": "tiltXY"
  }
}
```

## Usage Examples

### Subtle Vibrato
```json
{
  "pitchBend": {
    "min": -0.3,
    "max": 0.3,
    "control": "tiltX",
    "curve": 2.0
  }
}
```

### Guitar-Style Bends
```json
{
  "pitchBend": {
    "min": 0,
    "max": 1.0,
    "control": "tiltY",
    "curve": 3.0,
    "spread": "direct"
  }
}
```

### Position-Based Pitch
```json
{
  "pitchBend": {
    "min": -0.5,
    "max": 0.5,
    "control": "yaxis",
    "curve": 1.0,
    "spread": "central"
  }
}
```

## Related Documentation

- [Note Duration](/about/note-duration/) - Control note length
- [Note Velocity](/about/note-velocity/) - Control dynamics
- [Strumming](/about/strumming/) - Configure strumming behavior

