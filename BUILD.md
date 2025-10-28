# Building Strumboli for Distribution

This guide explains how to package Strumboli as a standalone desktop application that users can download, install, and run.

## Prerequisites

### macOS
```bash
# Install system dependencies
brew install hidapi portmidi

# Python 3.8 or higher
python3 --version
```

### Windows
```bash
# Install Python 3.8 or higher from python.org
# System dependencies will be bundled automatically
```

### Linux
```bash
# Install system dependencies
sudo apt-get install libhidapi-hidraw0 libhidapi-dev libasound2-dev
```

## Quick Start

### 1. Setup Environment
```bash
# Create virtual environment (if not already done)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install pyinstaller
```

### 2. Build the Application

**Using npm (macOS - Recommended):**
```bash
npm run build:osx
```

**Manual Build (macOS/Linux):**
```bash
chmod +x build.sh
./build.sh
```

**Windows:**
```bash
python -m PyInstaller server/midi-strummer.spec --clean
```

### 3. Create Installer (macOS only)

**Using npm:**
```bash
npm run build:dmg
```

**Manual:**
```bash
chmod +x create-dmg.sh
./create-dmg.sh
```

## What Gets Built

### macOS
- **`dist/Strumboli.app`** - Standalone macOS application bundle
- **`dist/Strumboli-Installer.dmg`** - Installable DMG with app and documentation

### Windows
- **`dist/Strumboli/Strumboli.exe`** - Standalone Windows executable
- All dependencies bundled in the same folder

### Linux
- **`dist/Strumboli/Strumboli`** - Standalone Linux executable
- All dependencies bundled in the same folder

## Distribution

### For End Users

Users need:
1. The application (`.app`, `.exe`, or executable)
2. A `settings.json` file (provide a default template)
3. System dependencies installed:
   - **macOS**: `brew install hidapi`
   - **Windows**: Usually bundled
   - **Linux**: `sudo apt-get install libhidapi-hidraw0`

### First-Time Setup

1. **macOS**: Right-click app → "Open" (to bypass Gatekeeper on first run)
2. **Windows**: May need to click "More info" → "Run anyway" (Windows Defender)
3. **Linux**: `chmod +x Strumboli` if needed

### Creating Settings Template

Provide users with a default `settings.json`:
```bash
cp settings.json settings.example.json
# Edit to remove any personal device IDs or paths
```

## Customization

### Adding an Icon

1. **macOS**: Create `icon.icns` file
2. **Windows**: Create `icon.ico` file
3. Update `midi-strummer.spec`:
```python
exe = EXE(
    # ...
    icon='path/to/icon.icns',  # or icon.ico for Windows
    # ...
)
```

### Removing Console Window

For a GUI-only experience (no terminal window):
```python
# In server/midi-strummer.spec
exe = EXE(
    # ...
    console=False,  # Change from True to False
    # ...
)
```

### Code Signing (macOS)

For professional distribution without security warnings:
```bash
# Sign the app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name" \
  dist/Strumboli.app

# Notarize with Apple
xcrun notarytool submit dist/Strumboli-Installer.dmg \
  --apple-id your-email@example.com \
  --team-id TEAM_ID \
  --password app-specific-password
```

## Advanced Options

### Building for Multiple Platforms

You'll need to build on each target platform:

1. **Set up CI/CD** (GitHub Actions example):
```yaml
name: Build
on: [push]
jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - run: ./build.sh
  
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - run: python -m PyInstaller server/midi-strummer.spec
```

### Reducing File Size

```bash
# Use UPX compression (already enabled in spec file)
# Install UPX
brew install upx  # macOS
# or download from https://upx.github.io/

# Build will automatically compress binaries
```

### Including Additional Files

Edit `server/midi-strummer.spec`:
```python
datas = [
    ('../settings.json', '.'),
    ('public', 'public'),
    ('../README.md', '.'),
    ('../path/to/other/file', 'destination/folder'),
]
```

## Troubleshooting

### "ModuleNotFoundError" when running built app
- Add missing module to `hiddenimports` in `midi-strummer.spec`

### App crashes immediately
- Run from terminal to see error messages:
  ```bash
  ./dist/Strumboli.app/Contents/MacOS/Strumboli
  ```

### Large file size
- Exclude unnecessary packages in spec file
- Use `--exclude-module` flag
- Enable UPX compression

### Settings file not found
- App looks for `settings.json` in:
  1. Same directory as executable
  2. Current working directory
- Update code to prompt user for settings location

## Next Steps

1. Test the built application on a clean system
2. Create user documentation
3. Set up a website or GitHub releases for distribution
4. Consider code signing for professional distribution
5. Create update mechanism (e.g., check for updates on launch)

## Support

For issues with:
- **Building**: Check PyInstaller documentation
- **Dependencies**: Ensure all requirements.txt packages are installed
- **macOS Security**: See Apple's notarization guide
- **Cross-platform**: Build on each target platform separately

