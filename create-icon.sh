#!/bin/bash
# Convert SVG logo to macOS .icns icon

set -e

echo "=========================================="
echo "Creating macOS App Icon"
echo "=========================================="
echo ""

# Check if we have the SVG file
if [ ! -f "assets/favicon.svg" ]; then
    echo "❌ Error: assets/favicon.svg not found"
    exit 1
fi

# Create temporary directory for icon generation
ICON_DIR="icon-temp"
rm -rf "$ICON_DIR"
mkdir -p "$ICON_DIR"

echo "📐 Converting SVG to PNG at various sizes..."

# Required icon sizes for macOS
SIZES=(16 32 64 128 256 512 1024)

# Check if we have imagemagick or rsvg-convert
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg-convert"
    echo "Using rsvg-convert..."
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
    echo "Using ImageMagick..."
else
    echo "❌ Error: Neither rsvg-convert nor ImageMagick found"
    echo ""
    echo "Please install one of the following:"
    echo "  brew install librsvg          # for rsvg-convert"
    echo "  brew install imagemagick       # for ImageMagick"
    exit 1
fi

# Convert SVG to PNG at each size
for SIZE in "${SIZES[@]}"; do
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w $SIZE -h $SIZE assets/favicon.svg -o "$ICON_DIR/icon_${SIZE}x${SIZE}.png"
    else
        convert -background none -resize ${SIZE}x${SIZE} assets/favicon.svg "$ICON_DIR/icon_${SIZE}x${SIZE}.png"
    fi
    echo "  ✓ Created ${SIZE}x${SIZE} icon"
done

echo ""
echo "🎨 Creating .icns file..."

# Create iconset directory
ICONSET_DIR="$ICON_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# Copy icons to iconset with proper naming
cp "$ICON_DIR/icon_16x16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$ICON_DIR/icon_32x32.png" "$ICONSET_DIR/icon_16x16@2x.png"
cp "$ICON_DIR/icon_32x32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$ICON_DIR/icon_64x64.png" "$ICONSET_DIR/icon_32x32@2x.png"
cp "$ICON_DIR/icon_128x128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$ICON_DIR/icon_256x256.png" "$ICONSET_DIR/icon_128x128@2x.png"
cp "$ICON_DIR/icon_256x256.png" "$ICONSET_DIR/icon_256x256.png"
cp "$ICON_DIR/icon_512x512.png" "$ICONSET_DIR/icon_256x256@2x.png"
cp "$ICON_DIR/icon_512x512.png" "$ICONSET_DIR/icon_512x512.png"
cp "$ICON_DIR/icon_1024x1024.png" "$ICONSET_DIR/icon_512x512@2x.png"

# Convert iconset to icns
iconutil -c icns "$ICONSET_DIR" -o server/icon.icns

echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf "$ICON_DIR"

echo ""
echo "=========================================="
echo "✅ Icon created successfully!"
echo "=========================================="
echo ""
echo "Icon file: server/icon.icns"
echo ""
echo "The build script will now use this icon."
echo ""

