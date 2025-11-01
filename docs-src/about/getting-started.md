---
layout: page.njk
title: Getting Started
description: Quick start guide to install and run Strumboli
---

# Getting Started

Get up and running with Strumboli quickly. Choose your installation method and start strumming!

## Prerequisites

- **Python 3.8 or higher** (for running from source)
- **Drawing tablet** - XP-Pen Deco 640 (currently supported)
- **MIDI capability** - Built-in or virtual MIDI output
- **Operating System** - macOS, Linux, or Windows

### Supported Tablet

**XP-Pen Deco 640**  
Currently, Strumboli has full driver support for the XP-Pen Deco 640.

**Important:** You'll need to install the official XP-Pen drivers for your tablet to be recognized by your system:

📥 **[Download XP-Pen Deco 640 Drivers](https://www.xp-pen.com/download/deco-640.html)**

For other tablets, see the [Discovery Tool](/about/discovery/) to create custom drivers.

---

## Installation Options

### Option 1: Download Pre-Built App (Recommended)

**Strumboli Application:**

- 📥 [Download for macOS](https://github.com/bengfarrell/strumboli/releases) (Coming Soon)
- 📥 [Download for Linux](https://github.com/bengfarrell/strumboli/releases) (Coming Soon)
- 📥 [Download for Windows](https://github.com/bengfarrell/strumboli/releases) (Coming Soon)

**Installation:**
1. Download the app for your platform
2. Install XP-Pen drivers (see link above)
3. Install system dependencies (see below)
4. Download or create `settings.json` configuration
5. Run the application

See **[Builds & Installers](/about/builds/)** for detailed installation instructions.

---

**Device Discovery Tool:**

Need to add support for a new tablet? Download the discovery tool:

- 📥 [Discovery Tool for macOS](https://github.com/bengfarrell/strumboli/releases) (Coming Soon)
- 📥 [Discovery Tool for Linux](https://github.com/bengfarrell/strumboli/releases) (Coming Soon)

See **[Discovery Tool](/about/discovery/)** for usage instructions.

---

### Option 2: Run from Source (Developers)

For developers and contributors who want the latest features and full access to the codebase.

See **[Run from Source](/about/run-from-source/)** for complete setup guide including:
- System dependencies installation
- Git repository setup
- Virtual environment configuration
- Daily workflow
- Troubleshooting and development tips

---

## System Dependencies

System dependencies are required for HID device communication.

See **[Run from Source](/about/run-from-source/#1-install-system-dependencies)** for complete installation instructions for macOS, Linux, and Windows.

---

## Quick Configuration

Create a minimal `settings.json` file:

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

This auto-detects your tablet and sets up basic MIDI output on channel 1.

See **[Settings File](/about/configuration-settings/)** for complete configuration options including chord progressions, expression controls, and button mappings.

---

## Running Strumboli

### From Pre-Built App

Double-click the application icon or run from terminal.

### From Source

```bash
python server/main.py
```

**Expected Output:**
```
[Config] Auto-detecting device...
[Config] Loaded device driver: XP-Pen Deco 640
Loaded configuration from 'settings.json'
Opening MIDI output: IAC Driver Bus 1
Device opened successfully
```

### Web Dashboard (Optional)

If enabled in settings, access the dashboard at:
```
http://localhost:82
```

See **[Web Dashboard](/about/configuration-dashboard/)** for details.

---

## Basic Usage

Once running:

1. **Touch tablet** with stylus
2. **Move horizontally** to strum through notes
3. **Vary pressure** for dynamics
4. **Tilt stylus** for pitch bend
5. **Press tablet buttons** to change chords

---

## Troubleshooting

### Common Issues

**Tablet not detected:** Install [XP-Pen drivers](https://www.xp-pen.com/download/deco-640.html) and ensure the tablet is connected.

**"Open failed" error:** Close the XP-Pen application (not just the drivers). The manufacturer's software locks the device.

**No MIDI output:** Check that `midiChannel` in your settings matches your DAW's input channel.

### Detailed Help

See comprehensive troubleshooting guides:
- **[Run from Source](/about/run-from-source/#troubleshooting)** - Installation, dependencies, and device issues
- **[Configuration Settings](/about/configuration-settings/#validation--debugging)** - Configuration problems
- **[Device Drivers](/about/configuration-drivers/#troubleshooting-drivers)** - Driver creation and detection

