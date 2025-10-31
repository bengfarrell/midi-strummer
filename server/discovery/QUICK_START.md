# Quick Start Guide

## I have a new tablet - what do I do?

### 1. Run the Discovery Wizard (5 minutes) ✨ AUTO-DETECTS EVERYTHING

```bash
cd server/discovery
python3 discover_device.py
```

**The wizard will:**
1. Show you all connected HID devices
2. Let you select your tablet
3. **Monitor ALL interfaces** to see what they do
4. **Show you which interfaces** have stylus, buttons, etc.
5. Let you choose which to analyze
6. **Guide you through 12 interactive actions:**
   - Keep stylus away (baseline)
   - Hover stylus (detect hover state)
   - Touch tablet (detect contact)
   - Move stylus around (general movement)
   - Horizontal sweep left→right (accurate X max)
   - Vertical sweep top→bottom (accurate Y max)
   - Press hard (detect pressure)
   - Tilt left (left tilt detection)
   - Tilt right (right tilt detection)
   - Tilt forward (forward tilt detection)
   - Tilt back (back tilt detection)
   - Press each button (button mapping)
7. **Automatically analyze the data** and determine byte positions
8. Generate a complete driver config with **real detected values**

**Example interaction:**
```
Found devices:
  1) XP-Pen Deco 640 (VID: 0x28bd, PID: 0x2904)
Select device: 1

[Step 2] Discovering interfaces...

Found 3 interface(s)

Will monitor ALL interfaces for 10 seconds to see what they do.

Please perform these actions during monitoring:
  • Move stylus around the tablet
  • Touch and lift the stylus
  • Press a tablet button

Press ENTER to start monitoring all interfaces...

Monitoring... perform actions now!

======================================================================
INTERFACE ANALYSIS SUMMARY
======================================================================

Interface 0:
  Usage Page: 0x000d, Usage: 0x0002
  Status: ✓ 8 packets
  Report ID(s): [6]
  Characteristics:
    → BUTTON interface (bit patterns detected)
    → Event-based (only sends when active)

Interface 1:
  Usage Page: 0x000d, Usage: 0x0002
  Status: ✓ 143 packets
  Report ID(s): [7]
  Characteristics:
    → STYLUS interface (coordinates/movement detected)
    → Pressure data detected

Interface 2:
  Usage Page: 0x000d, Usage: 0x0005
  Status: ✗ No data received

======================================================================

2 interface(s) detected with data.

Which interface(s) should be analyzed in detail?
  (Enter comma-separated numbers, or press ENTER for all)
Select from [0, 1] [all]: 

Using all 2 interfaces

[Step 3] Analyzing interface data...

--- Analyzing Interface 1 ---

1. Keep stylus AWAY from tablet
   Press ENTER and then Waiting... Got 0 samples

2. HOVER stylus above tablet
   Also try pressing stylus buttons while hovering
   Press ENTER and then Hovering... Got 18 samples

3. TOUCH stylus to tablet lightly
   Also try pressing stylus buttons while touching
   Press ENTER and then Touching... Got 15 samples

4. MOVE stylus around the tablet
   Move in a large circle or pattern
   Press ENTER and then Moving... Got 42 samples

5. HORIZONTAL SWEEP
   ⚠️  Slowly drag from FAR LEFT to FAR RIGHT edge
   Take your time - hit both edges!
   Press ENTER and then Sweeping horizontally... Got 38 samples

6. VERTICAL SWEEP
   ⚠️  Slowly drag from TOP to BOTTOM edge
   Take your time - hit both edges!
   Press ENTER and then Sweeping vertically... Got 35 samples

7. Press DOWN HARD with stylus
   Press ENTER and then Pressing hard... Got 18 samples

8. TILT stylus to the LEFT
   Hold the stylus and lean it to the left side
   Press ENTER and then Tilting left... Got 14 samples

9. TILT stylus to the RIGHT
   Hold the stylus and lean it to the right side
   Press ENTER and then Tilting right... Got 16 samples

10. TILT stylus FORWARD (toward top of tablet)
    Lean the stylus away from you
    Press ENTER and then Tilting forward... Got 15 samples

11. TILT stylus BACK (toward bottom of tablet)
    Lean the stylus toward you
    Press ENTER and then Tilting back... Got 14 samples

12. Press each TABLET BUTTON one at a time
    (Press, hold briefly, release, then next button)
    Press ENTER and then Pressing buttons... Got 8 samples

Analyzing data...
  ✓ Status byte: 1
  ✓ Coordinates: X bytes [2, 3], Y bytes [4, 5]
  ✓ Pressure: bytes [6, 7], max 8191
  ✓ Tilt: X byte 8, Y byte 9

--- Analyzing Interface 0 ---
[... button interface analysis ...]
  ✓ Buttons: byte 2

✓ Using detected mappings (7 found)
✓ Driver saved to: deco_640_linux.json
```

**Output:** A complete driver JSON with auto-detected byte mappings!

### 2. Review the Auto-Generated Config (30 seconds)

Open the JSON file and check the mappings:

