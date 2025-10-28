---
layout: page.njk
title: Tablet Setup
description: Configure your drawing tablet for Strumboli
---

# Tablet Setup

This comprehensive guide covers everything you need to configure your drawing tablet to work with Strumboli, from automatic detection to creating custom device profiles.

## Quick Start: Auto-Detection

The easiest way to get started is to use auto-detection:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  }
}
```

Strumboli will automatically:
1. Scan connected HID devices
2. Match against known device profiles in `/server/drivers/`
3. Load the appropriate byte mapping configuration
4. Start reading tablet input

If auto-detection works, you'll see:
```
[Config] Auto-detecting device...
[Config] Loaded device driver: XP-Pen Deco 640
Device opened successfully
```

## Supported Tablets

Currently included device profiles:
- **XP-Pen Deco 640** - Full support with 8 express keys

More device profiles coming soon! You can also [create your own](#creating-custom-device-profiles).

## Manual Device Configuration

If auto-detection doesn't work or you want to use a specific profile:

```json
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640"
  }
}
```

This loads the driver profile from `/server/drivers/xp_pen_deco_640.json`.

## Understanding Device Profiles

Device profiles are JSON files that tell Strumboli how to interpret the raw bytes from your tablet's HID reports. They're located in `/server/drivers/`.

### Device Profile Structure

Here's the structure of a device profile:

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
    "interface": 2
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
    /* ... detailed byte mappings ... */
  }
}
```

### Key Sections

#### Device Identification

```json
{
  "vendorId": "0x28bd",
  "productId": "0x0914",
  "deviceInfo": {
    "product": "Deco 640",
    "usage": 1,
    "interface": 2
  }
}
```

- **`vendorId`** / **`productId`**: USB vendor and product IDs (hexadecimal)
- **`deviceInfo.product`**: Product name string to match
- **`deviceInfo.usage`**: HID usage page
- **`deviceInfo.interface`**: Interface number (tablets often have multiple interfaces)

#### Capabilities

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

Describes what the tablet can do (informational, used for validation).

## Byte Code Mappings

The most important part of a device profile is the **byteCodeMappings** section. This tells Strumboli how to extract data from the HID report bytes.

### Mapping Types

#### 1. Code Mapping (Status/State)

Used for discrete values like pen state:

```json
{
  "status": {
    "byteIndex": 1,
    "type": "code",
    "values": {
      "192": { "state": "none" },
      "160": { "state": "hover" },
      "161": { "state": "contact" },
      "163": { "state": "contact", "secondaryButtonPressed": true },
      "165": { "state": "contact", "primaryButtonPressed": true },
      "240": { "state": "buttons" }
    }
  }
}
```

- **`byteIndex`**: Which byte in the report to read
- **`type`**: Set to `"code"`
- **`values`**: Object mapping byte values to states

**States:**
- `none` - Pen not detected
- `hover` - Pen hovering over tablet
- `contact` - Pen touching surface
- `buttons` - Tablet express keys pressed

#### 2. Range Mapping (Single Byte)

For single-byte values (0-255):

```json
{
  "exampleValue": {
    "byteIndex": 3,
    "max": 124,
    "type": "range"
  }
}
```

- **`byteIndex`**: Which byte to read
- **`max`**: Maximum expected value
- **`type`**: Set to `"range"`

#### 3. Multi-Byte Range Mapping

For 16-bit values split across two bytes (common for pressure and position):

```json
{
  "pressure": {
    "byteIndices": [6, 7],
    "max": 16383,
    "type": "multi-byte-range"
  },
  "x": {
    "byteIndices": [2, 3],
    "max": 32000,
    "type": "multi-byte-range"
  },
  "y": {
    "byteIndices": [4, 5],
    "max": 18000,
    "type": "multi-byte-range"
  }
}
```

- **`byteIndices`**: Array of two byte positions `[low_byte, high_byte]`
- **`max`**: Maximum value for the 16-bit number
- **`type`**: Set to `"multi-byte-range"`

The bytes are combined as: `value = low_byte + (high_byte * 256)`

