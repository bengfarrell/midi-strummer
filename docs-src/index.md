---
layout: page.njk
title: Welcome to Strumboli
description: Turn your drawing tablet into a MIDI strumming controller
---

# Welcome to Strumboli

**Strumboli** is a Python application that transforms your drawing tablet into an expressive MIDI strumming controller. Use your tablet's pressure, tilt, and position to create natural, dynamic MIDI performances with chord progressions, strumming patterns, and real-time expression control.

## What is Strumboli?

Strumboli reads input from HID-compatible drawing tablets (like XP-Pen, Wacom, etc.) and translates stylus movements into MIDI messages. It's designed for musicians who want to add expressive, guitar-like strumming to their DAW workflows or live performances.

### Key Features

- **Natural Strumming**: Use your tablet's X-axis to strum through chords with pressure-sensitive velocity control
- **Expressive Control**: Map pressure, tilt, and position to MIDI velocity, pitch bend, and note duration
- **Chord Progressions**: Built-in chord progression presets spanning major, minor, blues, jazz, rock, and gospel styles
- **Tablet Buttons**: Configure your tablet's express keys to switch chords, transpose, or toggle effects
- **Stylus Buttons**: Quick access to common actions with your stylus buttons
- **Jack MIDI Support**: Native integration with Zynthian and other Jack-based audio systems for professional setups
- **Flexible Configuration**: Comprehensive JSON-based configuration system with auto-detection for supported tablets
- **Web Dashboard**: Optional web interface for real-time monitoring and control

## Quick Example

With a simple configuration, your tablet becomes a chord strumming instrument:

```json
{
  "tabletButtons": "c-major-pop",
  "strumming": {
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3
  },
  "noteVelocity": {
    "control": "pressure",
    "curve": 4.0
  }
}
```

Press a tablet button to select a chord from the C Major Pop progression, then strum across your tablet to play notes with pressure-sensitive dynamics.

## Getting Started

1. **[Installation](/about/getting-started/)** - Set up Strumboli on your system
2. **[Jack MIDI Setup](/about/jack-midi/)** - Configure for Zynthian and professional audio (optional)
3. **[Running the Application](/about/running-overview/)** - Terminal, builds, and discovery tools
4. **[Configuration](/about/configuration-overview/)** - Settings, drivers, and dashboard
5. **[Tablet Setup](/about/tablet-setup/)** - Configure your specific tablet
6. **[Actions Reference](/about/actions-reference/)** - Learn what your buttons can do
7. **[Chords & Progressions](/about/chords-and-progressions/)** - Explore the chord system

## Who Is This For?

- **Electronic musicians** wanting expressive MIDI control
- **Producers** looking for natural strumming patterns
- **Live performers** needing dynamic, tactile controllers
- **Anyone with a drawing tablet** curious about alternative uses

## System Requirements

- Python 3.8 or higher (for running from source)
- HID-compatible drawing tablet (XP-Pen Deco 640 currently supported)
- macOS, Linux, or Windows
- MIDI output capability (built-in or virtual MIDI)
- Optional: Jack Audio Connection Kit (for Zynthian integration)

## Built with AI

Strumboli was created with significant assistance from AI, demonstrating how AI can be a powerful tool for software development. Learn more about the [development process and philosophy](/about/built-with-ai/).

Ready to get started? Head to the [Getting Started](/about/getting-started/) guide!