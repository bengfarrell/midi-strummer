---
layout: page.njk
title: Settings File
description: Complete guide to configuring Strumboli via settings.json
---

# Settings File (settings.json)

The `settings.json` file is the central configuration file for Strumboli. It controls everything from device detection and server settings to MIDI expression parameters and button mappings.

## File Location

Strumboli searches for `settings.json` in the following order:

1. **Application directory** (same folder as the executable)
2. **Parent directory** (one level up)
3. **Current working directory** (where you ran the command)
4. **Home directory** (`~/settings.json`)

**Platform-specific locations** (future):
- macOS: `~/Library/Application Support/Strumboli/settings.json`
- Linux: `~/.config/strumboli/settings.json`
- Windows: `%APPDATA%\Strumboli\settings.json`

## File Structure

The settings file is organized into logical sections:

```json
{
  "startupConfiguration": { },
  "strumming": { },
  "noteDuration": { },
  "noteVelocity": { },
  "pitchBend": { },
  "noteRepeater": { },
  "stylusButtons": { },
  "tabletButtons": { },
  "strumRelease": { }
}
```

Each section controls a specific aspect of Strumboli's behavior.

## Startup Configuration

The `startupConfiguration` section controls system-level settings.

### Device Detection

**Auto-Detection (Recommended):**
```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  }
}
```

Strumboli will automatically scan for supported tablets and use the first one found.

**Advantages:**
- ✅ Zero configuration required
- ✅ Works immediately with supported tablets
- ✅ Automatically switches if you unplug/replug

**When to use:** For standard setups with one drawing tablet.

---

**Specify by Driver Name:**
```json
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640_osx"
  }
}
```

Use the driver filename (without `.json`) from the `server/drivers/` directory.

**Advantages:**
- ✅ Explicit control over which device is used
- ✅ Faster startup (no scanning)
- ✅ Useful for multiple tablets

**When to use:** When you have multiple tablets or want explicit control.

---

**Specify by Vendor/Product ID:**
```json
{
  "startupConfiguration": {
    "drawingTablet": {
      "vendorId": "0x28bd",
      "productId": "0x0914"
    }
  }
}
```

**Advantages:**
- ✅ Most precise device identification
- ✅ Works even without a driver file

**When to use:** For custom or unsupported devices.

**Finding your device IDs:**
- **macOS:** System Information → USB
- **Linux:** `lsusb` command
- **Windows:** Device Manager → Properties

---

### Server Settings

```json
{
  "startupConfiguration": {
    "useSocketServer": true,
    "socketServerPort": 8080,
    "useWebServer": true,
    "webServerPort": 82
  }
}
```

**`useSocketServer`** (`boolean`, default: `true`)  
Enable WebSocket server for real-time communication with web dashboard or custom applications.

**`socketServerPort`** (`integer`, default: `8080`)  
Port for WebSocket server. Change if port is already in use.

**`useWebServer`** (`boolean`, default: `false`)  
Enable HTTP server to host the web dashboard interface.

**`webServerPort`** (`integer`, default: `80`)  
Port for HTTP server. Recommended: `82` or `3000` to avoid needing admin privileges.

See [Web Dashboard](/about/configuration-dashboard/) for detailed dashboard configuration.

---

### MIDI Input (Optional)

```json
{
  "startupConfiguration": {
    "midiInputId": "Launchkey MK4 25 MIDI Out"
  }
}
```

**`midiInputId`** (`string`, optional)  
Name of a MIDI input device to receive keyboard/controller input.

**Use cases:**
- Receive transpose commands from a MIDI controller
- Use a MIDI keyboard alongside the tablet
- Trigger actions via MIDI

Leave unset (`null`) if not needed.

---

## Strumming Configuration

Controls the core strumming behavior:

```json
{
  "strumming": {
    "midiChannel": 1,
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3,
    "pluckVelocityScale": 4.0,
    "pressureThreshold": 0.1
  }
}
```

### Core Settings

**`midiChannel`** (`integer`, 1-16, default: `1`)  
MIDI channel for note output. Must match your DAW/synth input channel.

**`initialNotes`** (`array of strings`)  
Starting chord or notes to strum through. Use scientific pitch notation (e.g., `"C4"`, `"E4"`, `"G4"`).

**`upperNoteSpread`** (`integer`, default: `3`)  
Number of octaves to add **above** the initial notes.

**`lowerNoteSpread`** (`integer`, default: `3`)  
Number of octaves to add **below** the initial notes.

