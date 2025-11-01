---
layout: page.njk
title: Configuration
description: Overview of Strumboli's configuration system
---

# Configuration

Strumboli's configuration system gives you complete control over device detection, MIDI expression, and interface options. This section covers the three main configuration components.

## Configuration Components

### 1. Settings File (settings.json)

The central configuration file that controls all aspects of Strumboli's behavior.

**[Settings File Guide →](/about/configuration-settings/)**

**Covers:**
- Device detection (auto-detect vs manual)
- MIDI channel and note configuration
- Expression mapping (velocity, duration, pitch bend)
- Button actions and chord progressions
- Server settings

**Key topics:**
- Auto-detection vs specifying devices
- Expression control parameters
- Curve and spread settings
- Button configuration
- Configuration templates

---

### 2. Device Drivers

JSON files that define how to interpret data from your drawing tablet.

**[Device Drivers Guide →](/about/configuration-drivers/)**

**Covers:**
- Driver file structure and format
- Byte mapping specifications
- Creating custom drivers
- Using the discovery tool
- Platform-specific drivers

**Key topics:**
- Understanding byte code mappings
- X/Y coordinates and pressure
- Tilt and button detection
- Multi-interface devices
- Testing and contributing drivers

---

### 3. Web Dashboard

Real-time web interface for monitoring and visualization.

**[Web Dashboard Guide →](/about/configuration-dashboard/)**

**Covers:**
- Enabling and accessing the dashboard
- Real-time tablet input visualization
- MIDI output monitoring
- Configuration display
- Network access and remote monitoring

**Key topics:**
- WebSocket protocol
- Message types and format
- Custom dashboard development
- Performance metrics
- Troubleshooting

---

## Configuration Workflow

See **[Settings File](/about/configuration-settings/)** for complete configuration examples including:
- **Minimal setup** - Just auto-detect and go
- **Standard setup** - Dashboard and basic expression
- **Advanced setup** - Full control with custom devices
- **Style-specific templates** - Guitar, bass, ambient, percussion configurations

---

## Configuration Files Overview

### Location Hierarchy

Strumboli searches for files in this order:

1. **Settings File** (`settings.json`)
   - Application directory
   - Parent directory
   - Current working directory
   - Home directory

2. **Device Drivers** (automatically loaded)
   - `server/drivers/*.json`
   - Matched by vendor/product ID or name

3. **Chord Progressions** (built-in)
   - `server/chord_progressions.json`
   - Referenced by name in settings

---

## Common Configuration Patterns

Popular setup styles for different musical contexts:

- **Guitar-Style** - Pressure velocity, tilt pitch bend, guitar note range
- **Bass Performance** - Low note range, longer sustain, separate channel
- **Ambient/Pad** - Note repeater, long durations, soft velocity
- **Percussion/Drums** - Channel 10, short durations, strum release

See **[Settings File - Configuration Templates](/about/configuration-settings/#configuration-templates)** for complete examples of each style.

---

## Configuration Tips

### Start with Defaults

Most settings have sensible defaults. Only configure what you need to change.

### Use Auto-Detection

For standard setups, `"drawingTablet": "auto-detect"` works great.

### Enable the Dashboard

The web dashboard is invaluable for understanding what's happening and debugging issues.

### Test Changes Incrementally

Make one change at a time and test before adding more complexity.

### Document Your Setup

Add comments to your settings file (though JSON doesn't officially support comments, keep a separate notes file):

```
settings.json - My guitar-style strumming setup
- Pressure controls velocity with steep curve
- Tilt X for pitch bend
- C major pop progression on buttons
```

---

## Troubleshooting Configuration

### Device Not Found

**Problem:** `[Config] Device not found`

**Solutions:**
1. Check device is plugged in
2. Use `"auto-detect"` instead of specific device
3. Verify device is supported (check `server/drivers/`)
4. Use [Discovery Tool](/about/discovery/) to create driver

### Invalid JSON

**Problem:** `JSON parse error`

**Solutions:**
1. Check commas between properties
2. Verify quotes are double quotes (`"`)
3. Match all braces `{}` and brackets `[]`
4. Use online JSON validator

### Settings Not Applied

**Problem:** Changes don't take effect

**Solution:** Restart Strumboli - most settings require restart:
```bash
# Stop with Ctrl+C
# Restart
python server/main.py
```

### MIDI Not Working

**Problem:** No MIDI output

**Solutions:**
1. Check `midiChannel` matches your DAW
2. Verify tablet is detected
3. Test pressure threshold (lower it)
4. Enable dashboard to see MIDI events

---

## Advanced Configuration

### Multiple Tablets

Specify exactly which tablet to use:

```json
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640_osx"
  }
}
```

### Custom MIDI Routing

Use different channels for different features:

```json
{
  "strumming": { "midiChannel": 1 },
  "strumRelease": { "midiChannel": 10 }
}
```

### Platform-Specific Drivers

Create separate settings files:
- `settings-macos.json`
- `settings-linux.json`
- `settings-windows.json`

Load with: `python server/main.py --config settings-macos.json`

---

## Configuration Reference

For detailed information on every configuration option:

### Core Sections

- **startupConfiguration** - Device and server settings
- **strumming** - Core strumming parameters
- **noteVelocity** - Velocity expression mapping
- **noteDuration** - Note length control
- **pitchBend** - Pitch bend mapping
- **noteRepeater** - Repetition effects
- **stylusButtons** - Stylus button actions
- **tabletButtons** - Tablet button actions
- **strumRelease** - Release trigger settings

### Full Documentation

See [Settings File](/about/configuration-settings/) for complete parameter documentation.

