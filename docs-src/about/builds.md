---
layout: page.njk
title: Builds & Installers
description: Build and distribute standalone Strumboli applications
---

# Builds & Installers

This guide covers how to build standalone applications and create installers for distributing Strumboli to end users. With these builds, users can run Strumboli without installing Python or managing dependencies.

## Overview

Strumboli uses PyInstaller to create standalone executables that bundle:
- Python runtime
- All Python dependencies
- Application code
- Optional web interface files

The result is a single application that users can download and run immediately.

## Quick Start

### macOS

Build a standalone macOS application:

```bash
# Using npm (recommended)
npm run build:osx

# Or using shell script
./build.sh
```

Creates: `dist/Strumboli.app`

Create a DMG installer:

```bash
# Using npm
npm run build:dmg

# Or using shell script
./create-dmg.sh
```

Creates: `dist/Strumboli-Installer.dmg`

### Linux/Raspberry Pi

Build a standalone Linux executable:

```bash
# Using npm
npm run build:linux

# Or using shell script
./build-linux.sh
```

Creates: `dist/Strumboli/Strumboli`

Create a Debian package:

```bash
# Using npm
npm run build:deb

# Or using shell script
./create-deb.sh
```

Creates: `strumboli_VERSION_armhf.deb`

See **[RASPBERRY-PI-QUICKSTART.md](https://github.com/bengfarrell/strumboli/blob/main/RASPBERRY-PI-QUICKSTART.md)** for Raspberry Pi specific instructions.

### Windows

Build on Windows (requires Windows machine or VM):

```bash
# Activate virtual environment
venv\Scripts\activate

# Build with PyInstaller
python -m PyInstaller server/midi-strummer.spec --clean
```

Creates: `dist/Strumboli/Strumboli.exe`

## Prerequisites

### Development Environment

**All Platforms:**
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install pyinstaller
```

### System Dependencies

System dependencies are required for building and running Strumboli.

See **[Run from Source - System Dependencies](/about/run-from-source/#1-install-system-dependencies)** for installation commands for all platforms.

## Build Output

### macOS
- **`dist/Strumboli.app`** - Standalone application bundle (double-click to run)
- **`dist/Strumboli-Installer.dmg`** - Installer with app and documentation

### Linux
- **`dist/Strumboli/Strumboli`** - Standalone executable
- **`strumboli_VERSION_armhf.deb`** - Debian package for easy installation

### Windows
- **`dist/Strumboli/Strumboli.exe`** - Standalone executable
- All dependencies bundled in the same folder

## Distribution Guide

### What Users Need

**Pre-installed system dependencies:**

**macOS:**
```bash
brew install hidapi
```

**Linux:**
```bash
sudo apt-get install libhidapi-hidraw0
```

**Windows:**
- Usually nothing (dependencies bundled)
- May need Visual C++ Redistributable (common)

**Plus:**
- A `settings.json` configuration file (provide a template)
- Drawing tablet connected via USB
- MIDI output device (virtual or hardware)

### First-Time User Setup

**macOS:**
1. Download `.dmg` or `.app`
2. Open DMG and drag app to Applications folder
3. Right-click app → "Open" (first time only, to bypass Gatekeeper)
4. Grant permissions for MIDI/HID devices if prompted
5. Place `settings.json` in the same folder as the app

**Linux:**
1. Download `.deb` package or executable
2. Install package: `sudo dpkg -i strumboli_*.deb`
3. Or make executable: `chmod +x Strumboli && ./Strumboli`
4. Place `settings.json` in `~/.config/strumboli/` or same folder

**Windows:**
1. Download and extract `.zip` file
2. Double-click `Strumboli.exe`
3. Click "More info" → "Run anyway" if Windows Defender shows warning
4. Place `settings.json` in the same folder as `.exe`

## Configuration File Location

The application searches for `settings.json` in this order:
1. Same directory as the executable
2. Current working directory
3. User's home directory
4. Platform-specific config directories:
   - macOS: `~/Library/Application Support/Strumboli/`
   - Linux: `~/.config/strumboli/`
   - Windows: `%APPDATA%/Strumboli/`

Provide users with a template `settings.json` file or create one automatically on first run.

## Advanced Options

### Adding Custom Icons

**macOS:**
```bash
# Create icon (requires iconutil or online converter)
iconutil -c icns icon.iconset

# Update spec file
# In server/Strumboli.spec:
icon='icon.icns'
```

**Windows:**
```python
# In server/midi-strummer.spec:
icon='icon.ico'
```

### Code Signing (macOS)

Prevents "Unknown Developer" warnings:

```bash
# Sign the application
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  dist/Strumboli.app

# Verify signature
codesign --verify --deep --strict --verbose=2 dist/Strumboli.app
```

**Notarization** (submit to Apple for malware scan):
```bash
# Submit DMG for notarization
xcrun notarytool submit dist/Strumboli-Installer.dmg \
  --apple-id your-email@example.com \
  --team-id TEAM_ID \
  --password app-specific-password \
  --wait

# Staple the notarization ticket
xcrun stapler staple dist/Strumboli-Installer.dmg
```

### Removing Console Window

For GUI-only mode (no terminal window):

```python
# In server/midi-strummer.spec or Strumboli.spec
exe = EXE(
    # ...
    console=False,  # Change from True to False
    # ...
)
```

### Including Additional Files

Add files to the bundle:

```python
# In server/Strumboli.spec
datas = [
    ('../settings.json', '.'),
    ('public', 'public'),
    ('../README.md', '.'),
    ('../docs', 'docs'),
]
```

### Reducing File Size

Built apps are typically 25-60 MB. To reduce size:

```python
# In spec file, exclude unnecessary modules
excludes = [
    'tkinter',
    'matplotlib',
    'PIL',
    # Add any unused packages
]
```

**Enable UPX compression** (already enabled in spec files):
```bash
# Install UPX
brew install upx  # macOS
sudo apt-get install upx  # Linux
```

## Testing Your Build

### Pre-Distribution Checklist

Test on a **clean system** without:
- Python installed
- Development tools
- Your development environment variables

### Test Checklist

- [ ] App launches without terminal/Python
- [ ] Auto-detects drawing tablet
- [ ] Connects to MIDI output
- [ ] Loads `settings.json` correctly
- [ ] WebSocket server starts (if enabled)
- [ ] Web dashboard loads (if enabled)
- [ ] No "missing module" errors in console
- [ ] Tablet input generates MIDI notes
- [ ] Configuration changes persist
- [ ] Graceful shutdown with Ctrl+C

### Testing Tools

**macOS:** Test on another Mac or use a VM  
**Linux:** Docker, VM, or actual device (Raspberry Pi)  
**Windows:** VirtualBox, Parallels, VMware, or clean Windows install

## Creating Installers

### macOS DMG

The `create-dmg.sh` script creates a professional DMG installer with:
- Application bundle
- Drag-to-Applications folder shortcut
- README and documentation
- Custom background (optional)

```bash
./create-dmg.sh
```

### Linux Debian Package

The `create-deb.sh` script creates a `.deb` package with:
- Desktop entry for application menu
- Icon
- Systemd service file (optional)
- Automatic dependency installation

```bash
./create-deb.sh
```

Users install with:
```bash
sudo dpkg -i strumboli_*.deb
sudo apt-get install -f  # Install dependencies
```

### Windows Installer

Use third-party tools:

**Inno Setup** (free, popular):
```pascal
[Setup]
AppName=Strumboli
AppVersion=1.0.0
DefaultDirName={pf}\Strumboli
OutputDir=dist
OutputBaseFilename=Strumboli-Installer

[Files]
Source: "dist\Strumboli\*"; DestDir: "{app}"; Flags: recursesubdirs
```

**NSIS** (open source)  
**WiX Toolset** (Microsoft's official)

## Distribution Channels

### 1. GitHub Releases

Upload built applications as release assets:
```bash
# Create a new release on GitHub
# Upload these files:
# - Strumboli-Installer.dmg (macOS)
# - strumboli_VERSION_armhf.deb (Linux)
# - Strumboli-Windows.zip (Windows)
```

### 2. Direct Download

Host on your website:
- Provide download links
- Include installation instructions
- List system requirements
- Provide sample `settings.json`

### 3. Package Managers

**macOS Homebrew Cask:**
```ruby
cask "strumboli" do
  version "1.0.0"
  url "https://example.com/Strumboli-#{version}.dmg"
  # ...
end
```

**Linux APT Repository:**
Create a Debian repository for easy updates

**Windows Chocolatey/Winget:**
Submit package to package manager

## File Sizes

Approximate sizes (uncompressed):
- **macOS**: 30-50 MB
- **Linux**: 25-40 MB
- **Windows**: 30-60 MB

Compressed (DMG/ZIP/DEB): 15-30 MB

## Troubleshooting Builds

### "ModuleNotFoundError" in Built App

Add missing module to `hiddenimports` in spec file:

```python
hiddenimports = [
    'websockets',
    'rtmidi',
    'hidapi',
    # Add any missing modules
]
```

### App Crashes Immediately

Run from terminal to see error messages:

```bash
# macOS
./dist/Strumboli.app/Contents/MacOS/Strumboli

# Linux
./dist/Strumboli/Strumboli

# Windows
dist\Strumboli\Strumboli.exe
```

### "App is Damaged" (macOS)

Remove quarantine attribute:
```bash
xattr -cr dist/Strumboli.app
```

### Large File Size

- Exclude unused Python modules
- Remove unnecessary data files
- Enable UPX compression
- Use `--exclude-module` PyInstaller flag

### Settings File Not Found

Make sure `settings.json` is:
- Bundled in the app (via `datas` in spec file)
- Or created on first run
- Or documented where users should place it

## Continuous Integration

Automate builds with GitHub Actions:

```yaml
name: Build
on: [push, release]

jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build:dmg
      - name: Upload
        uses: actions/upload-artifact@v3
        with:
          name: macos-dmg
          path: dist/*.dmg

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build:deb
      - name: Upload
        uses: actions/upload-artifact@v3
        with:
          name: linux-deb
          path: ./*.deb
```

## Release Checklist

Before distributing:

- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Test build on clean system
- [ ] Code signed (if applicable)
- [ ] Create GitHub Release
- [ ] Upload installers
- [ ] Update download links in README
- [ ] Update documentation
- [ ] Announce release

