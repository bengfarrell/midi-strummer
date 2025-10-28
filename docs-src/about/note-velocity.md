---
layout: page.njk
title: Note Velocity
description: Control MIDI velocity and note dynamics
---

# Note Velocity

Controls MIDI velocity (note loudness/dynamics) based on tablet input. Velocity is one of the most important parameters for expressive performance.

## Settings

### control

**Type:** `string`  
**Default:** `"pressure"`  
**Options:** `"pressure"`, `"tiltX"`, `"tiltY"`, `"tiltXY"`, `"xaxis"`, `"yaxis"`  
**Description:** Which tablet input controls velocity

**Examples:**
```json
{
  "noteVelocity": {
    "control": "pressure"
  }
}
```

`"pressure"` is the most natural mapping for dynamics.

---

### min

**Type:** `integer`  
**Default:** `0`  
**Range:** 0-127  
**Description:** Minimum MIDI velocity

**Examples:**
```json
{
  "noteVelocity": {
    "min": 20
  }
}
```

Setting above 0 ensures notes are always audible.

---

### max

**Type:** `integer`  
**Default:** `127`  
**Range:** 0-127  
**Description:** Maximum MIDI velocity

**Examples:**
```json
{
  "noteVelocity": {
    "max": 100
  }
}
```

Reduce if notes are too loud at full pressure.

---

### default

**Type:** `integer`  
**Default:** `64`  
**Range:** 0-127  
**Description:** Default velocity when control is neutral

**Examples:**
```json
{
  "noteVelocity": {
    "default": 64
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
  "noteVelocity": {
    "curve": 4.0
  }
}
```

**Note:** For velocity, `curve: 4.0` with `spread: "direct"` creates very expressive light-touch dynamics.

---

### spread

**Type:** `string`  
**Default:** `"direct"`  
**Options:** `"direct"`, `"inverse"`, `"central"`  
**Description:** How input maps to output range

**Values:**
- `"direct"` - 0 → min, 1 → max (light = quiet, hard = loud)
- `"inverse"` - 0 → max, 1 → min (light = loud, hard = quiet)
- `"central"` - 0.5 → default, edges → min/max

**Examples:**
```json
{
  "noteVelocity": {
    "spread": "direct"
  }
}
```

---

### multiplier

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** Overall scale factor applied to final value

**Examples:**
```json
{
  "noteVelocity": {
    "multiplier": 1.5
  }
}
```

Multiplies the final velocity after all other calculations.

## Configuration Example

```json
{
  "noteVelocity": {
    "min": 0,
    "max": 127,
    "default": 64,
    "multiplier": 1.0,
    "curve": 4.0,
    "spread": "direct",
    "control": "pressure"
  }
}
```

## Curve Values for Different Feels

- **Linear (1.0)**: Predictable, technical control
- **Gentle (2.0)**: Slight enhancement, natural feel
- **Moderate (3.0)**: Good balance of control and expression
- **Steep (4.0)**: Very expressive, great for velocity

## Common Control Mappings

| Control | Best For |
|---------|----------|
| `pressure` | Velocity, dynamics |
| `tiltX` | Alternate expression control |
| `tiltY` | Alternate expression control |
| `tiltXY` | Combined tilt magnitude |
| `yaxis` | Position-based dynamics |
| `xaxis` | Less common for velocity |

## Related Documentation

- [Note Duration](/about/note-duration/) - Control how long notes play
- [Pitch Bend](/about/pitch-bend/) - Add expressive pitch changes
- [Strumming](/about/strumming/) - Configure strumming behavior

