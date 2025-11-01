---
layout: page.njk
title: Run from Source
description: Set up and run Strumboli directly from the Git repository
---

# Run from Source

This guide covers how to run Strumboli directly from the Git repository as a Python service. This method is ideal for developers, contributors, or users who want the latest features before they're packaged into releases.

## Overview

Running from source means:
- Pulling the code directly from Git
- Setting up a Python virtual environment
- Installing dependencies manually
- Running the Python service directly

This gives you full access to the codebase and makes it easy to modify, debug, or contribute changes.

## Prerequisites

Before you begin, ensure you have:

- **Git** installed on your system
- **Python 3.8 or higher** (check with `python3 --version`)
- A **drawing tablet** connected via USB
- **System dependencies** for HID device support (see below)
- **MIDI output** capability (built-in or virtual MIDI)

## Step-by-Step Setup

### 1. Install System Dependencies

These libraries are required for HID device communication:

**macOS:**
```bash
brew install hidapi
```

**Linux (Debian/Ubuntu/Raspberry Pi):**
```bash
sudo apt-get install libhidapi-hidraw0 libhidapi-dev
```

**Linux (Fedora):**
```bash
sudo dnf install hidapi-devel
```

**Linux (Arch):**
```bash
sudo pacman -S hidapi
```

### 2. Clone the Repository

Clone the Strumboli repository from GitHub:

```bash
git clone https://github.com/bengfarrell/strumboli.git
cd strumboli
```

Or if you've already cloned it, pull the latest changes:

```bash
cd strumboli
git pull origin main
```

### 3. Create a Virtual Environment

It's strongly recommended to use a Python virtual environment to avoid dependency conflicts:

```bash
python3 -m venv venv
```

This creates a `venv` directory containing an isolated Python environment.

### 4. Activate the Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` appear in your terminal prompt, indicating the virtual environment is active.

### 5. Install Python Dependencies

With the virtual environment activated, install all required Python packages:

```bash
pip install -r requirements.txt
```

This installs:
- `python-rtmidi` - MIDI functionality
- `hidapi` - HID device support
- `websockets` - WebSocket server support
- `typing-extensions` - Type hints
- `pyinstaller` - For building standalone apps (optional)

### 6. Create Your Configuration File

Create a `settings.json` file in the project root directory. Start with this minimal configuration:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useSocketServer": true,
    "useWebServer": true,
    "socketServerPort": 8080,
    "webServerPort": 82,
    "midiInputId": null
  },
  "strumming": {
    "midiChannel": 1,
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3
  },
  "noteVelocity": {
    "control": "pressure",
    "curve": 3.0
  },
  "tabletButtons": "c-major-pop"
}
```

Key settings explained:
- **`drawingTablet`**: Use `"auto-detect"` to automatically find supported tablets
- **`midiChannel`**: MIDI channel for note output (1-16)
- **`initialNotes`**: The chord notes to strum through
- **`tabletButtons`**: Chord progression preset for tablet button mappings

See [Configuration Overview](/about/configuration-overview/) for complete settings documentation.

## Running the Service

### Start the Python Service

With your virtual environment activated and `settings.json` configured, start the service:

```bash
cd server
python main.py
```

Or from the project root:

```bash
python server/main.py
```

### Expected Output

You should see output similar to:

```
[Config] Auto-detecting device...
[Config] Found device: XP-Pen Deco 640
[Config] Loaded device driver: XP-Pen Deco 640
Loaded configuration from 'settings.json'
[WebSocket Server] Starting on port 8080...
[Web Server] Starting on port 82...
Opening MIDI output: IAC Driver Bus 1
Device opened successfully
Listening for tablet input...
```

This indicates:
- ✓ Your tablet was detected
- ✓ Configuration was loaded
- ✓ WebSocket server is running
- ✓ Web server is running (if enabled)
- ✓ MIDI output is connected
- ✓ Tablet input is being monitored

### Access the Web Dashboard

If you enabled the web server (`useWebServer: true`), open your browser to:

```
http://localhost:82
```

The dashboard shows:
- Current active notes and chords
- Real-time tablet input values (X, Y, pressure, tilt)
- Configuration status
- Connection information

### Stopping the Service

To properly stop the service:

1. Press **Ctrl+C** in the terminal
2. Wait for the shutdown message: `"Device should be released now"`
3. The service will automatically:
   - Close MIDI connections
   - Release the HID device
   - Stop the web servers

**Important:** Don't use **Ctrl+Z** (suspend), as it won't properly release the device. If you accidentally suspend the process:
- Type `fg` to bring it back to the foreground
- Then press Ctrl+C to exit cleanly

## Daily Workflow

Once you've completed the initial setup, your daily workflow is simple:

```bash
# 1. Navigate to the project directory
cd /path/to/strumboli

# 2. Activate the virtual environment
source venv/bin/activate

# 3. Pull latest changes (optional)
git pull origin main

# 4. Start the service
python server/main.py

# 5. When done, press Ctrl+C to stop
```

## Updating to Latest Version

To get the latest features and bug fixes:

```bash
# 1. Stop the service if running (Ctrl+C)

# 2. Pull latest changes
git pull origin main

# 3. Update Python dependencies (if requirements.txt changed)
source venv/bin/activate
pip install -r requirements.txt

