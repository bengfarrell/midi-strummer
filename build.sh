#!/bin/bash
# Build script for MIDI Strummer standalone application

set -e  # Exit on error

echo "=========================================="
echo "MIDI Strummer - Build Script"
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
rm -rf dist/ build/ server/__pycache__/

# Build the application
echo "🏗️  Building application..."
cd server
pyinstaller midi-strummer.spec --clean

# Move build artifacts to project root
echo "📦 Moving build artifacts..."
cd ..
if [ -d "server/dist/MIDI-Strummer.app" ]; then
    mv server/dist/MIDI-Strummer.app dist/ 2>/dev/null || mkdir -p dist && mv server/dist/MIDI-Strummer.app dist/
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application: dist/MIDI-Strummer.app"
    echo ""
    echo "To run the app:"
    echo "  open dist/MIDI-Strummer.app"
    echo ""
    echo "To create a DMG installer:"
    echo "  ./create-dmg.sh"
elif [ -d "server/dist/MIDI-Strummer" ]; then
    mv server/dist/MIDI-Strummer dist/ 2>/dev/null || mkdir -p dist && mv server/dist/MIDI-Strummer dist/
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application: dist/MIDI-Strummer/"
    echo ""
    echo "To run the app:"
    echo "  ./dist/MIDI-Strummer/MIDI-Strummer"
else
    echo ""
    echo "❌ Build failed - application not found in dist/"
    exit 1
fi

echo ""
echo "Note: The app requires settings.json in the same directory"
echo "      to run properly."

