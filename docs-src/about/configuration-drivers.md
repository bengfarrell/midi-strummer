---
layout: page.njk
title: Device Drivers
description: Understanding and creating device driver files for tablets
---

# Device Drivers

Device driver files tell Strumboli how to interpret the raw data from your drawing tablet. They map bytes from the HID (Human Interface Device) data stream to meaningful inputs like X/Y position, pressure, tilt, and button states.

## Overview

Each driver is a JSON file in the `server/drivers/` directory that defines:
- Device identification (vendor/product IDs)
- Byte positions for each input type
- Value ranges and interpretations
- Button mappings
- Device capabilities

## Driver File Location

Drivers are stored in:
```
server/drivers/
  ├── xp_pen_deco_640_osx.json
  ├── xp_pen_deco_640_zynthian.json
  └── your_custom_driver.json
```

## Using a Driver

### Method 1: Auto-Detection (Recommended)

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  }
}
```

Strumboli scans connected devices and automatically loads the appropriate driver.

### Method 2: Specify by Name

```json
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640_osx"
  }
}
```

Use the filename (without `.json`) from the drivers directory.

### Method 3: Manual Device Specification

```json
{
  "startupConfiguration": {
    "drawingTablet": {
      "vendorId": "0x28bd",
      "productId": "0x0914"
    }
  }
}
```

## Driver File Structure

Here's an example driver file with explanations:

```json
{
  "name": "XP-Pen Deco 640",
  "manufacturer": "XP-Pen",
  "model": "Deco 640",
  "description": "XP-Pen Deco 640 graphics tablet with 8 express keys",
  
  "vendorId": "0x28bd",
  "productId": "0x0914",
  
  "deviceInfo": {
    "product": "Deco 640",
    "usage": 1,
    "interfaces": [2]
  },
  
  "reportId": 2,
  
  "capabilities": {
    "hasButtons": true,
    "buttonCount": 8,
    "hasPressure": true,
    "pressureLevels": 16384,
    "hasTilt": true,
    "resolution": {
      "x": 32000,
      "y": 18000
    }
  },
  
  "byteCodeMappings": {
    "status": { },
    "x": { },
    "y": { },
    "pressure": { },
    "tiltX": { },
    "tiltY": { },
    "tabletButtons": { }
  }
}
```

## Core Properties

### Device Identification

**`name`** (string) - Human-readable device name

**`manufacturer`** (string) - Manufacturer name

**`model`** (string) - Model name/number

**`description`** (string) - Detailed description

**`vendorId`** (string, hex) - USB vendor ID (e.g., `"0x28bd"`)

**`productId`** (string, hex) - USB product ID (e.g., `"0x0914"`)

Find these using:
- **macOS:** System Information → USB
- **Linux:** `lsusb` command
- **Windows:** Device Manager

---

### Device Info

**`deviceInfo.product`** (string) - Product name reported by device

**`deviceInfo.usage`** (integer) - HID usage page

**`deviceInfo.interfaces`** (array) - Interface numbers to use

Some tablets split functionality across multiple interfaces:
- Interface 0: Buttons only
- Interface 1: Stylus data
- Interface 2: Vendor-specific

---

### Report ID

**`reportId`** (integer) - Primary HID Report ID for stylus data

Different report IDs may be used for different data types (stylus vs buttons).

---

### Capabilities

Documents what the device supports:

```json
{
  "capabilities": {
    "hasButtons": true,
    "buttonCount": 8,
    "hasPressure": true,
    "pressureLevels": 16384,
    "hasTilt": true,
    "resolution": {
      "x": 32000,
      "y": 18000
    }
  }
}
```

This is informational and helps Strumboli optimize data processing.

---

## Byte Code Mappings

The `byteCodeMappings` section is where the magic happens. It tells Strumboli exactly where to find each piece of data in the HID report.

### Status Byte

Maps status codes to stylus states:

```json
{
  "status": {
    "byteIndex": 1,
    "type": "code",
    "values": {
      "192": { "state": "none" },
      "160": { "state": "hover" },
      "161": { "state": "contact" },
      "163": {
        "state": "contact",
        "secondaryButtonPressed": true
      },
      "165": {
        "state": "contact",
        "primaryButtonPressed": true
      }
    }
  }
}
```

**`byteIndex`** - Which byte contains status code (usually byte 1)

**`type`** - Set to `"code"`

**`values`** - Object mapping byte values to states:
- `"none"` - Stylus away from tablet
- `"hover"` - Stylus hovering (not touching)
- `"contact"` - Stylus touching surface
- Include button states when stylus buttons pressed

---

### X Coordinate

```json
{
  "x": {
    "byteIndices": [2, 3],
    "max": 32000,
    "type": "multi-byte-range"
  }
}
```

**`byteIndices`** - Array of bytes (little-endian order)

**`max`** - Maximum X value reported by device

**`type`** - Set to `"multi-byte-range"`

**Calculation:** `x = data[2] + (data[3] << 8)`

---

### Y Coordinate

```json
{
  "y": {
    "byteIndices": [4, 5],
    "max": 18000,
    "type": "multi-byte-range"
  }
}
```

Same structure as X coordinate.

---

### Pressure

```json
{
  "pressure": {
    "byteIndices": [6, 7],
    "max": 16383,
    "type": "multi-byte-range"
  }
}
```

**`max`** - Maximum pressure level (common values: 2048, 8192, 16384)

Higher pressure levels = more sensitivity.

---

### Tilt

Tilt can be encoded in different ways:

**Bipolar Range** (most common):
```json
{
  "tiltX": {
    "byteIndex": 8,
    "positiveMax": 60,
    "negativeMin": 256,
    "negativeMax": 196,
    "type": "bipolar-range"
  }
}
```

- **Positive tilt:** 0 to `positiveMax` (e.g., tilting right)
- **Negative tilt:** `negativeMin` to `negativeMax` (e.g., tilting left)
- Values wrap around using unsigned byte (0-255)

**Single Byte Range:**
```json
{
  "tiltX": {
    "byteIndex": 8,
    "min": 0,
    "max": 127,
    "type": "single-byte-range"
  }
}
```

Linear range from min to max.

---

### Tablet Buttons

**Bit Flags** (most common):
```json
{
  "tabletButtons": {
    "byteIndex": 2,
    "buttonCount": 8,
    "type": "bit-flags"
  }
}
```

Each button is a bit in the byte:
- Bit 0 (0x01) = Button 1
- Bit 1 (0x02) = Button 2
- Bit 2 (0x04) = Button 3
- Bit 3 (0x08) = Button 4
- etc.

**Button Codes:**
```json
{
  "tabletButtons": {
    "byteIndex": 2,
    "type": "button-codes",
    "buttonMap": {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4
    }
  }
}
```

Each button sends a specific code value.

---

## Mapping Types Reference

### multi-byte-range

For multi-byte values (coordinates, pressure):

```json
{
  "byteIndices": [2, 3],
  "max": 32000,
  "type": "multi-byte-range"
}
```

Uses little-endian byte order.

### single-byte-range

For single-byte values:

```json
{
  "byteIndex": 8,
  "min": 0,
  "max": 127,
  "type": "single-byte-range"
}
```

### bipolar-range

For signed values that wrap around:

```json
{
  "byteIndex": 8,
  "positiveMax": 60,
  "negativeMin": 256,
  "negativeMax": 196,
  "type": "bipolar-range"
}
```

### code

For status bytes with specific code meanings:

```json
{
  "byteIndex": 1,
  "type": "code",
  "values": {
    "192": { "state": "none" }
  }
}
```

### bit-flags

For buttons using bit flags:

```json
{
  "byteIndex": 2,
  "buttonCount": 8,
  "type": "bit-flags"
}
```

### button-codes

For buttons using individual codes:

```json
{
  "byteIndex": 2,
  "type": "button-codes",
  "buttonMap": { }
}
```

---

## Creating a Custom Driver

### Step 1: Use the Discovery Tool

The easiest way to create a driver is with the interactive discovery tool:

```bash
cd server/discovery
python3 discover_device.py
```

This automatically detects byte mappings and generates a driver file for you.

See [Discovery Tool](/about/discovery/) for detailed instructions.

### Step 2: Manual Creation

If you need to create a driver manually:

1. **Find device IDs:**
   ```bash
   # macOS
   system_profiler SPUSBDataType
   
   # Linux
   lsusb
   ```

2. **Monitor HID data:**
   ```bash
   cd server/discovery
   python3 data_monitor.py 0x28bd 0x2904
   ```

3. **Identify byte positions:**
   - Move stylus → X/Y coordinates change
   - Press hard → Pressure bytes increase
   - Tilt stylus → Tilt bytes change
   - Press buttons → Button bytes change

4. **Create driver JSON:**
   ```json
   {
     "name": "My Tablet",
     "vendorId": "0xABCD",
     "productId": "0x1234",
     "reportId": 7,
     "byteCodeMappings": {
       "x": {
         "byteIndices": [2, 3],
         "max": 30000,
         "type": "multi-byte-range"
       }
       // ... add other mappings
     }
   }
   ```

5. **Test the driver:**
   ```bash
   cp my_tablet.json ../drivers/
   # Update settings.json to use "my_tablet"
   python ../../server/main.py
   ```

---

## Platform-Specific Drivers

Some tablets require different drivers per platform:

- `xp_pen_deco_640_osx.json` - macOS
- `xp_pen_deco_640_zynthian.json` - Linux/Raspberry Pi

**Why?** Different operating systems may:
- Use different interfaces
- Report different values
- Handle button data differently

Always test your driver on the target platform.

---

## Visual Examples

### HID Data Packet Structure

```
Byte:   [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]
Value:  02   C1   30   12   F4   09   83   04   3F   40
        │    │    └────┬────┘   └────┬────┘   │    │
        │    │         │             │         │    │
        │    │         X coord       Pressure  │    │
     Report  │       (4656)        (1155)      │    TiltY
       ID    │                              TiltX
          Status
        (contact)