#### 4. Bipolar Range Mapping

For tilt values that can be positive or negative:

```json
{
  "tiltX": {
    "byteIndex": 8,
    "positiveMax": 60,
    "negativeMin": 256,
    "negativeMax": 196,
    "type": "bipolar-range"
  },
  "tiltY": {
    "byteIndex": 9,
    "positiveMax": 60,
    "negativeMin": 256,
    "negativeMax": 196,
    "type": "bipolar-range"
  }
}
```

- **`positiveMax`**: Maximum positive tilt value (e.g., 60)
- **`negativeMin`**: Where negative values start (e.g., 256 - wraps around)
- **`negativeMax`**: Maximum negative value (e.g., 196 = -60 in 8-bit wrap)
- **`type`**: Set to `"bipolar-range"`

Converts to range -1.0 to 1.0.

#### 5. Bit Flags (Tablet Buttons)

For multiple buttons encoded as bits in a single byte:

```json
{
  "tabletButtons": {
    "byteIndex": 2,
    "buttonCount": 8,
    "type": "bit-flags"
  }
}
```

- **`byteIndex`**: Which byte contains the button flags
- **`buttonCount`**: Number of buttons
- **`type`**: Set to `"bit-flags"`

Each bit represents a button (bit 0 = button 1, bit 1 = button 2, etc.).

## Creating Custom Device Profiles

If your tablet isn't supported, you can create a custom profile. Here's how:

### Step 1: Identify Your Device

Find your tablet's USB vendor and product IDs:

**macOS:**
```bash
system_profiler SPUSBDataType
```

**Linux:**
```bash
lsusb
```

**Windows:**
```powershell
Get-PnpDevice -PresentOnly | Where-Object { $_.InstanceId -match '^USB' }
```

Look for your tablet's entry and note the vendor ID and product ID.

### Step 2: Capture HID Reports

You need to capture the raw HID reports to understand the byte structure. Tools:

**macOS:**
- Use `hidapi` with Python to print raw reports
- Or use a USB sniffer

**Linux:**
- Use `hidraw` interface
- Monitor with `cat /dev/hidraw0 | hexdump -C`

**All Platforms:**
- Run Strumboli in debug mode to see raw reports

### Step 3: Analyze the Report Structure

Move the pen and press buttons while watching the bytes change:

1. **Find position bytes**: Move pen horizontally and vertically
2. **Find pressure bytes**: Press harder and lighter
3. **Find tilt bytes** (if supported): Tilt the pen
4. **Find button bytes**: Press each express key
5. **Find status byte**: Hover, touch, and lift the pen

Document which bytes correspond to which inputs.

### Step 4: Create the Profile

Create a new JSON file in `/server/drivers/`:

```json
{
  "name": "My Tablet Model",
  "manufacturer": "Brand Name",
  "model": "Model Number",
  "description": "Description of tablet",
  "vendorId": "0xYOUR_VENDOR_ID",
  "productId": "0xYOUR_PRODUCT_ID",
  "deviceInfo": {
    "product": "Product String",
    "usage": 1,
    "interface": 2
  },
  "reportId": 2,
  "capabilities": {
    "hasButtons": true,
    "buttonCount": 6,
    "hasPressure": true,
    "pressureLevels": 8192,
    "hasTilt": false,
    "resolution": {
      "x": 20000,
      "y": 12000
    }
  },
  "byteCodeMappings": {
    "status": {
      "byteIndex": 1,
      "type": "code",
      "values": {
        "0": { "state": "none" },
        "128": { "state": "hover" },
        "129": { "state": "contact" }
      }
    },
    "x": {
      "byteIndices": [2, 3],
      "max": 20000,
      "type": "multi-byte-range"
    },
    "y": {
      "byteIndices": [4, 5],
      "max": 12000,
      "type": "multi-byte-range"
    },
    "pressure": {
      "byteIndices": [6, 7],
      "max": 8191,
      "type": "multi-byte-range"
    }
  }
}
```

### Step 5: Test Your Profile

