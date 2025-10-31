#!/bin/bash
# Build script for Strumboli Device Discovery Tool on macOS

set -e  # Exit on error

echo "=========================================="
echo "Strumboli Device Discovery - macOS Build"
echo "=========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Error: Virtual environment not found"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install PyInstaller if not already installed
if ! pip show pyinstaller > /dev/null 2>&1; then
    echo "📦 Installing PyInstaller..."
    pip install pyinstaller
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/strumboli-discover* build/strumboli-discover*

# Build the application
echo "🏗️  Building discovery tool..."
cd server/discovery
pyinstaller device-discovery.spec --clean

# Move build artifacts to project root
echo "📦 Moving build artifacts..."
cd ../..

if [ -d "server/discovery/dist/Strumboli-Discover.app" ]; then
    # Proper .app bundle was created
    mkdir -p dist
    mv server/discovery/dist/Strumboli-Discover.app dist/
    
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application: dist/Strumboli-Discover.app"
    echo ""
    echo "To run the app:"
    echo "  open dist/Strumboli-Discover.app"
    echo ""
    echo "Or run directly from terminal:"
    echo "  dist/Strumboli-Discover.app/Contents/MacOS/strumboli-discover"
    echo ""
    echo "To create a DMG installer:"
    echo "  ./create-discovery-dmg.sh"
elif [ -d "server/discovery/dist/strumboli-discover" ]; then
    # PyInstaller created directory structure
    mkdir -p dist
    mv server/discovery/dist/strumboli-discover dist/
    
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application directory: dist/strumboli-discover/"
    echo ""
    echo "To run:"
    echo "  cd dist/strumboli-discover"
    echo "  ./strumboli-discover"
    echo ""
    echo "To create a DMG installer:"
    echo "  ./create-discovery-dmg.sh"
else
    echo ""
    echo "❌ Build failed - application not found in dist/"
    exit 1
fi

echo ""

