---
layout: page.njk
title: Configuration Overview
description: Understanding Strumboli's configuration system
---

# Configuration Overview

Strumboli uses a JSON-based configuration system that controls everything from tablet hardware mapping to MIDI expression parameters. This guide explains the structure and key concepts.

## Configuration File

The main configuration file is **`settings.json`**, located in:
1. The application directory (checked first)
2. Parent directory
3. Current working directory
4. Your home directory

## Configuration Structure

The settings file is organized into logical sections:

```json
{
  "startupConfiguration": { /* System startup options */ },
  "strumming": { /* Strumming behavior */ },
  "noteDuration": { /* Note length control */ },
  "noteVelocity": { /* Velocity/dynamics control */ },
  "pitchBend": { /* Pitch bend mapping */ },
  "noteRepeater": { /* Repeater effect */ },
  "stylusButtons": { /* Stylus button actions */ },
  "tabletButtons": { /* Tablet button actions */ },
  "strumRelease": { /* Release trigger settings */ }
}
```

## Core Concepts

### 1. Control Mapping

Many settings map tablet inputs to MIDI parameters. Each mapping has these properties:

```json
{
  "control": "pressure",      // Input source
  "min": 0,                   // Minimum output value
  "max": 127,                 // Maximum output value
  "default": 64,              // Default when not active
  "curve": 1.0,               // Response curve
  "spread": "direct",         // Distribution type
  "multiplier": 1.0           // Scale factor
}
```

#### Available Controls

| Control | Description | Use Cases |
|---------|-------------|-----------|
| `pressure` | Stylus pressure | Velocity, dynamics |
| `tiltX` | Left/right tilt | Pitch bend, modulation |
| `tiltY` | Forward/back tilt | Expression, brightness |
| `tiltXY` | Combined tilt | Note duration |
| `xaxis` | Horizontal position | Pan, filter sweep |
| `yaxis` | Vertical position | Pitch, cutoff |

#### Spread Types

| Spread | Description | Example |
|--------|-------------|---------|
| `direct` | Linear mapping (0→min, 1→max) | Velocity 0-127 |
| `inverse` | Inverted (0→max, 1→min) | Duration (light=long) |
| `central` | Center-based (0.5→default, edges→min/max) | Pitch bend around center |

#### Curve Values

The `curve` parameter shapes the response:

- **`1.0`** - Linear (no curve)
- **`2.0`** - Gentle logarithmic curve
- **`3.0`** - Moderate curve (good balance)
- **`4.0`** - Steep curve (very sensitive at low values)
- **`0.5`** - Compressed (reduces sensitivity)

**Example:** `curve: 4.0` for pressure makes light touches more expressive.

### 2. Note Spread

The **note spread** system fills out chords with additional octaves:

```json
{
  "strumming": {
    "initialNotes": ["C4", "E4", "G4"],
    "lowerNoteSpread": 3,
    "upperNoteSpread": 3
  }
}
```

This creates:
- 3 notes **below** the chord (C3, E3, G3)
- The chord itself (C4, E4, G4)
- 3 notes **above** the chord (C5, E5, G5)

Total: 9 notes to strum through

### 3. Actions System

Actions define what happens when you press buttons. Format:

```json
// Simple action (no parameters)
"toggle-repeater"

// Action with parameters
["transpose", 12]

// Action with nested parameters
["set-strum-notes", ["C4", "E4", "G4"]]

// Chord action
["set-strum-chord", "Cmaj7", 3]
```

See [Actions Reference](/about/actions-reference/) for all available actions.

### 4. Chord Progressions

Chord progressions can be:

**Preset name** (automatic 8-button setup):
```json
{
  "tabletButtons": "c-major-pop"
}
```

