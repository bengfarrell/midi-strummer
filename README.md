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
