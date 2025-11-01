---
layout: page.njk
title: Discovery Tool
description: Configure new drawing tablets and HID devices for Strumboli
---

# Discovery Tool

The Discovery Tool is an interactive application that helps you configure new drawing tablets and HID devices for use with Strumboli. It automatically detects device capabilities and generates driver configuration files.

## Overview

Strumboli includes powerful tools for discovering and configuring new tablets:

- **Interactive wizard** that guides you through device setup
- **Automatic byte mapping detection** for coordinates, pressure, and tilt
- **Multi-interface support** for complex devices
- **Real-time data monitoring** for verification
- **JSON driver generation** ready to use

## Pre-Built Discovery Tool

Standalone installers are available for easy installation:

**macOS:**
```bash
# Build discovery tool
npm run build:discover:osx

# Create DMG installer
npm run build:discover:dmg
```

**Linux/Raspberry Pi:**
```bash
# Build discovery tool
npm run build:discover:linux

# Create .deb package
npm run build:discover:deb
```

See **[DISCOVERY-INSTALLER-README.md](https://github.com/bengfarrell/strumboli/blob/main/DISCOVERY-INSTALLER-README.md)** for complete installation instructions.

## Running from Source

### Prerequisites

```bash
# Activate virtual environment
source venv/bin/activate

# Dependencies are already installed if you followed setup
# If not, install requirements:
pip install -r requirements.txt
```

### Tools Available

The discovery tools are located in `server/discovery/`:

#### 1. discover_device.py (Recommended)

Interactive wizard that automatically discovers byte mappings:

```bash
cd server/discovery
python3 discover_device.py
```

#### 2. data_monitor.py

Real-time HID data stream monitor:

```bash
python3 data_monitor.py 0x28bd 0x2904
```

#### 3. multi_interface_monitor.py

Monitor multiple device interfaces simultaneously:

```bash
python3 multi_interface_monitor.py 0x28bd 0x2904
```

## Using the Interactive Discovery Wizard

### Step 1: Launch the Tool

```bash
cd server/discovery
python3 discover_device.py
```

### Step 2: Select Your Device

The tool lists all connected HID devices:

```
Found HID devices:
1. XP-Pen Deco 640 (VID: 0x28bd, PID: 0x2904) - 2 interfaces
2. Apple Internal Keyboard (VID: 0x05ac, PID: 0x027e)
3. ...

Select device number:
```

Enter the number for your drawing tablet.

### Step 3: Multi-Interface Analysis

For devices with multiple interfaces, the tool monitors all interfaces simultaneously:

```
Monitoring all interfaces for 5 seconds...
Press buttons and move stylus around...

Analysis:
Interface 0: Button data detected
Interface 1: Stylus data detected (X, Y, pressure)
Interface 2: No data received
```

The tool automatically identifies which interfaces are relevant.

### Step 4: Choose Platform

```
Select target platform:
1. macOS
2. Linux
3. Raspberry Pi / Zynthian

Platform:
```

This affects interface selection and default settings.

### Step 5: Perform Guided Actions

The wizard guides you through 12 precise actions to detect all capabilities:

**1. Keep stylus away**
- Establishes baseline (no touch state)

**2. Hover stylus above tablet**
- Detects hover capability and status byte

**3. Touch stylus lightly**
- Detects touch state and contact pressure

**4. Move stylus around**
- General movement patterns

**5. Horizontal sweep (left to right)**
- Accurate X-axis maximum detection

**6. Vertical sweep (top to bottom)**
- Accurate Y-axis maximum detection

**7. Press hard**
- Pressure maximum and byte positions

**8. Tilt left**
- Left tilt detection and ranges

**9. Tilt right**
- Right tilt detection and ranges

**10. Tilt forward**
- Forward tilt detection

**11. Tilt back**
- Backward tilt detection

**12. Press each tablet button**
- Button byte and bit mapping

Follow the prompts carefully for best results!

### Step 6: Automatic Analysis

The tool analyzes captured data and automatically detects:

- **Status byte** and status codes
- **X/Y coordinate** byte positions and ranges
- **Pressure** byte positions and maximum values
- **Tilt** byte positions and ranges (if supported)
- **Button** byte positions and bit flags
- **Stylus button** mapping
- **Report IDs** for each interface

### Step 7: Review Generated Config

The tool creates a complete driver JSON file:

```json
{
  "vendorId": "0x28bd",
  "productId": "0x2904",
  "reportId": 7,
  "interfaces": [1],
  "status": {
    "byteIndex": 1,
    "type": "status-code",
    "codes": {
      "noTouch": 192,
      "touch": 193,
      "button1": 194,
      "button2": 195
    }
  },
  "x": {
    "byteIndices": [2, 3],
    "max": 31984,
    "type": "multi-byte-range"
  },
  "y": {
    "byteIndices": [4, 5],
    "max": 19990,
    "type": "multi-byte-range"
  },
  "pressure": {
    "byteIndices": [6, 7],
    "max": 8191,
    "type": "multi-byte-range"
  },
  "tiltX": {
    "byteIndex": 8,
    "min": 0,
    "max": 127,
    "type": "single-byte-range"
  },
  "tiltY": {
    "byteIndex": 9,
    "min": 0,
    "max": 127,
    "type": "single-byte-range"
  }
}
```

All values are **auto-detected from your actual device**!

### Step 8: Save and Test

The tool saves the config:

```
Driver saved to: xp_pen_deco_640_linux.json

Copy this file to ../drivers/ and update your settings.json:
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640_linux"
  }
}
```

Copy and test:

```bash
cp xp_pen_deco_640_linux.json ../drivers/
cd ../..
# Update settings.json
python server/main.py
```

## Using the Data Monitor

For manual investigation or verification:

```bash
cd server/discovery
python3 data_monitor.py <vendor_id> <product_id> [options]
```

**Example:**
```bash
# Monitor XP-Pen Deco 640
python3 data_monitor.py 0x28bd 0x2904

# Monitor specific interface
python3 data_monitor.py 0x28bd 0x2904 -i 1
```

**Output:**
```
Connected to device: XP-Pen Deco 640
Report ID: 7

Hex: 07 c1 30 12 f4 09 83 04 3f 40 00
Decoded: X=4656 Y=2548 Pressure=1155 Status=193

Hex: 07 c1 45 12 08 0a 9f 04 3f 40 00
Decoded: X=4677 Y=2568 Pressure=1183 Status=193
```

Use this to:
- Verify byte positions
- Check value ranges
- Debug specific features
- Understand button bit patterns

## Multi-Interface Monitoring

Some tablets split functionality across multiple interfaces:

```bash
python3 multi_interface_monitor.py 0x28bd 0x2904
```

**Shows data from all interfaces side-by-side:**

```
Interface 0 | Interface 1            | Interface 2
---------------------------------------------------------------------------
            | 07 c1 30 12 f4 09...   |
02 00 00... |                        |
            | 07 c1 45 12 08 0a...   |
```

This helps identify:
- Which interface handles stylus data
- Which interface handles button data
- Whether interfaces use different Report IDs

## Understanding Byte Mappings

### Multi-Byte Values (Little-Endian)

Most tablets use little-endian for coordinates and pressure:

```
Bytes:     [2, 3]
Value:     data[2] + (data[3] << 8)
Example:   [0x30, 0x12] = 48 + (18 * 256) = 4656
```

Driver config:
```json
{
  "x": {
    "byteIndices": [2, 3],
    "max": 31984,
    "type": "multi-byte-range"
  }
}
```

### Button Bit Flags

Buttons typically use bit flags in a single byte:

```
Byte 2: 0x01 = Button 1 (bit 0)
        0x02 = Button 2 (bit 1)
        0x04 = Button 3 (bit 2)
        0x08 = Button 4 (bit 3)
        ...
```

Driver config:
```json
{
  "tabletButtons": {
    "byteIndex": 2,
    "buttonCount": 8,
    "type": "bit-flags"
  }
}
```

### Status Codes

Status byte indicates stylus state:

```
192 (0xC0) = No touch
193 (0xC1) = Touch, no buttons
194 (0xC2) = Touch + stylus button 1
195 (0xC3) = Touch + stylus button 2
```

Driver config:
```json
{
  "status": {
    "byteIndex": 1,
    "type": "status-code",
    "codes": {
      "noTouch": 192,
      "touch": 193,
      "button1": 194,
      "button2": 195
    }
  }
}
```

## Tips for Success

### Getting Accurate Ranges

For best X/Y maximum detection:
- **Horizontal sweep**: Move slowly from left edge to right edge
- **Vertical sweep**: Move slowly from top edge to bottom edge
- Keep pressure consistent and light
- Touch all four corners

### Multi-Interface Devices

**Linux** tends to split functionality more than macOS:
- Interface 0: Tablet buttons only (sends data when pressed)
- Interface 1: Stylus (continuous data stream)
- Interface 2: Vendor-specific or unused

**macOS** often combines into fewer interfaces

### Button Detection

When pressing tablet buttons:
- Press one button at a time
- Hold for 1-2 seconds
- Note which byte changes and its value
- Try combinations to verify bit patterns

### Tilt Support

Not all tablets support tilt:
- If no tilt, bytes will remain constant
- Tilt values typically range 0-127 or 0-90
- Some tablets have asymmetric tilt ranges

## Troubleshooting

### "No HID devices found"

- Run with elevated privileges: `sudo python3 discover_device.py`
- Check device connection: `lsusb` (Linux) or System Information (macOS)
- Ensure device is powered on and connected

### "Cannot open device"

- Another process is using the device (driver software, previous instance)
- Close manufacturer's tablet software
- Kill hung processes: `ps aux | grep python`
- Try unplugging and replugging the device

### "No data received"

- Some interfaces are event-based (only send when something happens)
- Try moving stylus continuously
- Press tablet buttons
- Try different interface number: `-i 0`, `-i 1`, `-i 2`

### Incorrect Mappings

If auto-detected values seem wrong:
- Repeat the action more clearly
- Use `data_monitor.py` to verify manually
- Check that you selected the correct interface
- Some tablets have quirks - document in driver JSON with `_note` fields

## Contributing Your Drivers

Found mappings for a new tablet? Please contribute!

1. **Test thoroughly** on your device
2. **Test on Strumboli** to verify it works in practice
3. **Document quirks** as `_note` fields in the JSON
4. **Submit a pull request** with your driver in `server/drivers/`

Example driver with notes:
```json
{
  "_note": "XP-Pen Deco 640 on Linux - Interface 1 for stylus, Interface 0 for buttons",
  "vendorId": "0x28bd",
  "productId": "0x2904",
  "_noteButtons": "Buttons are on Interface 0 with Report ID 6, bit flags in byte 2"
}
```

## Examples of Discovered Drivers

The `server/drivers/` directory includes several examples:
- `xp_pen_deco_640_zynthian.json` - XP-Pen on Raspberry Pi
- `xp_pen_deco_640_macos.json` - XP-Pen on macOS
- More examples for reference

Study these to understand driver structure.

