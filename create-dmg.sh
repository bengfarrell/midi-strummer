#!/bin/bash
# Create a DMG installer for macOS

set -e

echo "=========================================="
echo "Strumboli - DMG Creator"
echo "=========================================="
echo ""

# Check if app exists
if [ ! -d "dist/Strumboli.app" ]; then
    echo "❌ Error: Strumboli.app not found"
    echo "Please run ./build.sh first"
    exit 1
fi

# Create DMG directory
echo "🗂️  Creating DMG structure..."
DMG_DIR="dmg-temp"
rm -rf "$DMG_DIR"
mkdir -p "$DMG_DIR"

# Copy app to DMG directory
echo "📦 Copying application..."
cp -R dist/Strumboli.app "$DMG_DIR/"

# Copy settings.json
if [ -f "settings.json" ]; then
    cp settings.json "$DMG_DIR/"
    echo "📋 Including settings.json"
fi

# Create a README for the DMG
cat > "$DMG_DIR/README.txt" << EOF
Strumboli v1.0.0

Installation:
1. Drag Strumboli.app to your Applications folder
2. Place settings.json in the same directory as the app
   (or keep it in ~/Documents/projects/web/midi-strummer/)

First Run:
- Right-click the app and select "Open" to bypass macOS Gatekeeper
- The app will request permission to access MIDI devices
- Make sure your tablet/HID device is connected

Configuration:
- Edit settings.json to customize MIDI mappings and behavior
- The app reads settings.json on startup

Troubleshooting:
- If the app doesn't start, check Console.app for error messages
- Ensure MIDI devices are connected before launching
- Check that hidapi is installed: brew install hidapi

For more information, visit:
https://github.com/yourusername/midi-strummer
EOF

# Create symbolic link to Applications folder
echo "🔗 Creating Applications folder link..."
ln -s /Applications "$DMG_DIR/Applications"

# Create DMG
DMG_NAME="Strumboli-Installer.dmg"
echo "💿 Creating DMG..."

# Remove old DMG if exists
rm -f "dist/$DMG_NAME"

# Create DMG using hdiutil
hdiutil create -volname "Strumboli" \
    -srcfolder "$DMG_DIR" \
    -ov \
    -format UDZO \
    "dist/$DMG_NAME"

# Clean up
echo "🧹 Cleaning up..."
rm -rf "$DMG_DIR"

echo ""
echo "=========================================="
echo "✅ DMG created successfully!"
echo "=========================================="
echo ""
echo "Installer: dist/$DMG_NAME"
echo ""
echo "Users can now:"
echo "1. Download and mount the DMG"
echo "2. Drag Strumboli.app to Applications"
echo "3. Double-click to run"
echo ""