Use the profile in your settings:

```json
{
  "startupConfiguration": {
    "drawingTablet": "my_tablet_model"
  }
}
```

Verify that:
- Position tracking works smoothly
- Pressure responds correctly
- Buttons trigger actions
- Tilt (if supported) provides values

### Step 6: Share Your Profile

Consider contributing your device profile back to the project so others can use it!

## Troubleshooting

### Auto-Detection Fails

If auto-detection doesn't find your tablet:

1. **Check USB connection**: Ensure tablet is powered and connected
2. **Check HID interface**: Verify the device appears in system USB listings
3. **Try manual detection**: Create a basic profile with vendor/product IDs
4. **Check manufacturer software**: Quit any tablet driver software
5. **Try different USB ports**: Some tablets are picky about USB 2.0 vs 3.0

### Wrong Interface Selected

Some tablets have multiple HID interfaces. If Strumboli connects but doesn't receive input:

1. Try different `interface` values (0, 1, 2, etc.)
2. Check `usage` page (usually 1 or 2)
3. Look at the device in system info for clues

### Values Out of Range

If position, pressure, or tilt values seem wrong:

1. **Check max values**: Ensure they match your tablet's actual range
2. **Verify byte order**: Try swapping byte indices (e.g., [3,2] instead of [2,3])
3. **Check for header bytes**: Some tablets have report ID bytes that offset everything

### Buttons Not Working

If express keys don't respond:

1. **Find button byte**: Use a hex dump to see which byte changes
2. **Check bit flags**: Buttons might be individual bits, not separate bytes
3. **Verify button count**: Ensure it matches your tablet
4. **Check status byte**: Button presses might set a special state

## Advanced: Inline Configuration

For testing, you can define device configuration directly in `settings.json` without creating a driver file:

```json
{
  "startupConfiguration": {
    "drawingTablet": {
      "product": "My Tablet",
      "usage": 1,
      "interface": 2,
      "byteCodeMappings": {
        "status": { /* ... */ },
        "x": { /* ... */ },
        "y": { /* ... */ },
        "pressure": { /* ... */ }
      }
    }
  }
}
```

This is useful for quick iteration but driver files are preferred for reusability.

## Example: Complete Device Profile

Here's the complete XP-Pen Deco 640 profile as a reference:

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
    "interface": 2
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
    "status": {
      "byteIndex": 1,
      "type": "code",
      "values": {
        "192": { "state": "none" },
        "160": { "state": "hover" },
        "162": { "state": "hover", "secondaryButtonPressed": true },
        "164": { "state": "hover", "primaryButtonPressed": true },
        "161": { "state": "contact" },
        "163": { "state": "contact", "secondaryButtonPressed": true },
        "165": { "state": "contact", "primaryButtonPressed": true },
        "240": { "state": "buttons" }
      }
    },
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
      "max": 16383,
      "type": "multi-byte-range"
    },
    "tiltX": {
      "byteIndex": 8,
      "positiveMax": 60,
      "negativeMin": 256,
      "negativeMax": 196,
      "type": "bipolar-range"
    },
    "tiltY": {
      "byteIndex": 9,
      "positiveMax": 60,
      "negativeMin": 256,
      "negativeMax": 196,
      "type": "bipolar-range"
    },
    "tabletButtons": {
      "byteIndex": 2,
      "buttonCount": 8,
      "type": "bit-flags"
    }
  }
}
```

## Next Steps

Now that your tablet is configured:

- **[Configuration Overview](/about/configuration-overview/)** - Understand the settings system
- **[Actions Reference](/about/actions-reference/)** - Set up button actions
- **[Settings Reference](/about/settings-reference/)** - Complete settings documentation
- **[Chords & Progressions](/about/chords-and-progressions/)** - Configure chord progressions

## Additional Resources

- **`/server/drivers/`** - Device profile examples
- **`/server/drivers/README.md`** - Driver development guide
- **`server/finddevice.py`** - Auto-detection implementation
- **`server/hidreader.py`** - HID reading implementation