```

### Tilt Encoding (Bipolar)

![Tilt encoding diagram - showing how positive tilt maps to 0-60 and negative tilt wraps to 196-255](placeholder-tilt-encoding.png)

*Placeholder for diagram showing tilt value wrapping*

### Button Bit Flags

```
Byte value: 0x15 (decimal 21) = binary 00010101

Bit:  7  6  5  4  3  2  1  0
      0  0  0  1  0  1  0  1
               │     │     │
               │     │     Button 1 pressed
               │     Button 3 pressed
               Button 5 pressed
```

---

## Troubleshooting Drivers

### No Data Received

- Check `reportId` matches device output
- Try different interface numbers
- Some devices send data only on events (move stylus)

### Wrong Coordinates

- Verify byte indices are correct
- Check byte order (little vs big endian)
- Confirm max values match device resolution

### Buttons Not Working

- Check `byteIndex` for button data
- Test if buttons use bit-flags or codes
- Some tablets send buttons on different interface

### Tilt Not Working

- Some tablets don't support tilt
- Check if tilt uses bipolar or linear range
- Verify positive/negative max values

### Pressure Stuck at Maximum

- Check pressure `max` value is correct
- Some tablets use 12-bit (4096) vs 14-bit (16384) pressure

---

## Testing Your Driver

1. **Start Strumboli with verbose output:**
   ```bash
   python server/main.py
   ```

2. **Watch console for:**
   ```
   [Config] Loaded device driver: My Tablet
   Device opened successfully
   X=4656 Y=2548 Pressure=1155
   ```

3. **Test each feature:**
   - ✓ Stylus hover detection
   - ✓ Touch detection
   - ✓ X/Y coordinates (full range)
   - ✓ Pressure (full range)
   - ✓ Tilt left/right, forward/back
   - ✓ Stylus buttons
   - ✓ Tablet buttons

4. **Enable web dashboard for visual feedback:**
   ```json
   {
     "startupConfiguration": {
       "useWebServer": true
     }
   }
   ```
   Open `http://localhost:82` to see real-time values.

