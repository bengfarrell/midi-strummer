#!/bin/bash
# Build script for Strumboli standalone application on Linux/Raspberry Pi

set -e  # Exit on error

echo "=========================================="
echo "Strumboli - Linux Build Script"
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
pyinstaller midi-strummer-linux.spec --clean

# Move build artifacts to project root
echo "📦 Moving build artifacts..."
cd ..

if [ -d "server/dist/Strumboli" ]; then
    # Create dist directory if it doesn't exist
    mkdir -p dist
    
    # Move the application directory
    mv server/dist/Strumboli dist/
    
    # Create a launcher script
    cat > dist/Strumboli/strumboli.sh << 'LAUNCHER_EOF'
#!/bin/bash
# Launcher script for Strumboli

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

# Run the application
./Strumboli

echo ""
echo "Server stopped."
LAUNCHER_EOF
    chmod +x dist/Strumboli/strumboli.sh
    
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Application directory: dist/Strumboli/"
    echo ""
    echo "To test the app:"
    echo "  cd dist/Strumboli"
    echo "  ./strumboli.sh"
    echo ""
    echo "To create a Debian package installer:"
    echo "  ./create-deb.sh"
else
    echo ""
    echo "❌ Build failed - application not found in dist/"
    exit 1
fi

echo ""
echo "Note: The app requires settings.json in the same directory"
echo "      or in a standard location to run properly."

