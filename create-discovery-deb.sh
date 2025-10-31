#!/bin/bash
# Create a Debian package for Strumboli Device Discovery Tool

set -e

echo "=========================================="
echo "Strumboli Device Discovery - Debian Package"
echo "=========================================="
echo ""

# Check if app exists
if [ ! -d "dist/strumboli-discover" ]; then
    echo "❌ Error: Discovery tool not found"
    echo "Please run ./build-discovery-linux.sh first"
    exit 1
fi

# Get version from config or use default
VERSION="1.0.0"

# Create package directory structure
PKG_NAME="strumboli-discover_${VERSION}_armhf"
PKG_DIR="dist/$PKG_NAME"

echo "🗂️  Creating Debian package structure..."
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/opt/strumboli-discover"
mkdir -p "$PKG_DIR/usr/bin"

# Copy application files
echo "📦 Copying application files..."
cp -R dist/strumboli-discover/* "$PKG_DIR/opt/strumboli-discover/"

# Create symlink in /usr/bin for easy command-line access
cat > "$PKG_DIR/usr/bin/strumboli-discover" << 'EOF'
#!/bin/bash
# Strumboli Device Discovery launcher
/opt/strumboli-discover/strumboli-discover "$@"
EOF
chmod +x "$PKG_DIR/usr/bin/strumboli-discover"

# Create control file
cat > "$PKG_DIR/DEBIAN/control" << EOF
Package: strumboli-discover
Version: $VERSION
Section: utils
Priority: optional
Architecture: armhf
Depends: libhidapi-hidraw0, libhidapi-dev
Maintainer: Strumboli Project
Description: Device Discovery Tool for Strumboli MIDI Controller
 Interactive wizard for discovering and configuring new drawing tablets
 and HID devices for use with Strumboli.
 .
 Features:
  - Auto-detects HID device byte mappings
  - Interactive guided workflow
  - Generates driver configuration files
  - Supports multi-interface devices
  - Works with any HID-compatible tablet
EOF

# Create postinst script
cat > "$PKG_DIR/DEBIAN/postinst" << 'EOF'
#!/bin/bash
set -e

echo "Strumboli Device Discovery Tool installed successfully!"
echo ""
echo "Usage:"
echo "  strumboli-discover"
echo ""
echo "Or run from installation directory:"
echo "  cd /opt/strumboli-discover"
echo "  ./strumboli-discover"
echo ""
echo "The tool will guide you through discovering your tablet's configuration."
echo ""
echo "Note: You may need to run with sudo for HID device access:"
echo "  sudo strumboli-discover"
echo ""
echo "Or add your user to the input group:"
echo "  sudo usermod -a -G input $USER"
echo "  (then log out and back in)"
echo ""

# Set correct permissions
chmod +x /opt/strumboli-discover/strumboli-discover
chmod +x /usr/bin/strumboli-discover

exit 0
EOF
chmod +x "$PKG_DIR/DEBIAN/postinst"

# Create postrm script
cat > "$PKG_DIR/DEBIAN/postrm" << 'EOF'
#!/bin/bash
set -e

echo "Strumboli Device Discovery Tool has been uninstalled."

exit 0
EOF
chmod +x "$PKG_DIR/DEBIAN/postrm"

# Build the package
echo "💿 Building Debian package..."
dpkg-deb --build "$PKG_DIR"

# Move to dist directory with a cleaner name
mv "${PKG_DIR}.deb" "dist/strumboli-discover-${VERSION}-raspberry-pi.deb"

# Clean up
echo "🧹 Cleaning up..."
rm -rf "$PKG_DIR"

echo ""
echo "=========================================="
echo "✅ Debian package created successfully!"
echo "=========================================="
echo ""
echo "Package: dist/strumboli-discover-${VERSION}-raspberry-pi.deb"
echo ""
echo "To install on Raspberry Pi:"
echo "  sudo apt update"
echo "  sudo apt install ./strumboli-discover-${VERSION}-raspberry-pi.deb"
echo ""
echo "After installation, run:"
echo "  strumboli-discover"
echo ""
echo "Or with sudo if needed:"
echo "  sudo strumboli-discover"
echo ""