**Example:** With `["C4", "E4", "G4"]` and spreads of 3:
- Lower octaves: C3, E3, G3 / C2, E2, G2 / C1, E1, G1
- Initial: **C4, E4, G4**
- Upper octaves: C5, E5, G5 / C6, E6, G6 / C7, E7, G7

Total: 21 notes to strum through!

---

### Advanced Strumming Settings

**`pluckVelocityScale`** (`float`, default: `4.0`)  
Multiplier for velocity based on X-axis movement speed. Higher values = more velocity variation from strumming speed.

**`pressureThreshold`** (`float`, 0.0-1.0, default: `0.1`)  
Minimum pressure required to trigger notes. Lower = more sensitive.

---

## Expression Controls

Map tablet inputs to MIDI parameters. Each control follows the same pattern:

```json
{
  "noteVelocity": {
    "control": "pressure",
    "min": 0,
    "max": 127,
    "default": 64,
    "curve": 4.0,
    "spread": "direct",
    "multiplier": 1.0
  }
}
```

### Control Parameters

**`control`** (string) - Input source:
- `"pressure"` - Stylus pressure
- `"tiltX"` - Left/right tilt
- `"tiltY"` - Forward/backward tilt
- `"tiltXY"` - Combined tilt magnitude
- `"xaxis"` - Horizontal position (0.0-1.0)
- `"yaxis"` - Vertical position (0.0-1.0)

**`min`** (number) - Minimum output value

**`max`** (number) - Maximum output value

**`default`** (number) - Value when input is inactive

**`curve`** (float, default: `1.0`) - Response curve:
- `1.0` = Linear (no curve)
- `2.0` = Gentle logarithmic curve
- `3.0` = Moderate curve
- `4.0` = Steep curve (very sensitive at low input)
- `0.5` = Compressed (less sensitive)

**`spread`** (string) - Distribution type:
- `"direct"` - Linear mapping (0 → min, 1 → max)
- `"inverse"` - Inverted (0 → max, 1 → min)
- `"central"` - Center-based (0.5 → default, edges → min/max)

**`multiplier`** (float, default: `1.0`) - Scale factor applied to final value

---

### Note Velocity

Controls MIDI note velocity (dynamics):

```json
{
  "noteVelocity": {
    "control": "pressure",
    "min": 0,
    "max": 127,
    "default": 64,
    "curve": 4.0,
    "spread": "direct"
  }
}
```

**Common configurations:**
- **Pressure-sensitive:** `"control": "pressure"`, `"curve": 4.0`
- **Position-based:** `"control": "yaxis"`, `"spread": "inverse"`
- **Fixed velocity:** `"min": 100`, `"max": 100`

---

### Note Duration

Controls how long notes are held:

```json
{
  "noteDuration": {
    "control": "yaxis",
    "min": 0.15,
    "max": 1.5,
    "default": 1.0,
    "curve": 1.0,
    "spread": "central"
  }
}
```

Values are in **seconds**.

**Common configurations:**
- **Y-axis center:** `"control": "yaxis"`, `"spread": "central"`
- **Tilt-based:** `"control": "tiltXY"`
- **Fixed duration:** `"min": 0.5`, `"max": 0.5`

---

### Pitch Bend

Controls MIDI pitch bend messages:

