# HID Device Discovery Tools

Interactive tools for discovering and configuring new drawing tablets and HID devices for Strumboli.

## Standalone Installers Available

Pre-built installers are available for easy installation:

**macOS:** Download `Strumboli-Discover-Installer.dmg`  
**Linux/Raspberry Pi:** Download `strumboli-discover-VERSION-raspberry-pi.deb`

See **[DISCOVERY-INSTALLER-README.md](../../DISCOVERY-INSTALLER-README.md)** for installation instructions.

Or build from source using the instructions below.

## Tools

### 1. discover_device.py

**Interactive wizard** that automatically discovers byte mappings by guiding you through actions.

**Usage:**
```bash
cd server/discovery
python3 discover_device.py
```

**Process:**
1. Lists all connected HID devices
2. Let you select your tablet
3. **Monitors ALL interfaces simultaneously** to see what they do
4. **Shows analysis:** Which interfaces have stylus data, buttons, etc.
5. Let you choose which interfaces to analyze in detail
6. **Guides you through 12 precise actions:**
   - Keep stylus away (baseline)
   - Hover stylus (detect hover state)
   - Touch stylus (detect contact)
   - Move stylus around (general movement)
   - Horizontal sweep (accurate X max)
   - Vertical sweep (accurate Y max)
   - Press hard (detect pressure)
   - Tilt left (detect left tilt)
   - Tilt right (detect right tilt)
   - Tilt forward (detect forward tilt)
   - Tilt back (detect back tilt)
   - Press each button (detect button mapping)
7. **Automatically analyzes data** to determine byte positions
8. Generates driver config with **auto-detected mappings**
9. Saves the config to a JSON file

**Output:** A driver JSON file with real, working byte mappings - ready to test!

### 2. data_monitor.py

Real-time monitor for HID device data streams. Helps understand byte layouts and mappings.

**Usage:**
```bash
# Monitor a specific device
python3 data_monitor.py 0x28bd 0x2904

# Monitor a specific interface
python3 data_monitor.py 0x28bd 0x2904 -i 1
```

**Features:**
- Shows hex dump of raw HID data
- Attempts to decode coordinates, pressure
- Highlights button data (non-zero byte 2)
- Suppresses repeated identical packets

**Use this to:**
- Understand which bytes contain X/Y coordinates
- Find button bit positions
- Detect pressure and tilt byte locations
- Identify Report IDs

### 3. multi_interface_monitor.py

Monitor multiple interfaces simultaneously (for tablets that split stylus/buttons).

**Usage:**
```bash
python3 multi_interface_monitor.py 0x28bd 0x2904
```

Shows data from all interfaces side-by-side for comparison.

## Workflow

### Creating a Driver for a New Device

**Step 1: Run Interactive Discovery Wizard**
```bash
python3 discover_device.py
```

Follow the on-screen prompts:
1. Select your tablet
2. Choose interfaces to use
3. **Perform the guided actions** when prompted:
   - Keep stylus away
   - Hover stylus above tablet
   - Touch tablet lightly
   - Move stylus in circles/zigzag
   - Press down hard
   - Tilt stylus left/right, forward/back
   - Press each tablet button

The tool will **automatically analyze** the data and determine:
- Status byte and codes
- X/Y coordinate byte positions and ranges
- Pressure byte positions and max values
- Tilt byte positions
- Button byte and bit mapping

**Step 2: Review Auto-Generated Config**

The tool creates a driver JSON with **real detected values**:

```json
{
  "x": {
    "byteIndices": [2, 3],  // ✓ Auto-detected!
    "max": 31984,           // ✓ Actual max value from your tablet!
    "type": "multi-byte-range"
  },
  "pressure": {
    "byteIndices": [6, 7],  // ✓ Auto-detected!
    "max": 8191,            // ✓ Actual max from your device!
    "type": "multi-byte-range"
  },
  "tabletButtons": {
    "byteIndex": 2,         // ✓ Auto-detected!
    "buttonCount": 8,
    "type": "bit-flags"
  }
}
```

**Step 3: Test the Driver**

Copy your driver to `../drivers/` and test it:

```bash
cp my_tablet_linux.json ../drivers/
```

Update `settings.json` to use your new driver:
```json
{
  "startupConfiguration": {
    "drawingTablet": "my_tablet_linux"
  }
}
```

**Step 4: Refine (if needed)**

Most of the time, auto-detected mappings work perfectly! But if something seems off:

```bash
# Use data_monitor to verify specific mappings
python3 data_monitor.py 0x28bd 0x2904 -i 1
```

Manually adjust the JSON if needed.

## Examples

### Example: XP-Pen Deco 640 on Linux

```bash
# Discover the device
python3 discover_device.py
# Select: XP-Pen Deco 640
# Interfaces: 0, 1
# Platform: zynthian

# Monitor button interface (sends data only when buttons pressed)
python3 data_monitor.py 0x28bd 0x2904 -i 0
# Press each button, note the byte 2 bits

# Monitor stylus interface (sends data continuously)
python3 data_monitor.py 0x28bd 0x2904 -i 1
# Move stylus, note which bytes change for X/Y/pressure/tilt
```

## Tips

### Multi-Interface Devices

Some tablets split functionality across interfaces:
- **Interface 0**: Tablet buttons only
- **Interface 1**: Stylus (position, pressure, tilt, stylus buttons)
- **Interface 2**: May be vendor-specific or unused

Linux tends to split more than macOS/Windows.

### Report IDs

Different interfaces may use different Report IDs:
- Interface 0 (buttons): Report ID 6
- Interface 1 (stylus): Report ID 7

The `reportId` field in your driver should be the **primary** one (usually stylus).

### Byte Order

Most tablets use **little-endian** for multi-byte values:
- X coordinate: `data[2] + (data[3] << 8)`
- Use `"byteIndices": [2, 3]` in your mapping

### Button Mapping

Buttons are usually bit-flags in a single byte:
- Bit 0 (0x01) = Button 1
- Bit 1 (0x02) = Button 2
- Bit 2 (0x04) = Button 3
- etc.

Watch byte 2 (usually) when pressing buttons.

## Troubleshooting

**"No HID devices found"**
- Run with sudo/admin privileges
- Check device is connected: `lsusb` (Linux) or System Information (macOS)

**"Cannot open device"**
- Device may be in use by another process
- Try: `sudo systemctl stop strumboli` or close tablet driver software

**"No data received"**
- Some interfaces are event-based (only send when something happens)
- Try moving stylus or pressing buttons
- Interface might not be the right one

## Contributing

Found byte mappings for a new tablet? Please contribute!

1. Test thoroughly
2. Document any quirks in the JSON as `_note` fields
3. Submit a PR with your driver in `server/drivers/`

