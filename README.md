# MIDI Strummer

A Python implementation of the MIDI Strummer application for processing tablet input and generating MIDI output.

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

1. Ensure your `settings-python.json` file is configured
2. Run the server:
```bash
python src/python/server.py
```

## Troubleshooting

### HID Device Connection Issues

If you get "open failed" errors when trying to connect to your HID device, this usually means another process is holding the device. This can happen if:

- **XPPen driver is running** (most common cause)
- You stopped the server with Ctrl+C but the process didn't clean up properly
- The process was killed unexpectedly
- Multiple instances of the server are running

**Solution:**

1. **Check for XPPen driver processes:**
   ```bash
   ps aux | grep -i xppen
   ```

2. **Kill XPPen driver processes:**
   ```bash
   python kill_xppen_driver.py
   ```
   Or manually:
   ```bash
   kill -9 <XPPen_PID>
   ```

3. **Check for zombie Python processes:**
   ```bash
   ps aux | grep python | grep server.py
   ```

4. **Use the cleanup utility:**
   ```bash
   python cleanup_zombie_processes.py
   ```

The server now includes automatic detection and will warn you if XPPen driver or other processes are running that might interfere with HID device access.

**Note:** Killing the XPPen driver will disable XPPen's official software until you restart it. The driver will restart automatically when you reconnect your tablet.

### Device Not Found

If your tablet device is not found:

1. Make sure the device is connected and recognized by the system
2. Check that your `settings-python.json` configuration matches your device
3. Try running the server with debug output to see available devices
4. Ensure no other applications are using the device exclusively
