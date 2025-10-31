#!/bin/bash
# Create a Debian package installer for Linux/Raspberry Pi

set -e

echo "=========================================="
echo "Strumboli - Debian Package Creator"
echo "=========================================="
echo ""

# Check if app exists
if [ ! -d "dist/Strumboli" ]; then
    echo "❌ Error: Strumboli application not found"
    echo "Please run ./build-linux.sh first"
    exit 1
fi

# Get version from config or use default
VERSION="1.0.0"

# Create package directory structure
PKG_NAME="strumboli_${VERSION}_armhf"
PKG_DIR="dist/$PKG_NAME"

echo "🗂️  Creating Debian package structure..."
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/opt/strumboli"
mkdir -p "$PKG_DIR/usr/share/applications"
mkdir -p "$PKG_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$PKG_DIR/usr/bin"
mkdir -p "$PKG_DIR/etc/systemd/system"

# Copy application files
echo "📦 Copying application files..."
cp -R dist/Strumboli/* "$PKG_DIR/opt/strumboli/"

# Copy settings.json if it exists
if [ -f "settings.json" ]; then
    cp settings.json "$PKG_DIR/opt/strumboli/"
    echo "📋 Including settings.json"
fi

# Create symlink in /usr/bin for easy command-line access
cat > "$PKG_DIR/usr/bin/strumboli" << 'EOF'
#!/bin/bash
# Strumboli launcher symlink
/opt/strumboli/strumboli.sh "$@"
EOF
chmod +x "$PKG_DIR/usr/bin/strumboli"

# Create desktop entry
cat > "$PKG_DIR/usr/share/applications/strumboli.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Strumboli
Comment=MIDI Controller for Drawing Tablets
Exec=/opt/strumboli/strumboli.sh
Icon=strumboli
Terminal=true
Categories=AudioVideo;Audio;MIDI;
Keywords=midi;tablet;music;controller;
EOF

# Create systemd service file
cat > "$PKG_DIR/etc/systemd/system/strumboli.service" << 'EOF'
[Unit]
Description=Strumboli MIDI Controller
After=network.target sound.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/strumboli
ExecStart=/opt/strumboli/Strumboli
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

# Environment variables
Environment="DISPLAY=:0"

[Install]
WantedBy=multi-user.target
EOF

# Copy icon if it exists (convert from icns if needed)
if [ -f "server/icon.icns" ]; then
    # For now, just note that an icon exists
    # You may want to convert it to PNG format for Linux
    echo "ℹ️  Icon conversion needed (ICNS -> PNG)"
fi

# Create control file
cat > "$PKG_DIR/DEBIAN/control" << EOF
Package: strumboli
Version: $VERSION
Section: sound
Priority: optional
Architecture: armhf
Depends: libhidapi-hidraw0, libhidapi-dev
Maintainer: Strumboli Project
Description: MIDI Controller for Drawing Tablets
 Strumboli is a Python application that converts drawing tablet input
 into MIDI output, enabling musicians to use tablets as expressive
 MIDI controllers with strumming, pitch bend, and velocity control.
 .
 Features:
  - HID device support for drawing tablets
  - MIDI output with configurable mappings
  - Web dashboard for configuration
  - WebSocket real-time communication
  - Auto-start on boot (optional)
EOF

# Create postinst script (runs after installation)
cat > "$PKG_DIR/DEBIAN/postinst" << 'EOF'
#!/bin/bash
set -e

echo "Strumboli installed successfully!"
echo ""
echo "To configure auto-start on boot:"
echo "  sudo systemctl enable strumboli"
echo "  sudo systemctl start strumboli"
echo ""
echo "To run manually:"
echo "  strumboli"
echo ""
echo "Configuration file: /opt/strumboli/settings.json"
echo ""
echo "Web dashboard (when running): http://localhost:8080"
echo ""

# Set correct permissions
chmod +x /opt/strumboli/Strumboli
chmod +x /opt/strumboli/strumboli.sh
chmod +x /usr/bin/strumboli

# Reload systemd daemon to recognize new service
systemctl daemon-reload

exit 0
EOF
chmod +x "$PKG_DIR/DEBIAN/postinst"

# Create prerm script (runs before uninstall)
cat > "$PKG_DIR/DEBIAN/prerm" << 'EOF'
#!/bin/bash
set -e

# Stop and disable service if it's running
if systemctl is-active --quiet strumboli; then
    echo "Stopping Strumboli service..."
    systemctl stop strumboli
fi

if systemctl is-enabled --quiet strumboli; then
    echo "Disabling Strumboli service..."
    systemctl disable strumboli
fi

exit 0
EOF
chmod +x "$PKG_DIR/DEBIAN/prerm"

# Create postrm script (runs after uninstall)
cat > "$PKG_DIR/DEBIAN/postrm" << 'EOF'
#!/bin/bash
set -e

# Reload systemd daemon after service file is removed
systemctl daemon-reload

echo "Strumboli has been uninstalled."

exit 0
EOF
chmod +x "$PKG_DIR/DEBIAN/postrm"

# Build the package
echo "💿 Building Debian package..."
dpkg-deb --build "$PKG_DIR"

# Move to dist directory with a cleaner name
mv "${PKG_DIR}.deb" "dist/strumboli-${VERSION}-raspberry-pi.deb"

# Clean up
echo "🧹 Cleaning up..."
rm -rf "$PKG_DIR"

echo ""
echo "=========================================="
echo "✅ Debian package created successfully!"
echo "=========================================="
echo ""
echo "Package: dist/strumboli-${VERSION}-raspberry-pi.deb"
echo ""
echo "To install on Raspberry Pi:"
echo "  sudo apt update"
echo "  sudo apt install ./strumboli-${VERSION}-raspberry-pi.deb"
echo ""
echo "System dependencies (will be installed automatically):"
echo "  - libhidapi-hidraw0"
echo "  - libhidapi-dev"
echo ""
echo "After installation:"
echo "  - Run manually: strumboli"
echo "  - Enable auto-start: sudo systemctl enable strumboli"
echo "  - Start service: sudo systemctl start strumboli"
echo "  - Check status: sudo systemctl status strumboli"
echo "  - View logs: journalctl -u strumboli -f"
echo ""

