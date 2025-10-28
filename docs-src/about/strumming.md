---
layout: page.njk
title: Strumming
description: Core strumming behavior and note configuration
---

# Strumming

Core strumming behavior configuration for how notes are triggered and spread across the tablet.

## Settings

### pluckVelocityScale

**Type:** `float`  
**Default:** `4.0`  
**Range:** > 0  
**Description:** Multiplier for X-axis movement velocity when calculating pluck velocity

**Examples:**
```json
{
  "strumming": {
    "pluckVelocityScale": 6.0
  }
}
```

Higher values = faster X-axis movement required for same velocity.

---

### pressureThreshold

**Type:** `float`  
**Default:** `0.1`  
**Range:** 0.0-1.0  
**Description:** Minimum pressure required to trigger notes

**Examples:**
```json
{
  "strumming": {
    "pressureThreshold": 0.05
  }
}
```

Lower values = more sensitive to light touch.  
Higher values = require firmer press to trigger.

---

### midiChannel

**Type:** `integer` or `null`  
**Default:** `null`  
**Range:** 1-16  
**Description:** MIDI channel for strummed notes

**Examples:**
```json
{
  "strumming": {
    "midiChannel": 1
  }
}
```

Set to specific channel to route to different instrument in DAW.  
Set to `null` to use default channel.

---

### initialNotes

**Type:** `array` of `string`  
**Default:** `["C4", "E4", "G4"]`  
**Description:** Starting notes when Strumboli launches

**Examples:**
```json
{
  "strumming": {
    "initialNotes": ["E2", "B2", "E3", "G#3"]
  }
}
```

Format: `"<Note><Octave>"` (e.g., `"C4"`, `"F#5"`, `"Bb3"`)

---

### upperNoteSpread

**Type:** `integer`  
**Default:** `3`  
**Range:** 0+  
**Description:** Number of additional octaves to add above the chord

**Examples:**
```json
{
  "strumming": {
    "upperNoteSpread": 5
  }
}
```

With a C major chord (C4, E4, G4):
- `0` - No additional notes
- `1` - Adds C5, E5, G5
- `3` - Adds C5-G5, C6-G6, C7-G7

---

### lowerNoteSpread

**Type:** `integer`  
**Default:** `3`  
**Range:** 0+  
**Description:** Number of additional octaves to add below the chord

**Examples:**
```json
{
  "strumming": {
    "lowerNoteSpread": 1
  }
}
```

With a C major chord (C4, E4, G4):
- `0` - No additional notes
- `1` - Adds C3, E3, G3
- `3` - Adds C1-G1, C2-G2, C3-G3

## Configuration Example

```json
{
  "strumming": {
    "pluckVelocityScale": 4.0,
    "pressureThreshold": 0.1,
    "midiChannel": 1,
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3
  }
}
```

## Note Spread Guidelines

| Use Case | Lower | Upper | Total Notes |
|----------|-------|-------|-------------|
| Minimal | 0-1 | 0-1 | 3-9 |
| Normal | 2-3 | 2-3 | 15-21 |
| Wide | 4-5 | 4-5 | 27-33 |
| Full Range | 6+ | 6+ | 39+ |

## Related Documentation

- [Chords & Progressions](/about/chords-and-progressions/) - Explore the chord system
- [Tablet Buttons](/about/tablet-buttons/) - Configure button actions for chord changes
- [Note Velocity](/about/note-velocity/) - Control dynamics

