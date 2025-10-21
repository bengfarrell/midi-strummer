# MIDI Strummer - Distribution Guide

## Quick Start: Building Your Distributable App

### For macOS Users (You!)

```bash
# 1. Install PyInstaller (if not already installed)
source venv/bin/activate
pip install pyinstaller

# 2. Build the standalone app
./build.sh

# 3. Test it
open dist/MIDI-Strummer.app

# 4. Create an installer DMG for distribution
./create-dmg.sh
```

That's it! You now have:
- **`dist/MIDI-Strummer.app`** - Ready to drag to Applications folder
- **`dist/MIDI-Strummer-Installer.dmg`** - Installable DMG for users

### For Windows Distribution

To build for Windows, you'll need a Windows machine (or VM):

```bash
# On Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install pyinstaller
python -m PyInstaller server/midi-strummer.spec --clean
```

Creates: `dist/MIDI-Strummer/MIDI-Strummer.exe`

### For Linux Distribution

```bash
# On Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install pyinstaller
pyinstaller server/midi-strummer.spec --clean
```

Creates: `dist/MIDI-Strummer/MIDI-Strummer` (executable)

## What Users Get

### The Good News
✅ Single application file (or bundle)  
✅ All Python dependencies included  
✅ No Python installation required  
✅ Double-click to run  
✅ Works without internet  

### User Requirements

**macOS:**
```bash
brew install hidapi
```

**Windows:**
- System dependencies are usually bundled
- May need Microsoft Visual C++ Redistributable (common)

**Linux:**
```bash
sudo apt-get install libhidapi-hidraw0 libasound2-dev
```

## Distribution Options

### 1. Direct Download (Simplest)
Upload to your website or GitHub Releases:
- macOS: `MIDI-Strummer.app` (or .dmg)
- Windows: `MIDI-Strummer.zip` (containing .exe and dependencies)
- Linux: `MIDI-Strummer.tar.gz`

### 2. macOS DMG Installer (Recommended)
```bash
./create-dmg.sh
```
Users mount the DMG and drag to Applications - the Mac way!

### 3. Windows Installer
Use tools like:
- **Inno Setup** (free) - Creates `.exe` installers
- **NSIS** - Open source installer creator
- **WiX Toolset** - Microsoft's installer builder

### 4. Package Managers
- **macOS**: Homebrew Cask
- **Windows**: Chocolatey, Winget
- **Linux**: Create .deb or .rpm packages

## User Installation Flow

### macOS
1. Download `MIDI-Strummer-Installer.dmg`
2. Double-click to mount
3. Drag app to Applications folder
4. Right-click → "Open" (first time only)
5. Grant permissions for MIDI devices

### Windows
1. Download and extract `MIDI-Strummer.zip`
2. Double-click `MIDI-Strummer.exe`
3. Click "More info" → "Run anyway" if Windows Defender warns
4. Connect MIDI devices

### Linux
1. Download and extract `MIDI-Strummer.tar.gz`
2. Make executable: `chmod +x MIDI-Strummer`
3. Run: `./MIDI-Strummer`

## Settings File

**Important:** The app needs `settings.json` to run!

### Option 1: Bundle Default Settings
Include in the app (already configured in `.spec` file):
```python
datas = [
    ('../settings.json', '.'),
]
```

### Option 2: Prompt User on First Run
Modify `main.py` to create default settings if missing:
```python
def load_config():
    if not os.path.exists('settings.json'):
        create_default_settings()
    # ... rest of function
```

### Option 3: Settings in User Directory
Store in platform-specific locations:
- macOS: `~/Library/Application Support/MIDI-Strummer/`
- Windows: `%APPDATA%/MIDI-Strummer/`
- Linux: `~/.config/midi-strummer/`

## Professional Polish

### Add an Icon
1. Create icon files:
   - macOS: `icon.icns` (use `iconutil` or online converter)
   - Windows: `icon.ico`
   - Linux: `icon.png`

2. Update `midi-strummer.spec`:
```python
icon='icon.icns'  # or icon.ico
```

### Code Signing (Recommended for macOS)

Prevents "Unknown Developer" warnings:

```bash
# Get Apple Developer ID
# Visit developer.apple.com

# Sign the app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  dist/MIDI-Strummer.app

# Verify
codesign --verify --deep --strict --verbose=2 dist/MIDI-Strummer.app
```

### Notarization (macOS)

Submit to Apple for malware scan:
```bash
# Create DMG first
./create-dmg.sh

# Submit for notarization
xcrun notarytool submit dist/MIDI-Strummer-Installer.dmg \
  --apple-id your-email@example.com \
  --team-id TEAM_ID \
  --password app-specific-password \
  --wait

# Staple the ticket
xcrun stapler staple dist/MIDI-Strummer-Installer.dmg
```

## Testing Your Build

### Before Distribution

Test on a **clean system** without:
- Python installed
- Developer tools
- Your development environment

### Quick Test Checklist

- [ ] App launches without terminal/Python
- [ ] Detects MIDI devices
- [ ] Detects HID devices
- [ ] Loads settings.json
- [ ] WebSocket server starts (if enabled)
- [ ] No "missing module" errors
- [ ] Settings changes persist
- [ ] Graceful shutdown (Ctrl+C)

### Virtual Machine Testing

- **macOS**: Use another Mac or VM
- **Windows**: VirtualBox, Parallels, or VMware
- **Linux**: Docker or VM

## Release Checklist

- [ ] Version number updated in code/spec file
- [ ] CHANGELOG.md updated
- [ ] README.md includes download links
- [ ] Test build on clean system
- [ ] Create GitHub Release with binaries
- [ ] Update documentation
- [ ] Code signed (if applicable)
- [ ] Virus scan clean (VirusTotal.com)

## Auto-Updates (Optional)

Add update checking to `main.py`:

```python
import requests

def check_for_updates():
    try:
        response = requests.get('https://api.github.com/repos/user/repo/releases/latest')
        latest_version = response.json()['tag_name']
        if latest_version > CURRENT_VERSION:
            print(f"Update available: {latest_version}")
    except:
        pass  # Fail silently
```

## File Sizes (Approximate)

- **macOS**: ~30-50 MB (includes Python runtime)
- **Windows**: ~30-60 MB
- **Linux**: ~25-40 MB

Compressed (DMG/ZIP): ~15-30 MB

## Support Resources

- **PyInstaller Docs**: https://pyinstaller.org/
- **macOS Code Signing**: https://developer.apple.com/support/code-signing/
- **Windows Signing**: https://learn.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools
- **GitHub Releases**: https://docs.github.com/en/repositories/releasing-projects-on-github

## Common Issues

### "App is damaged" (macOS)
```bash
# Remove quarantine attribute
xattr -cr dist/MIDI-Strummer.app
```

### Missing DLLs (Windows)
- Install Visual C++ Redistributable
- Bundle with installer

### Permission Denied (Linux)
```bash
chmod +x MIDI-Strummer
```

### Large File Size
- Exclude unused modules in spec file
- Use `--exclude-module` for large packages
- Enable UPX compression (already enabled)

## Next Steps

1. **Test locally**: `./build.sh` and test the app
2. **Create installer**: `./create-dmg.sh` for macOS
3. **Create GitHub Release**: Upload binaries
4. **Document installation**: Update README with user instructions
5. **Gather feedback**: Test with real users
6. **Iterate**: Add features, fix bugs, release updates

---

**Questions or issues?** Check `BUILD.md` for detailed troubleshooting.

