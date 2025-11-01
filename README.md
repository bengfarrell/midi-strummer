# Strumboli

A Python application for processing tablet input and generating MIDI output.

## Quick Start

### For End Users (Download & Run)

**Coming Soon:** Pre-built applications for easy installation!

Once available, simply:
1. Download the app for your platform (macOS/Windows/Linux)
2. Install system dependencies (see below)
3. Download or create your `settings.json` configuration file
4. Double-click to run!

See [DISTRIBUTION.md](DISTRIBUTION.md) for details on downloading and installing.

### For Developers (Run from Source)

Continue to the [Installation](#installation) section below.

## Building Standalone Apps

Want to package this as a distributable application? See:
- **[DISTRIBUTION.md](DISTRIBUTION.md)** - Complete guide for end-user distribution
- **[BUILD.md](BUILD.md)** - Detailed build instructions for developers

**Quick build:**

**macOS:**
```bash
# Using npm
npm run build:osx    # Build standalone app
npm run build:dmg    # Build app + create DMG installer

# Or using shell scripts directly
./build.sh           # Build standalone app
./create-dmg.sh      # Create macOS installer
```

**Linux/Raspberry Pi:**
```bash
# Using npm
npm run build:linux  # Build standalone app
npm run build:deb    # Build app + create Debian package

# Or using shell scripts directly
./build-linux.sh     # Build standalone app
./create-deb.sh      # Create Debian package installer
```

See **[RASPBERRY-PI-QUICKSTART.md](RASPBERRY-PI-QUICKSTART.md)** for Raspberry Pi setup guide!

### Device Discovery Tool

The discovery tool helps you create driver configs for new tablets:

**macOS:**
```bash
npm run build:discover:osx  # Build discovery tool
npm run build:discover:dmg  # Build + create DMG
```

**Linux/Raspberry Pi:**
```bash
npm run build:discover:linux  # Build discovery tool
npm run build:discover:deb    # Build + create .deb package
```

See **[DISCOVERY-INSTALLER-README.md](DISCOVERY-INSTALLER-README.md)** for details!

## Installation

### System Dependencies

**macOS:**
```bash
brew install hidapi
```

**Linux:**
```bash
sudo apt-get install libhidapi-hidraw0 libhidapi-dev
```

### Python Dependencies

1. Activate the virtual environment:
```bash
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Ensure your `settings.json` file is configured (see [Configuration](#configuration))
2. Run the server:
```bash
cd server
python main.py
```

Or from the project root:
```bash
python server/main.py
```

3. **To stop the server properly:**
   - Press **Ctrl+C** for graceful shutdown
   - The server will automatically close the device and MIDI connections
   - Wait for the "Device should be released now" message

**Important:** If you use Ctrl+Z, it suspends the process without releasing the device. If this happens:
- Bring the process back with `fg`
- Then press Ctrl+C to properly exit

## Troubleshooting

### HID Device Connection Issues

If you get "open failed" errors when trying to connect to your HID device, this usually means another process is holding the device. This can happen if:

- **XPPen driver is running** (most common cause)
- You stopped the server with Ctrl+Z (suspends process without cleanup)
- The process was killed unexpectedly
- Multiple instances of the server are running

**Solution:**

1. **Check for suspended or hung processes:**
   ```bash
   jobs -l
   ```
   If you have suspended jobs, resume them with `fg` then exit properly with Ctrl+C

2. **Use the force release utility:**
   ```bash
   python force_release_device.py
   ```
   This will help identify processes holding the device

3. **Check for XPPen driver processes:**
   ```bash
   ps aux | grep -i xppen
   ```

4. **Kill XPPen driver processes:**
   ```bash
   python kill_xppen_driver.py
   ```
   Or manually:
   ```bash
   kill -9 <XPPen_PID>
   ```

5. **Check for zombie Python processes:**
   ```bash
   ps aux | grep python | grep server.py
   ```

6. **Use the cleanup utility:**
   ```bash
   python cleanup_zombie_processes.py
   ```

7. **As a last resort:** Unplug and replug the USB device

The server now properly handles shutdown signals (Ctrl+C, Ctrl+Z, kill) and will automatically release the device with a proper delay to let the OS clean up.

**Note:** Killing the XPPen driver will disable XPPen's official software until you restart it. The driver will restart automatically when you reconnect your tablet.

### Device Not Found

If your tablet device is not found:

1. Make sure the device is connected and recognized by the system
2. Check that your `settings-python.json` configuration matches your device
3. Try running the server with debug output to see available devices
4. Ensure no other applications are using the device exclusively


## Configuration

The application uses `settings.json` for configuration. The app will search for this file in:
1. The application directory
2. Parent directory
3. Current working directory
4. Your home directory

### Example Settings

See `settings.json` in the project root for a complete example configuration.

### Jack MIDI Support (Zynthian Integration)

**NEW:** MIDI Strummer now supports Jack MIDI output for seamless integration with Zynthian and other Jack-based audio systems!

To enable Jack MIDI, add this to your `settings.json`:

```json
{
  "startupConfiguration": {
    "midiOutputBackend": "jack",
    "jackClientName": "midi_strummer"
  }
}
```

See **[JACK-MIDI-SETUP.md](JACK-MIDI-SETUP.md)** for complete setup instructions and **[settings-zynthian-example.json](settings-zynthian-example.json)** for a Zynthian-ready configuration!

### Curve Values

Logarithmic Curve Values:
- `1.0` → Linear (no curve, bypasses the mapping entirely)
- `2.0` → Gentle logarithmic curve
- `3.0` → Moderate curve - good balance
- `4.0` → Steep curve - very sensitive at low pressures
- `0.5` → Compressed - reduces low-end sensitivity

## Project Structure

```
midi-strummer/
├── server/              # Python MIDI service
│   ├── main.py         # Main entry point
│   ├── midi.py         # MIDI functionality
│   ├── strummer.py     # Strumming logic
│   ├── hidreader.py    # HID device reading
│   └── ...
├── src/                # Web/TypeScript interface (optional)
├── settings.json       # Configuration file
├── requirements.txt    # Python dependencies
├── build.sh           # Build script for standalone app
├── create-dmg.sh      # macOS installer creator
└── README.md          # This file
```

## Distribution

To create distributable applications:

**macOS:**
```bash
# Build standalone app
./build.sh

# Create DMG installer
./create-dmg.sh
```

**Linux/Raspberry Pi:**
```bash
# Build standalone app
./build-linux.sh

# Create Debian package
./create-deb.sh
```

For complete distribution instructions, see:
- [DISTRIBUTION.md](DISTRIBUTION.md) - General distribution guide
- [BUILD.md](BUILD.md) - macOS build instructions
- [LINUX-INSTALL.md](LINUX-INSTALL.md) - Linux installation and configuration
- [RASPBERRY-PI-QUICKSTART.md](RASPBERRY-PI-QUICKSTART.md) - Raspberry Pi quick start

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]