```json
{
  "byteCodeMappings": {
    "status": {
      "byteIndex": 1,
      "type": "code",
      "values": {
        "160": {"state": "hover"},   // ✓ Auto-detected!
        "161": {"state": "contact"}  // ✓ Auto-detected!
      }
    },
    "x": {
      "byteIndices": [2, 3],  // ✓ Auto-detected!
      "max": 31984,           // ✓ Actual max from your tablet!
      "type": "multi-byte-range"
    },
    "pressure": {
      "byteIndices": [6, 7],  // ✓ Auto-detected!
      "max": 8191,            // ✓ Real max measured!
      "type": "multi-byte-range"
    },
    "tiltX": {
      "byteIndex": 8,         // ✓ Auto-detected!
      "positiveMax": 60,
      "negativeMin": 256,
      "negativeMax": 196,
      "type": "bipolar-range"
    },
    "tiltY": {
      "byteIndex": 9,         // ✓ Auto-detected!
      ...
    },
    "tabletButtons": {
      "byteIndex": 2,         // ✓ Auto-detected!
      "buttonCount": 8,
      "type": "bit-flags"
    }
  }
}
```

**Most of the time, this works perfectly as-is!**

### 3. Test Your Driver (1 minute)

```bash
# Copy to drivers folder
cp deco_640_linux.json ../drivers/

# Update settings.json
# Change "drawingTablet" to "deco_640_linux"

# Restart server
cd ../server
python3 main.py
```

Move the stylus, press buttons - everything should work! 🎉

## What If Something Doesn't Work?

### Need to verify specific mappings?

Use the data monitor to see raw data:

```bash
python3 data_monitor.py 0x28bd 0x2904 -i 1
```

Watch the bytes as you move/press, then manually adjust the JSON if needed.

### Coordinates seem wrong?

The auto-detection looks for bytes with high variance during movement. If X/Y are swapped or incorrect, check bytes 2-7 in the monitor and manually update `x.byteIndices` and `y.byteIndices`.

### Pressure not responsive?

Make sure you pressed **as hard as possible** during the "Press DOWN HARD" step. The tool measures the actual maximum. If needed, manually update `pressure.max`.

### Buttons not working?

Re-run the discovery wizard and make sure to press **each button individually** during step 8. The tool looks for different bit patterns.

## Manual Configuration (If Auto-Detection Fails)

If the auto-detection doesn't work for your device:

### 1. Monitor interface data

```bash
python3 data_monitor.py 0xYOUR_VID 0xYOUR_PID -i 1
```

### 2. Perform actions and note byte positions

| Action | What to watch | What to record |
|--------|---------------|----------------|
| Move stylus around | Bytes that change | X and Y byte positions |
| Press down hard | Byte values increasing | Pressure byte positions and max value |
| Tilt stylus left/right | Bytes changing +/- | TiltX byte position and range |
| Tilt stylus forward/back | Bytes changing +/- | TiltY byte position and range |
| Press stylus button 1 | Specific bit set | Status byte codes |
| Press stylus button 2 | Different bit set | Status byte codes |

### 3. Manually update the JSON

Edit the `byteCodeMappings` section based on your observations.

## Common Byte Layouts

### Typical Single-Interface Layout (macOS)

```
Byte 0: Report ID (usually 2)
Byte 1: Status code (192=none, 160=hover, 161=contact, 240=buttons)
Byte 2-3: X coordinate (16-bit little-endian)
Byte 4-5: Y coordinate (16-bit little-endian)
Byte 6-7: Pressure (16-bit little-endian)
Byte 8: Tilt X (signed)
Byte 9: Tilt Y (signed)
```

### Typical Multi-Interface Layout (Linux)

**Interface 0 (buttons):**
```
Byte 0: Report ID (e.g., 6)
Byte 1: Usually 0
Byte 2: Button bits (bit 0 = button 1, bit 1 = button 2, etc.)
```

**Interface 1 (stylus):**
```
Byte 0: Report ID (e.g., 7)
Byte 1: Status code (160=hover, 161=contact)
Byte 2-3: X coordinate
Byte 4-5: Y coordinate
Byte 6-7: Pressure
Byte 8: Tilt X
Byte 9: Tilt Y
```

## Tips

### Finding X/Y Coordinates

- **Little-endian 16-bit**: Most common
  - `X = byte[n] + (byte[n+1] << 8)`
  - Look for two adjacent bytes that both change when you move
  
### Finding Pressure

- **Look for bytes that:**
  - Are 0 when hovering
  - Increase when you press harder
  - Have max value around 2048, 4096, 8192, or 16384

### Finding Tilt

- **Look for bytes that:**
  - Change when you tilt the pen
  - Go both positive and negative (or 0-255 with 128 as center)
  - Usually bytes 8-9 after coordinates and pressure

### Button Bit Flags

Standard bit layout (byte value):
- Button 1: 0x01 (bit 0)
- Button 2: 0x02 (bit 1)  
- Button 3: 0x04 (bit 2)
- Button 4: 0x08 (bit 3)
- Button 5: 0x10 (bit 4)
- Button 6: 0x20 (bit 5)
- Button 7: 0x40 (bit 6)
- Button 8: 0x80 (bit 7)

## Still Stuck?

Check the existing drivers in `../drivers/` for reference:
- `xp_pen_deco_640_osx.json` - Single interface example
- `xp_pen_deco_640_zynthian.json` - Multi-interface example

## Need Help?

Open an issue on GitHub with:
1. Your tablet make/model
2. Output from `discover_device.py`
3. Sample data from `data_monitor.py` while performing different actions
