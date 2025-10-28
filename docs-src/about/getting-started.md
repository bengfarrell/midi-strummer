---
layout: page.njk
title: Getting Started
description: Install and run Strumboli on your system
---

# Getting Started

This guide will help you install and run Strumboli on your system.

## Prerequisites

Before you begin, ensure you have:

- **Python 3.7 or higher** installed on your system
- A **drawing tablet** (XP-Pen, Wacom, etc.) connected via USB
- **MIDI output** capability (built-in MIDI or virtual MIDI like IAC Driver on macOS)

## Installation

### Method 1: Pre-Built Application (Recommended)

**Coming Soon:** Pre-built standalone applications for easy installation!

Once available, simply:
1. Download the app for your platform (macOS/Windows/Linux)
2. Install system dependencies (see below)
3. Download or create your `settings.json` configuration file
4. Double-click to run!

### Method 2: Run from Source (Current Method)

#### Step 1: Install System Dependencies

**macOS:**
```bash
brew install hidapi
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install libhidapi-hidraw0 libhidapi-dev
```

**Linux (Fedora):**
```bash
sudo dnf install hidapi-devel
```

#### Step 2: Clone or Download the Repository

```bash
git clone https://github.com/yourusername/midi-strummer.git
cd midi-strummer
```

#### Step 3: Set Up Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 4: Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Configuration

### Quick Start Configuration

Create a `settings.json` file in the project root (or copy the provided example):

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useSocketServer": true,
    "useWebServer": true,
    "socketServerPort": 8080,
    "webServerPort": 82,
    "midiInputId": "Your MIDI Device Name"
  },
  "strumming": {
    "midiChannel": 1,
    "initialNotes": ["C4", "E4", "G4"]
  },
  "tabletButtons": "c-major-pop"
}
```

Key settings:
- **`drawingTablet`**: Use `"auto-detect"` to automatically find your tablet
- **`midiInputId`**: Name of your MIDI input device (optional, for receiving keyboard input)
- **`tabletButtons`**: Chord progression preset for your tablet buttons

For detailed configuration options, see the [Configuration Overview](/about/configuration-overview/).

## Running Strumboli

### Start the Server

```bash
cd server
python main.py
```

Or from the project root:

```bash
python server/main.py
```

You should see output like:
```
[Config] Auto-detecting device...
[Config] Loaded device driver: XP-Pen Deco 640
Loaded configuration from 'settings.json'
[WebSocket Server] Starting on port 8080...
[Web Server] Starting on port 82...
Opening MIDI output: IAC Driver Bus 1
Device opened successfully
```

### Access the Web Dashboard (Optional)

If `useWebServer` is enabled, open your browser to:

```
http://localhost:82
```

The dashboard shows:
- Current chord/notes being strummed
- Real-time tablet input values
- Active settings and configuration
- Connection status

## Basic Usage

Once running:

1. **Touch your tablet** with the stylus to start playing
2. **Move across the X-axis** to strum through notes
3. **Press harder** for louder notes (if pressure is mapped to velocity)
4. **Tilt the stylus** for pitch bend or other expressions
5. **Press tablet buttons** to change chords (if configured)
6. **Use stylus buttons** for quick actions like transpose

## Stopping the Server

To properly stop the server:

1. Press **Ctrl+C** in the terminal
2. Wait for the "Device should be released now" message
3. The server will automatically close MIDI and device connections

**Important:** Don't use Ctrl+Z (suspend), as it won't properly release the device. If you accidentally suspend:
- Type `fg` to bring the process back
- Then press Ctrl+C to exit properly

## Troubleshooting

### Device Not Found

If auto-detection fails:
1. Ensure your tablet is plugged in and powered on
2. Check that no other software is using the tablet exclusively
3. Try unplugging and replugging the tablet
4. See [Tablet Setup](/about/tablet-setup/) for manual configuration

### "Open Failed" or Device Already in Use

This usually means another process is holding the device. Common causes:
- **XPPen driver software is running** (most common)
- Previous Strumboli process wasn't stopped properly
- Multiple instances running

**Solution:**
1. Check for suspended processes: `jobs -l`
2. Quit tablet manufacturer's software
3. On macOS, quit the XPPen driver from Activity Monitor
4. Restart Strumboli

### MIDI Not Working

If MIDI notes aren't being sent:
1. Check your DAW/MIDI software is listening to the correct MIDI port
2. Verify `midiChannel` in settings matches your DAW channel
3. Check that your tablet is being detected (watch console output)
4. Try using a MIDI monitor application to verify output

### Web Dashboard Not Loading

If the web dashboard won't load:
1. Check that `useWebServer` is set to `true` in settings
2. Verify the `webServerPort` isn't already in use
3. Try a different port number (8080, 3000, etc.)
4. Check your firewall settings

## Next Steps

Now that Strumboli is running:

- **[Configuration Overview](/about/configuration-overview/)** - Learn about all available settings
- **[Tablet Setup](/about/tablet-setup/)** - Configure your specific tablet
- **[Actions Reference](/about/actions-reference/)** - Set up button actions
- **[Chords & Progressions](/about/chords-and-progressions/)** - Explore the chord system
- **[Settings Reference](/about/settings-reference/)** - Complete settings documentation

## Additional Resources

- **README.md** - Project overview and quick reference
- **BUILD.md** - Instructions for building standalone applications
- **DISTRIBUTION.md** - Packaging and distribution guide

