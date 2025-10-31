#!/bin/bash
# Create a DMG installer for Strumboli Device Discovery Tool on macOS

set -e

echo "=========================================="
echo "Strumboli Device Discovery - DMG Creator"
echo "=========================================="
echo ""

# Check if app exists (either .app or directory)
APP_EXISTS=false
if [ -d "dist/Strumboli-Discover.app" ]; then
    APP_EXISTS=true
    APP_PATH="dist/Strumboli-Discover.app"
elif [ -d "dist/strumboli-discover" ]; then
    APP_EXISTS=true
    APP_PATH="dist/strumboli-discover"
fi

if [ "$APP_EXISTS" = false ]; then
    echo "❌ Error: Discovery tool not found"
    echo "Please run ./build-discovery-osx.sh first"
    exit 1
fi

# Create DMG directory
echo "🗂️  Creating DMG structure..."
DMG_DIR="dmg-discover-temp"
rm -rf "$DMG_DIR"
mkdir -p "$DMG_DIR"

# Copy app to DMG directory
echo "📦 Copying application..."
cp -R "$APP_PATH" "$DMG_DIR/"

# Create a README for the DMG
cat > "$DMG_DIR/README.txt" << 'EOF'
Strumboli Device Discovery Tool v1.0.0

This tool helps you create driver configuration files for new drawing tablets.

Installation:
1. Drag the application to your Applications folder (or anywhere you like)
2. Right-click and select "Open" to bypass macOS Gatekeeper on first run

Usage:
Run the tool and it will guide you through discovering your tablet's configuration.

The tool will:
- Detect all connected HID devices
- Help you identify your tablet
- Guide you through test actions (move stylus, press buttons, etc.)
- Automatically analyze the data
- Generate a working driver configuration file

First Run:
- The app will request permission to access HID devices
- Make sure your tablet is connected before running
- You may need to quit any official tablet driver software first

Output:
The tool creates a JSON driver file that you can use with Strumboli.
Copy this file to the Strumboli drivers folder.

Requirements:
- macOS 10.13 or later
- Drawing tablet connected via USB
- Administrator privileges may be required for HID access

For more information, visit:
https://github.com/yourusername/midi-strummer

Troubleshooting:
- If you get "Cannot open device" errors, close official tablet drivers
- Run with sudo if you get permission errors: sudo ./strumboli-discover
- Make sure tablet is connected: System Information > USB
EOF

# Create DMG
DMG_NAME="Strumboli-Discover-Installer.dmg"
echo "💿 Creating DMG..."

# Remove old DMG if exists
rm -f "dist/$DMG_NAME"

# Create DMG using hdiutil
hdiutil create -volname "Strumboli Discover" \
    -srcfolder "$DMG_DIR" \
    -ov \
    -format UDBZ \
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
echo "2. Copy the application to their preferred location"
echo "3. Run the tool to discover their tablet configuration"
echo ""