# 4. Restart the service
python server/main.py
```

## Troubleshooting

### Virtual Environment Not Activating

If `source venv/bin/activate` doesn't work:

**Check if venv exists:**
```bash
ls -la venv/
```

If it doesn't exist, create it:
```bash
python3 -m venv venv
```

**Windows users:** Use `venv\Scripts\activate` instead

### "Device Not Found" or Auto-Detection Fails

If your tablet isn't detected:

1. **Check USB connection:**
   ```bash
   # macOS
   system_profiler SPUSBDataType | grep -i pen
   
   # Linux
   lsusb | grep -i pen
   ```

2. **Check if another process is using the device:**
   - Quit the manufacturer's tablet software (XPPen driver, Wacom Desktop Center, etc.)
   - Check for hung Python processes: `ps aux | grep python`

3. **Try manual device configuration:**
   - See [Tablet Setup](/about/tablet-setup/) for manual configuration instructions
   - Check available drivers in `server/drivers/` directory

### "Open Failed" or Device Already in Use

This usually means another process has exclusive access to the device:

**Common causes:**
- Tablet manufacturer's driver software is running
- Previous Strumboli process didn't exit cleanly
- Multiple instances of the service are running

**Solutions:**

1. **Check for suspended jobs:**
   ```bash
   jobs -l
   ```
   Resume with `fg` and exit properly with Ctrl+C

2. **Find and stop processes using the device:**
   ```bash
   # Find Python processes
   ps aux | grep python | grep main.py
   
   # Kill specific process if needed (use the PID from above)
   kill -9 <PID>
   ```

3. **Quit manufacturer's software:**
   - **macOS:** Use Activity Monitor to quit XPPen or Wacom processes
   - **Linux:** `pkill -i xppen` or `pkill -i wacom`

4. **Last resort:** Unplug and replug the USB device

### MIDI Output Not Working

If notes aren't being sent:

1. **Verify MIDI device in configuration:**
   - Check available MIDI ports (shown at startup)
   - Update `midiOutput` in `settings.json` if needed

2. **Test with MIDI monitor:**
   - **macOS:** Use MIDI Monitor app
   - **Linux:** Use `aseqdump` or `qmidiarp`
   - **Windows:** Use MIDI-OX

3. **Check DAW settings:**
   - Ensure your DAW is listening to the correct MIDI input
   - Verify MIDI channel matches (`midiChannel` in settings)

### Permission Errors on Linux

If you get permission denied errors accessing the device:

```bash
# Add your user to the plugdev group
sudo usermod -a -G plugdev $USER

# Create udev rule for your device
echo 'SUBSYSTEM=="hidraw", ATTRS{idVendor}=="28bd", MODE="0666"' | sudo tee /etc/udev/rules.d/99-hidraw.rules

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# Log out and back in for group changes to take effect
```

(Replace `28bd` with your device's vendor ID from `lsusb`)

### Module Import Errors

If you get `ModuleNotFoundError`:

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# If still failing, try upgrading pip first
pip install --upgrade pip
pip install -r requirements.txt
```

## Development Tips

### Running in Debug Mode

For more verbose output during development:

```bash
# Set Python to unbuffered output
PYTHONUNBUFFERED=1 python server/main.py
```

### File Watching for Auto-Reload

For development, you might want automatic restarts when files change. Install `watchdog`:

```bash
pip install watchdog
```

Create a simple watch script:
```bash
# watch.sh
#!/bin/bash
watchmedo auto-restart --directory=./server --pattern="*.py" --recursive -- python server/main.py
```

### Testing Configuration Changes

To test configuration changes without restarting:
1. Modify `settings.json`
2. Stop the service (Ctrl+C)
3. Restart with `python server/main.py`

The service reloads the configuration on each start.

### Adding Custom Device Drivers

To add support for a new tablet:

1. **Use the device discovery tool:**
   ```bash
   python server/discovery/discover_device.py
   ```

2. **Copy the output to a new driver file:**
   ```bash
   # Create new driver JSON in server/drivers/
   nano server/drivers/my_tablet_model.json
   ```

3. **Update settings.json:**
   ```json
   {
     "startupConfiguration": {
       "drawingTablet": "my_tablet_model"
     }
   }
   ```

See [Tablet Setup](/about/tablet-setup/) for more details.

## Contributing

Running from source makes it easy to contribute:

1. **Fork the repository** on GitHub
2. **Create a feature branch:** `git checkout -b my-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes:** `git commit -am 'Add new feature'`
5. **Push to your fork:** `git push origin my-feature`
6. **Submit a pull request** on GitHub

See the main repository for contribution guidelines.

## Building Standalone Applications

Once you're comfortable running from source, you might want to build standalone applications:

- **[BUILD.md](https://github.com/bengfarrell/strumboli/blob/main/BUILD.md)** - Build instructions
- **[DISTRIBUTION.md](https://github.com/bengfarrell/strumboli/blob/main/DISTRIBUTION.md)** - Distribution guide
- **[RASPBERRY-PI-QUICKSTART.md](https://github.com/bengfarrell/strumboli/blob/main/RASPBERRY-PI-QUICKSTART.md)** - Raspberry Pi guide

