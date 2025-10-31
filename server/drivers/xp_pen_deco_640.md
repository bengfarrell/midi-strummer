Found two driver/hardware issues with the XP Pen Deco 640
- Coordinate updates seem to stop happening when pressing the primary or secondary buttons
- On RaspberryPi using Debian driver, buttons 7 and 8 are mapped to the same thing, so button 8 will trigger an event for 7

## Technical Details

### Why Raspberry Pi is Different

The XP-Pen Deco 640 exposes **two separate HID interfaces** on Linux/Raspberry Pi:
- **Interface 0:** Tablet buttons (Report ID 6)
- **Interface 1:** Stylus (Report ID 7)

On macOS, everything goes through a **single interface** (Interface 2, Report ID 2).

The Linux kernel driver or the tablet firmware may be encoding button presses differently when using separate interfaces, leading to non-standard byte values.

### Button 7 and 8 Collision

**Problem:** Both buttons 7 and 8 send byte value 29.

This means we can't distinguish between them with the current hardware/firmware. This may be:
1. A firmware bug in the Linux driver
2. Hardware limitation
3. Incorrect byte mapping (needs verification)

**Workaround:** The driver currently maps value 29 to button 7. Button 8 may not work correctly until we can determine its unique byte value.