---

## Contributing Drivers

Found mappings for a new tablet? Please contribute!

### Contribution Checklist

- [ ] Test thoroughly on your device
- [ ] Test on Strumboli (generate MIDI correctly)
- [ ] Use descriptive name (brand_model_platform.json)
- [ ] Add comments for quirks (`_note` fields)
- [ ] Verify all capabilities work
- [ ] Test button mappings
- [ ] Document platform (macOS/Linux/Windows)

### Example with Notes

```json
{
  "name": "XP-Pen Deco 640",
  "_note": "Linux uses interface 1 for stylus, interface 0 for buttons",
  "vendorId": "0x28bd",
  "productId": "0x2904",
  "_noteButtons": "Button data only sent when pressed, uses bit flags in byte 2",
  "byteCodeMappings": {
    // ... mappings
  }
}
```

### Submitting

1. Test your driver file
2. Fork the repository on GitHub
3. Add your driver to `server/drivers/`
4. Submit a pull request with:
   - Driver file
   - Brief description of device
   - Platform tested on

---

## Advanced Topics

### Multi-Interface Devices

Some tablets split data across interfaces:

```json
{
  "deviceInfo": {
    "interfaces": [0, 1]
  },
  "_note": "Interface 0: buttons, Interface 1: stylus"
}
```

Strumboli can monitor multiple interfaces simultaneously.

### Custom Report IDs

Different report IDs for different data:

```json
{
  "reportId": 7,
  "_noteButtons": "Buttons use Report ID 6"
}
```

### Vendor-Specific Extensions

Document proprietary features:

```json
{
  "_noteWheel": "Device has scroll wheel on byte 10, not yet supported"
}
```

---

## Driver File Templates

### Minimal Template

```json
{
  "name": "Device Name",
  "vendorId": "0x????",
  "productId": "0x????",
  "reportId": 2,
  "byteCodeMappings": {
    "x": {
      "byteIndices": [2, 3],
      "max": 32000,
      "type": "multi-byte-range"
    },
    "y": {
      "byteIndices": [4, 5],
      "max": 18000,
      "type": "multi-byte-range"
    },
    "pressure": {
      "byteIndices": [6, 7],
      "max": 8192,
      "type": "multi-byte-range"
    }
  }
}
```

### Complete Template

See `server/drivers/xp_pen_deco_640_osx.json` for a complete example with all features.

