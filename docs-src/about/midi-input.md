---
layout: page.njk
title: MIDI Input
description: Connect MIDI keyboards and controllers
---

# MIDI Input

Configure Strumboli to receive MIDI input from keyboards or controllers, allowing you to combine keyboard note selection with tablet expression.

## midiInputId

**Type:** `string` or `null`  
**Default:** `null`  
**Description:** MIDI input device name for receiving keyboard input

When configured, Strumboli listens to the specified MIDI device for note messages. The incoming notes determine which notes are strummed when you use the tablet.

---

## How It Works

### Normal Mode (No MIDI Input)
1. Tablet buttons select chords
2. Tablet strumming plays those chord notes
3. Expression comes from tablet (pressure, tilt, position)

### MIDI Input Mode
1. **MIDI keyboard** selects which notes to play
2. **Tablet strumming** triggers those notes
3. **Expression** still comes from tablet (pressure, tilt)

This gives you the best of both worlds: keyboard note selection + tablet expression!

---

## Configuration

### Disable MIDI Input (Default)
```json
{
  "startupConfiguration": {
    "midiInputId": null
  }
}
```

### Enable MIDI Input
```json
{
  "startupConfiguration": {
    "midiInputId": "Launchkey MK4 25 MIDI Out"
  }
}
```

**Finding your device name:**
1. Run Strumboli without `midiInputId` set
2. Check console output for available MIDI devices
3. Copy exact device name into configuration
4. Restart Strumboli

---

## Use Cases

### Piano-Style Performance
Play chords on keyboard, strum with tablet for dynamics:
```json
{
  "startupConfiguration": {
    "midiInputId": "Digital Piano MIDI Out"
  },
  "noteVelocity": {
    "control": "pressure",
    "curve": 4.0
  }
}
```

### Bass Lines
Play bass notes on keyboard with tablet expression:
```json
{
  "startupConfiguration": {
    "midiInputId": "MIDI Controller",
    "strumming": {
      "upperNoteSpread": 0,
      "lowerNoteSpread": 1
    }
  }
}
```

### Melody with Expression
Keyboard for melody, tablet for articulation:
```json
{
  "startupConfiguration": {
    "midiInputId": "MIDI Keyboard"
  },
  "noteDuration": {
    "control": "yaxis",
    "min": 0.1,
    "max": 2.0
  },
  "pitchBend": {
    "control": "tiltX"
  }
}
```

---

## Common MIDI Devices

### MIDI Keyboards
- Novation Launchkey series
- Arturia KeyLab series
- M-Audio Keystation series
- Roland A-series
- Native Instruments Komplete Kontrol

### MIDI Controllers
- AKAI MPK Mini
- Novation Launchpad
- Arturia BeatStep
- Korg nanoKEY

### Virtual MIDI
- **macOS**: IAC Driver (Audio MIDI Setup)
- **Windows**: loopMIDI, MIDI-OX
- **Linux**: ALSA virtual ports

---

## MIDI Input Behavior

### Note On Messages
- **Single note**: Plays that note with tablet expression
- **Multiple notes** (chord): Plays all notes simultaneously
- **Note spread**: Affected by `upperNoteSpread` and `lowerNoteSpread` settings

### Note Off Messages
- Releases notes based on `noteDuration` settings
- Can be overridden by tablet release

### Velocity
- MIDI velocity is **ignored** by default
- Tablet pressure controls velocity via `noteVelocity` settings
- This allows consistent dynamics regardless of keyboard touch

### Sustain/Hold Pedal
- Hold pedal extends note duration
- Overrides `noteDuration` settings while held
- Notes release when pedal is released

---

## Configuration Examples

### Simple Keyboard Input
```json
{
  "startupConfiguration": {
    "midiInputId": "USB MIDI Keyboard"
  }
}
```

### Keyboard + Tablet Buttons
```json
{
  "startupConfiguration": {
    "midiInputId": "MIDI Keyboard"
  },
  "tabletButtons": {
    "1": ["transpose", 12],
    "2": ["transpose", -12],
    "3": "toggle-repeater"
  }
}
```

### Virtual MIDI from DAW
```json
{
  "startupConfiguration": {
    "midiInputId": "IAC Driver Bus 1"
  }
}
```

---

## Troubleshooting

### Device Not Found

1. Check device is connected and powered on
2. Verify device name spelling (case-sensitive)
3. Check Strumboli console output for available devices
4. Try disconnecting and reconnecting device
5. Restart Strumboli after connecting device

### No Notes Triggering

1. Verify MIDI input is connected
2. Check `midiInputId` matches device name exactly
3. Test device in another MIDI application
4. Look for error messages in console
5. Verify MIDI channels match (if applicable)

### Notes Stuck

1. Press keys again to send Note Off
2. Check for MIDI feedback loops
3. Restart Strumboli
4. Disconnect and reconnect MIDI device

### Wrong Notes Playing

1. Verify `upperNoteSpread` and `lowerNoteSpread` settings
2. Check transpose settings
3. Ensure correct MIDI octave on keyboard
4. Test with simple single notes first

---

## Advanced: Virtual MIDI Setup

### macOS
1. Open **Audio MIDI Setup**
2. Window → Show MIDI Studio
3. Double-click **IAC Driver**
4. Check "Device is online"
5. Use `"midiInputId": "IAC Driver Bus 1"`

### Windows (loopMIDI)
1. Download and install loopMIDI
2. Create new virtual port
3. Use that port name in `midiInputId`

### Linux (ALSA)
```bash
# Create virtual port
aconnect -l
# Note port numbers, then:
aconnect [source] [destination]
```

---

## Related Documentation

- [Server & Startup](/about/server-startup/) - Overview of startup features
- [Strumming](/about/strumming/) - Note spread configuration
- [Note Velocity](/about/note-velocity/) - Dynamics control
- [Tablet Buttons](/about/tablet-buttons/) - Button configuration

