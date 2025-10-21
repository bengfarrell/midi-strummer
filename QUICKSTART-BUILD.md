# Quick Start: Building Your App

This is the **fastest** way to turn your Python MIDI service into a distributable application.

## Prerequisites (One-Time Setup)

```bash
# 1. Ensure virtual environment is set up
source venv/bin/activate

# 2. Install PyInstaller
pip install pyinstaller

# That's it!
```

## Build Your App (3 Commands)

```bash
# 1. Build the standalone application
./build.sh

# 2. Test it
open dist/MIDI-Strummer.app

# 3. Create installer DMG (optional)
./create-dmg.sh
```

## What You Get

After `./build.sh`:
- **`dist/MIDI-Strummer.app`** - Standalone macOS app
- Users can drag this to Applications and double-click to run
- No Python installation needed on user's computer!

After `./create-dmg.sh`:
- **`dist/MIDI-Strummer-Installer.dmg`** - Professional installer
- Mount → Drag to Applications → Done
- Perfect for distribution!

## Testing Your Build

```bash
# Open the app
open dist/MIDI-Strummer.app

# Or run from terminal to see output
./dist/MIDI-Strummer.app/Contents/MacOS/MIDI-Strummer
```

The app should:
- ✅ Start without errors
- ✅ Find and load settings.json
- ✅ Detect MIDI devices
- ✅ Connect to HID device (if connected)
- ✅ Start WebSocket server (if enabled)

## Common Issues

### ❌ "Command not found: pyinstaller"
```bash
source venv/bin/activate
pip install pyinstaller
```

### ❌ "settings.json not found" when running app
Place `settings.json`:
- Next to the .app file, or
- In your home directory, or
- Inside the .app/Contents/Resources/ folder

### ❌ "Module not found" error
```bash
# Add missing module to server/midi-strummer.spec
hiddenimports = [
    'module_name_here',
]
```

### ❌ Build takes forever
First build is slow (~2-3 minutes). Subsequent builds are faster.

## Next Steps

1. **Test locally**: Run the app and verify all features work
2. **Share with friends**: Send them the .dmg file
3. **Distribute publicly**: Upload to GitHub Releases
4. **Go pro**: Code sign and notarize (see BUILD.md)

## File Sizes

- App bundle: ~30-50 MB
- DMG installer: ~15-30 MB (compressed)

## Distribution Checklist

Before sharing your app:
- [ ] Test on a clean Mac (without Python/dev tools)
- [ ] Include instructions for installing hidapi
- [ ] Provide example settings.json
- [ ] Add version number to app name
- [ ] Create release notes

## Pro Tips

### 1. Hide Console Window
For a pure GUI experience, edit `server/midi-strummer.spec`:
```python
console=False,  # Change from True
```

### 2. Add App Icon
Create `icon.icns` and update spec:
```python
icon='icon.icns',
```

### 3. Version Your Builds
```bash
# Rename before distributing
mv dist/MIDI-Strummer.app dist/MIDI-Strummer-v1.0.app
```

### 4. Speed Up Builds
```bash
# Skip cleaning (faster rebuilds)
cd server
pyinstaller midi-strummer.spec  # without --clean
```

## Resources

- Full documentation: [BUILD.md](BUILD.md)
- Distribution guide: [DISTRIBUTION.md](DISTRIBUTION.md)
- PyInstaller docs: https://pyinstaller.org/

## Help!

If something goes wrong:

1. **Check the output** - Build script shows what went wrong
2. **Read BUILD.md** - Detailed troubleshooting
3. **Test as script first** - Make sure `python server/main.py` works
4. **Check dependencies** - All in requirements.txt?

## That's It!

You now have a distributable macOS application. Just run:

```bash
./build.sh && open dist/MIDI-Strummer.app
```

🎉 Enjoy!