```json
{
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

Values are normalized (-1.0 to 1.0). Your synth's pitch bend range determines semitones.

**Common configurations:**
- **Tilt-based:** `"control": "tiltXY"` (magnitude)
- **X-tilt only:** `"control": "tiltX"`
- **Position-based:** `"control": "xaxis"`, `"spread": "central"`

---

## Note Repeater

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

**`active`** (`boolean`) - Enable/disable repeater

**`pressureMultiplier`** (`float`) - How pressure affects repetition speed

**`frequencyMultiplier`** (`float`) - Overall repetition speed multiplier

**Use cases:**
- Tremolo effects
- Arpeggiated patterns
- Ambient textures
- Rapid percussion

Toggle on/off via button action: `"toggle-repeater"`

---

## Button Configuration

### Stylus Buttons

Configure the buttons on your stylus:

```json
{
  "stylusButtons": {
    "active": true,
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

**`active`** (`boolean`) - Enable stylus button handling

**`primaryButtonAction`** (action) - Action for primary (lower) button

**`secondaryButtonAction`** (action) - Action for secondary (upper) button

---

### Tablet Buttons

Configure express keys on your tablet:

**Preset (Recommended):**
```json
{
  "tabletButtons": "c-major-pop"
}
```

Uses a built-in chord progression preset. Available presets:
- `"c-major-pop"`, `"g-major-pop"`, etc.
- `"c-minor-soul"`, `"a-minor-soul"`, etc.
- `"c-major-jazz"`, `"blues-basic"`, etc.

See [Chords & Progressions](/about/chords-and-progressions/) for all presets.

**Custom Configuration:**
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
    "8": ["set-strum-notes", ["E2", "A2"]]
  }
}
```

Button numbers correspond to physical button positions (varies by tablet).

See [Actions Reference](/about/actions-reference/) for all available actions.

---

## Strum Release

Trigger a release note when lifting the stylus:

```json
{
  "strumRelease": {
    "active": false,
    "maxDuration": 0.25,
    "velocityMultiplier": 2,
    "midiNote": 38,
    "midiChannel": 11
  }
}
```

**`active`** (`boolean`) - Enable strum release

**`maxDuration`** (`float`, seconds) - Maximum time to trigger release

**`velocityMultiplier`** (`float`) - Velocity scale factor

**`midiNote`** (`integer`, 0-127) - MIDI note number to trigger

**`midiChannel`** (`integer`, 1-16) - MIDI channel for release note

**Use case:** Trigger a snare or cymbal sound on upstroke for percussion patterns.

---

## Complete Example

Here's a complete `settings.json` with common options:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useSocketServer": true,
    "socketServerPort": 8080,
    "useWebServer": true,
    "webServerPort": 82,
    "midiInputId": null
  },
  "strumming": {
    "midiChannel": 1,
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3,
    "pluckVelocityScale": 4.0,
    "pressureThreshold": 0.1
  },
  "noteVelocity": {
    "control": "pressure",
    "min": 0,
    "max": 127,
    "default": 64,
    "curve": 4.0,
    "spread": "direct",
    "multiplier": 1.0
  },
  "noteDuration": {
    "control": "yaxis",
    "min": 0.15,
    "max": 1.5,
    "default": 1.0,
    "curve": 1.0,
    "spread": "central",
    "multiplier": 1.0
  },
  "pitchBend": {
    "control": "tiltXY",
    "min": -1.0,
    "max": 1.0,
    "default": 0,
    "curve": 4.0,
    "spread": "direct",
    "multiplier": 1.0
  },
  "noteRepeater": {
    "active": false,
    "pressureMultiplier": 1.0,
    "frequencyMultiplier": 5.0
  },
  "stylusButtons": {
    "active": true,
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": "toggle-repeater"
  },
  "tabletButtons": "c-major-pop",
  "strumRelease": {
    "active": false,
    "maxDuration": 0.25,
    "velocityMultiplier": 2,
    "midiNote": 38,
    "midiChannel": 11
  }
}
```

## Configuration Templates

### Minimal Setup
```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  },
  "strumming": {
    "midiChannel": 1
  }
}
```
Everything else uses default values.

### Guitar-Style Strumming
```json
{
  "noteVelocity": { "control": "pressure", "curve": 4.0 },
  "pitchBend": { "control": "tiltX", "curve": 3.0 },
  "strumming": {
    "initialNotes": ["E3", "A3", "D4", "G4", "B4", "E5"],
    "upperNoteSpread": 1,
    "lowerNoteSpread": 0
  }
}
```

### Bass Performance
```json
{
  "strumming": {
    "initialNotes": ["E1", "A1", "D2", "G2"],
    "upperNoteSpread": 1,
    "lowerNoteSpread": 0,
    "midiChannel": 2
  },
  "noteDuration": { "min": 0.5, "max": 4.0 },
  "noteVelocity": { "max": 110 }
}
```

### Ambient Pad
```json
{
  "noteRepeater": { 
    "active": true, 
    "frequencyMultiplier": 2.0 
  },
  "noteDuration": { "min": 2.0, "max": 8.0 },
  "noteVelocity": { "max": 80, "curve": 2.0 },
  "strumming": {
    "initialNotes": ["C3", "E3", "G3", "B3", "D4"],
    "upperNoteSpread": 2,
    "lowerNoteSpread": 1
  }
}
```

## Validation & Debugging

### JSON Syntax Errors

If Strumboli won't start, check for JSON syntax errors:
- Missing commas between properties
- Unmatched braces `{}` or brackets `[]`
- Invalid quotes (use `"` not `'`)

**Use a JSON validator:** https://jsonlint.com/

### Value Errors

Common mistakes:
- MIDI channels must be 1-16 (not 0-15)
- Note names must use scientific notation: `"C4"` not `"C"`
- Boolean values: `true` / `false` (lowercase, no quotes)
- Numeric values: no quotes (`127` not `"127"`)

### Testing Changes

Most settings require restarting Strumboli to take effect:

```bash
# Stop the service
Ctrl+C

# Restart
python server/main.py
```

Watch the console output for configuration loading messages and errors.

