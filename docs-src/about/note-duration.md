---
layout: page.njk
title: Note Duration
description: Control how long notes play based on tablet input
---

# Note Duration

Controls how long notes play based on tablet input. This is crucial for creating different articulations from staccato to sustained.

## Settings

### control

**Type:** `string`  
**Default:** `"yaxis"`  
**Options:** `"pressure"`, `"tiltX"`, `"tiltY"`, `"tiltXY"`, `"xaxis"`, `"yaxis"`  
**Description:** Which tablet input controls note duration

**Examples:**
```json
{
  "noteDuration": {
    "control": "yaxis"
  }
}
```

Common mappings:
- `"yaxis"` - Vertical position (higher = longer/shorter depending on spread)
- `"tiltXY"` - Combined tilt (more tilt = longer/shorter)
- `"pressure"` - Harder press = longer/shorter

---

### min

**Type:** `float`  
**Default:** `0.15`  
**Range:** > 0  
**Units:** Seconds  
**Description:** Minimum note duration

**Examples:**
```json
{
  "noteDuration": {
    "min": 0.1
  }
}
```

Very short values (< 0.1) create staccato effects.

---

### max

**Type:** `float`  
**Default:** `1.5`  
**Range:** > min  
**Units:** Seconds  
**Description:** Maximum note duration

**Examples:**
```json
{
  "noteDuration": {
    "max": 3.0
  }
}
```

Higher values allow sustained notes and pads.

---

### default

**Type:** `float`  
**Default:** `1.0`  
**Range:** Between min and max  
**Units:** Seconds  
**Description:** Default duration when control is neutral (for `"central"` spread)

**Examples:**
```json
{
  "noteDuration": {
    "default": 0.5
  }
}
```

---

### curve

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** Response curve shape

**Values:**
- `1.0` - Linear (no curve)
- `2.0` - Gentle curve
- `3.0` - Moderate curve
- `4.0` - Steep curve (very sensitive at low end)
- `0.5` - Compressed (reduces low-end sensitivity)

**Examples:**
```json
{
  "noteDuration": {
    "curve": 2.0
  }
}
```

---

### spread

**Type:** `string`  
**Default:** `"inverse"`  
**Options:** `"direct"`, `"inverse"`, `"central"`  
**Description:** How input maps to output range

**Values:**
- `"direct"` - 0 → min, 1 → max
- `"inverse"` - 0 → max, 1 → min
- `"central"` - 0.5 → default, edges → min/max

**Examples:**
```json
{
  "noteDuration": {
    "spread": "inverse"
  }
}
```

For duration, `"inverse"` means light touch = longer notes.

---

### multiplier

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** Overall scale factor applied to final value

**Examples:**
```json
{
  "noteDuration": {
    "multiplier": 1.5
  }
}
```

Multiplies the final duration after all other calculations.

## Configuration Example

```json
{
  "noteDuration": {
    "min": 0.15,
    "max": 1.5,
    "default": 1.0,
    "multiplier": 1.0,
    "curve": 1.0,
    "spread": "inverse",
    "control": "yaxis"
  }
}
```

## Usage Examples

### Staccato (Short Notes)
```json
{
  "noteDuration": {
    "min": 0.05,
    "max": 0.3,
    "control": "yaxis"
  }
}
```

### Sustained (Long Notes)
```json
{
  "noteDuration": {
    "min": 2.0,
    "max": 8.0,
    "control": "yaxis"
  }
}
```

### Varied Expression
```json
{
  "noteDuration": {
    "min": 0.1,
    "max": 3.0,
    "curve": 2.0,
    "control": "pressure"
  }
}
```

## Related Documentation

- [Note Velocity](/about/note-velocity/) - Control note dynamics
- [Pitch Bend](/about/pitch-bend/) - Add expressive pitch changes
- [Strumming](/about/strumming/) - Configure strumming behavior

