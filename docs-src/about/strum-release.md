---
layout: page.njk
title: Strum Release
description: Trigger notes when lifting the stylus
---

# Strum Release

Trigger a MIDI note when the stylus lifts from the tablet. This is particularly useful for adding percussion sounds or effects on release.

## Settings

### active

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable strum release trigger

**Examples:**
```json
{
  "strumRelease": {
    "active": true
  }
}
```

Useful for triggering percussion sounds on release.

---

### midiNote

**Type:** `integer`  
**Default:** `38`  
**Range:** 0-127  
**Description:** MIDI note number to trigger on release

**Examples:**
```json
{
  "strumRelease": {
    "midiNote": 42
  }
}
```

Common percussion notes (General MIDI):
- `36` - Bass Drum
- `38` - Snare Drum (default)
- `42` - Closed Hi-Hat
- `46` - Open Hi-Hat
- `49` - Crash Cymbal
- `51` - Ride Cymbal

---

### midiChannel

**Type:** `integer` or `null`  
**Default:** `null`  
**Range:** 1-16  
**Description:** MIDI channel for release trigger

**Examples:**
```json
{
  "strumRelease": {
    "midiChannel": 10
  }
}
```

Channel 10 is typically drums in General MIDI.

---

### maxDuration

**Type:** `float`  
**Default:** `0.25`  
**Range:** > 0  
**Units:** Seconds  
**Description:** Maximum time since last contact to trigger release

**Examples:**
```json
{
  "strumRelease": {
    "maxDuration": 0.5
  }
}
```

Prevents triggering on very long strums or when leaving the stylus hovering.

---

### velocityMultiplier

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** Multiplier for release note velocity

**Examples:**
```json
{
  "strumRelease": {
    "velocityMultiplier": 2.0
  }
}
```

Higher values = louder release triggers.

## Configuration Example

```json
{
  "strumRelease": {
    "active": false,
    "midiNote": 38,
    "midiChannel": 10,
    "maxDuration": 0.25,
    "velocityMultiplier": 1.0
  }
}
```

## Usage Examples

### Snare on Release
```json
{
  "strumRelease": {
    "active": true,
    "midiNote": 38,
    "midiChannel": 10,
    "velocityMultiplier": 1.5
  }
}
```

### Hi-Hat Pattern
```json
{
  "strumRelease": {
    "active": true,
    "midiNote": 42,
    "midiChannel": 10,
    "maxDuration": 0.15,
    "velocityMultiplier": 0.8
  }
}
```

### Cymbal Accents
```json
{
  "strumRelease": {
    "active": true,
    "midiNote": 49,
    "midiChannel": 10,
    "maxDuration": 0.5,
    "velocityMultiplier": 2.5
  }
}
```

### Subtle Release Click
```json
{
  "strumRelease": {
    "active": true,
    "midiNote": 42,
    "midiChannel": 10,
    "maxDuration": 0.1,
    "velocityMultiplier": 0.3
  }
}
```

## General MIDI Percussion Map

| Note | Sound |
|------|-------|
| 35 | Acoustic Bass Drum |
| 36 | Bass Drum 1 |
| 37 | Side Stick |
| 38 | Acoustic Snare |
| 39 | Hand Clap |
| 40 | Electric Snare |
| 41 | Low Floor Tom |
| 42 | Closed Hi-Hat |
| 43 | High Floor Tom |
| 44 | Pedal Hi-Hat |
| 45 | Low Tom |
| 46 | Open Hi-Hat |
| 47 | Low-Mid Tom |
| 48 | Hi-Mid Tom |
| 49 | Crash Cymbal 1 |
| 50 | High Tom |
| 51 | Ride Cymbal 1 |
| 52 | Chinese Cymbal |
| 53 | Ride Bell |

## Related Documentation

- [Strumming](/about/strumming/) - Configure strumming behavior
- [Startup Configuration](/about/startup-configuration/) - MIDI channel configuration

