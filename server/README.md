# MIDI Strummer - Python Implementation

This is a Python port of the Node.js MIDI Strummer application. It provides the same functionality for processing tablet input and generating MIDI output.

## Installation

### System Dependencies

First, install the system HID library:

**macOS:**
```bash
brew install hidapi
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install libhidapi-hidraw0 libhidapi-dev
```

**Windows:**
Download precompiled binaries from [hidapi releases](https://github.com/libusb/hidapi/releases)

### Python Dependencies

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

**Note**: If you get "No module named 'hid'" error, try installing one of these alternatives:
```bash
# Option 1 (recommended)
pip install hid

# Option 2 (if option 1 fails)
pip install pyhidapi

# Option 3 (if others fail)
pip install hidapi
```

The code will automatically detect which HID package is available.

## Dependencies

- **python-rtmidi**: MIDI input/output functionality (equivalent to `jzz` in Node.js)
- **hid/pyhidapi/hidapi**: HID device support (equivalent to `node-hid`)
- **websockets**: WebSocket server support (equivalent to `ws`)

## Usage

1. Ensure your `settings.json` file is in the project root directory (or parent directory)
2. Run the server:
```bash
python main.py
```

Or from the project root:
```bash
python server/main.py
```

## File Structure

- `main.py` - Main application entry point
- `datahelpers.py` - Data parsing utilities
- `finddevice.py` - HID device discovery and connection
- `socketserver.py` - WebSocket server implementation
- `midi.py` - Base MIDI functionality
- `nodemidi.py` - Node.js-style MIDI implementation
- `midievent.py` - MIDI event definitions
- `note.py` - Note parsing and music theory utilities
- `strummer.py` - Strumming logic and note triggering
- `eventlistener.py` - Event system implementation

## Configuration

The Python implementation uses the same `settings.json` configuration file as the Node.js version. No changes are required to the configuration format.

## Differences from Node.js Version

- Uses `python-rtmidi` instead of `jzz` for MIDI functionality
- Uses `hidapi` instead of `node-hid` for HID device access
- Uses `websockets` instead of `ws` for WebSocket functionality
- Implements proper async/await patterns for WebSocket handling
- Uses Python's signal handling for graceful shutdown

## Running

Make sure you have the required system dependencies installed:

### macOS
```bash
brew install portmidi
```

### Linux
```bash
sudo apt-get install libasound2-dev
sudo apt-get install libhidapi-dev
```

### Windows
The packages should install the required dependencies automatically.

