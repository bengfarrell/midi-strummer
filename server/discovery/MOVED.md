# Discovery Tools Relocated

## Location Change

The discovery tools have been moved from the root `discovery/` directory to `server/discovery/` for better organization.

**Old location:** `/discovery/`  
**New location:** `/server/discovery/`

## Rationale

- The discovery tools work directly with the server-side HID functionality
- They generate driver configs for the server's `drivers/` directory
- Keeping them together with the server code makes more organizational sense
- Simplifies relative paths (e.g., `../drivers/` instead of `../server/drivers/`)

## What Was Moved

All files from the discovery directory:
- ✅ `discover_device.py` - Main discovery wizard
- ✅ `data_monitor.py` - Real-time HID data monitor
- ✅ `multi_interface_monitor.py` - Multi-interface monitoring tool
- ✅ `README.md` - Documentation
- ✅ `QUICK_START.md` - Quick start guide
- ✅ `CHANGELOG.md` - Change history
- ✅ `DETECTION_FIXES.md` - Detection algorithm fixes
- ✅ `OSX_DETECTION_FIXES.md` - OSX-specific fixes
- ✅ `INTERFACE_MONITORING_UPDATE.md` - Interface monitoring enhancement
- ✅ `ENHANCED_TESTING.md` - Enhanced testing documentation
- ✅ Generated driver JSONs (e.g., `deco_640.json`)

## Updated References

All documentation has been updated to reflect the new location:

**Command examples:**
```bash
# Old
cd discovery
python3 discover_device.py

# New
cd server/discovery
python3 discover_device.py
```

**Copy commands:**
```bash
# Old
cp my_tablet.json ../server/drivers/

# New
cp my_tablet.json ../drivers/
```

## No Breaking Changes

This is purely a file location change. All functionality remains identical:
- Scripts work exactly the same
- No code changes required
- Just use the new path when running commands

## Quick Reference

**To use the discovery wizard:**
```bash
cd server/discovery
python3 discover_device.py
```

**To monitor HID data:**
```bash
cd server/discovery
python3 data_monitor.py 0x28bd 0x2904 -i 1
```

**Generated files are saved in:**
`server/discovery/` (same directory as the scripts)

**Copy to drivers:**
```bash
cp my_tablet.json ../drivers/
```

