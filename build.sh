#!/bin/bash
# Build script for Strumboli standalone application

set -e  # Exit on error

echo "=========================================="
echo "Strumboli - Build Script"
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

if [ -d "server/dist/Strumboli.app" ]; then
    # Proper .app bundle was created
    mkdir -p dist
    mv server/dist/Strumboli.app dist/
    
    echo "📦 Adding terminal launcher..."
    
    # Rename the original executable
    mv dist/Strumboli.app/Contents/MacOS/Strumboli dist/Strumboli.app/Contents/MacOS/Strumboli-bin
    
    # Create a launcher script that runs in Terminal
    cat > dist/Strumboli.app/Contents/MacOS/launcher.sh << 'LAUNCHER_EOF'
#!/bin/bash
# Launcher script to run Strumboli in a visible Terminal window

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the app directory
cd "$DIR"

echo "=========================================="
echo "Strumboli - MIDI Controller"
echo "=========================================="
echo ""
echo "Starting server..."
echo "Press Ctrl+C to stop"
echo ""

# Run the actual executable
./Strumboli-bin

echo ""
echo "Server stopped."
read -p "Press Enter to close this window..."
LAUNCHER_EOF
    chmod +x dist/Strumboli.app/Contents/MacOS/launcher.sh
    
    # Create a wrapper executable that launches Terminal
    cat > dist/Strumboli.app/Contents/MacOS/Strumboli << 'WRAPPER_EOF'
#!/bin/bash
# Wrapper to launch Strumboli in a new Terminal window

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open a new Terminal window and run the launcher script
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd '$DIR' && ./launcher.sh; exit"
end tell
APPLESCRIPT
WRAPPER_EOF
    chmod +x dist/Strumboli.app/Contents/MacOS/Strumboli
    
    echo "  ✓ Terminal launcher installed"
    
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application: dist/Strumboli.app"
    echo ""
    echo "To run the app:"
    echo "  open dist/Strumboli.app"
    echo "  (Will open in a Terminal window)"
    echo ""
    echo "To create a DMG installer:"
    echo "  ./create-dmg.sh"
elif [ -d "server/dist/Strumboli" ]; then
    # PyInstaller created directory structure - wrap it in .app bundle
    echo "📦 Creating .app bundle structure..."
    mkdir -p dist/Strumboli.app/Contents/MacOS
    mkdir -p dist/Strumboli.app/Contents/Resources
    
    # Copy executable
    echo "  → Copying executable..."
    cp server/dist/Strumboli/Strumboli dist/Strumboli.app/Contents/MacOS/
    
    # Copy _internal directory with all bundled files (CRITICAL FOR APP TO RUN)
    echo "  → Copying _internal directory..."
    if [ -d "server/dist/Strumboli/_internal" ]; then
        cp -R server/dist/Strumboli/_internal dist/Strumboli.app/Contents/MacOS/
        echo "  ✓ Copied _internal directory with bundled modules"
    else
        echo "  ⚠️  Warning: _internal directory not found!"
    fi
    
    # Copy icon if it exists
    if [ -f "server/icon.icns" ]; then
        cp server/icon.icns dist/Strumboli.app/Contents/Resources/
        echo "  ✓ Added app icon"
    fi
    
    # Create a launcher script that opens Terminal
    cat > dist/Strumboli.app/Contents/MacOS/launcher.sh << 'LAUNCHER_EOF'
#!/bin/bash
# Launcher script to run Strumboli in a visible Terminal window

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the app directory
cd "$DIR"

echo "=========================================="
echo "Strumboli - MIDI Controller"
echo "=========================================="
echo ""
echo "Starting server..."
echo "Press Ctrl+C to stop"
echo ""

# Run the actual executable
./Strumboli

echo ""
echo "Server stopped."
read -p "Press Enter to close this window..."
LAUNCHER_EOF
    chmod +x dist/Strumboli.app/Contents/MacOS/launcher.sh
    echo "  ✓ Created terminal launcher script"
    
    # Create a wrapper executable that launches Terminal
    cat > dist/Strumboli.app/Contents/MacOS/Strumboli-wrapper << 'WRAPPER_EOF'
#!/bin/bash
# Wrapper to launch Strumboli in a new Terminal window

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open a new Terminal window and run the launcher script
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd '$DIR' && ./launcher.sh; exit"
end tell
APPLESCRIPT
WRAPPER_EOF
    chmod +x dist/Strumboli.app/Contents/MacOS/Strumboli-wrapper
    echo "  ✓ Created Terminal wrapper"
    
    # Create Info.plist (pointing to wrapper instead of direct executable)
    cat > dist/Strumboli.app/Contents/Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Strumboli-wrapper</string>
    <key>CFBundleIdentifier</key>
    <string>com.strumboli.app</string>
    <key>CFBundleName</key>
    <string>Strumboli</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF
    
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application: dist/Strumboli.app"
    echo ""
    echo "To run the app:"
    echo "  open dist/Strumboli.app"
    echo ""
    echo "To create a DMG installer:"
    echo "  ./create-dmg.sh"
else
    echo ""
    echo "❌ Build failed - application not found in dist/"
    exit 1
fi

echo ""
echo "Note: The app requires settings.json in the same directory"
echo "      to run properly."