**Custom configuration** (full control):
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["transpose", 12],
    "6": ["transpose", -12],
    "7": "toggle-repeater",
    "8": ["set-strum-notes", ["E2"]]
  }
}
```

See [Chords & Progressions](/about/chords-and-progressions/) for details.

## Configuration Sections

### startupConfiguration

System-level settings for device detection and server startup:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useSocketServer": true,
    "socketServerPort": 8080,
    "useWebServer": true,
    "webServerPort": 82,
    "midiInputId": "Your MIDI Device"
  }
}
```

- **`drawingTablet`**: Device identifier or `"auto-detect"` (see [Tablet Setup](/about/tablet-setup/))
- **`useSocketServer`**: Enable WebSocket server for dashboard
- **`useWebServer`**: Enable HTTP server for web interface
- **`midiInputId`**: MIDI input device name (for keyboard input, optional)

### strumming

Controls strumming behavior:

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

- **`pluckVelocityScale`**: Velocity multiplier for X-axis movement
- **`pressureThreshold`**: Minimum pressure to trigger notes (0.0-1.0)
- **`midiChannel`**: MIDI channel for note output
- **`initialNotes`**: Starting chord/notes
- **`upperNoteSpread`**: Notes added above chord
- **`lowerNoteSpread`**: Notes added below chord

### Expression Controls

Map tablet inputs to MIDI expression:

```json
{
  "noteVelocity": {
    "control": "pressure",
    "min": 0,
    "max": 127,
    "default": 64,
    "curve": 4.0,
    "spread": "direct"
  },
  "noteDuration": {
    "control": "yaxis",
    "min": 0.15,
    "max": 1.5,
    "default": 1.0,
    "curve": 1.0,
    "spread": "central"
  },
  "pitchBend": {
    "control": "tiltXY",
    "min": -1.0,
    "max": 1.0,
    "default": 0,
    "curve": 4.0,
    "spread": "direct"
  }
}
```

### noteRepeater

Enables note repetition based on pressure:

```json
{
  "noteRepeater": {
    "active": false,
    "pressureMultiplier": 1.0,
    "frequencyMultiplier": 5.0
  }
}
```

- **`active`**: Enable/disable repeater
- **`pressureMultiplier`**: How pressure affects repetition
- **`frequencyMultiplier`**: Repetition speed multiplier

### Button Configuration

Configure stylus and tablet buttons:

```json
{
  "stylusButtons": {
    "active": true,
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": "toggle-repeater"
  },
  "tabletButtons": "c-major-pop"
}
```

See [Actions Reference](/about/actions-reference/) for all button action options.

## Configuration Tips

### Starting Simple

Begin with a minimal configuration:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  },
  "strumming": {
    "midiChannel": 1
  },
  "tabletButtons": "c-major-pop"
}
```

Everything else will use sensible defaults.

### Common Configurations

**Guitar-like strumming:**
```json
{
  "noteVelocity": { "control": "pressure", "curve": 4.0 },
  "pitchBend": { "control": "tiltX", "curve": 3.0 },
  "strumming": { "upperNoteSpread": 2, "lowerNoteSpread": 1 }
}
```

**Bass performance:**
```json
{
  "strumming": {
    "initialNotes": ["E1", "A1", "D2", "G2"],
    "upperNoteSpread": 1,
    "lowerNoteSpread": 0
  },
  "noteDuration": { "max": 4.0 }
}
```

**Ambient pad:**
```json
{
  "noteRepeater": { "active": true, "frequencyMultiplier": 2.0 },
  "noteDuration": { "min": 2.0, "max": 8.0 },
  "noteVelocity": { "max": 80 }
}
```

## Live Configuration Changes

Some settings can be changed in real-time:
- Chord/note selection (via button actions)
- Transpose (via button actions)
- Note repeater on/off (via button actions)

Most other settings require restarting Strumboli to take effect.

## Next Steps

- **[Tablet Setup](/about/tablet-setup/)** - Configure your specific tablet hardware
- **[Settings Reference](/about/settings-reference/)** - Complete documentation of all settings
- **[Actions Reference](/about/actions-reference/)** - Learn about button actions
- **[Chords & Progressions](/about/chords-and-progressions/)** - Explore the chord system

