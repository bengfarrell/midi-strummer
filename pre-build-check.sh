#!/bin/bash
# Pre-build check script - verifies environment is ready for building

echo "=========================================="
echo "MIDI Strummer - Pre-Build Check"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check Python version
echo "🔍 Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo "   ✅ Python $PYTHON_VERSION found"
else
    echo "   ❌ Python 3 not found"
    ((ERRORS++))
fi

# Check virtual environment
echo ""
echo "🔍 Checking virtual environment..."
if [ -d "venv" ]; then
    echo "   ✅ Virtual environment exists"
    
    # Check if activated
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo "   ✅ Virtual environment is activated"
    else
        echo "   ⚠️  Virtual environment not activated"
        echo "      Run: source venv/bin/activate"
        ((WARNINGS++))
    fi
else
    echo "   ❌ Virtual environment not found"
    echo "      Run: python3 -m venv venv"
    ((ERRORS++))
fi

# Check dependencies
echo ""
echo "🔍 Checking Python dependencies..."

if [[ "$VIRTUAL_ENV" != "" ]]; then
    DEPS=("rtmidi" "hid" "websockets" "pyinstaller")
    for dep in "${DEPS[@]}"; do
        if pip show "$dep" &> /dev/null 2>&1 || pip show "python-$dep" &> /dev/null 2>&1 || pip show "${dep}api" &> /dev/null 2>&1; then
            echo "   ✅ $dep installed"
        else
            echo "   ❌ $dep not installed"
            ((ERRORS++))
        fi
    done
else
    echo "   ⚠️  Cannot check - activate virtual environment first"
    ((WARNINGS++))
fi

# Check system dependencies
echo ""
echo "🔍 Checking system dependencies..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v brew &> /dev/null; then
        echo "   ✅ Homebrew installed"
        
        if brew list hidapi &> /dev/null; then
            echo "   ✅ hidapi installed"
        else
            echo "   ⚠️  hidapi not installed"
            echo "      Run: brew install hidapi"
            ((WARNINGS++))
        fi
    else
        echo "   ⚠️  Homebrew not found (recommended for hidapi)"
        ((WARNINGS++))
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if dpkg -l | grep libhidapi &> /dev/null; then
        echo "   ✅ hidapi installed"
    else
        echo "   ⚠️  hidapi not installed"
        echo "      Run: sudo apt-get install libhidapi-hidraw0 libhidapi-dev"
        ((WARNINGS++))
    fi
fi

# Check required files
echo ""
echo "🔍 Checking required files..."

FILES=(
    "server/main.py"
    "server/midi-strummer.spec"
    "settings.json"
    "requirements.txt"
    "build.sh"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file not found"
        ((ERRORS++))
    fi
done

# Check if build scripts are executable
echo ""
echo "🔍 Checking build scripts..."

if [ -x "build.sh" ]; then
    echo "   ✅ build.sh is executable"
else
    echo "   ⚠️  build.sh not executable"
    echo "      Run: chmod +x build.sh"
    ((WARNINGS++))
fi

if [ -f "create-dmg.sh" ]; then
    if [ -x "create-dmg.sh" ]; then
        echo "   ✅ create-dmg.sh is executable"
    else
        echo "   ⚠️  create-dmg.sh not executable"
        echo "      Run: chmod +x create-dmg.sh"
        ((WARNINGS++))
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready to build."
    echo ""
    echo "Run: ./build.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found. You can still build, but consider fixing warnings."
    echo ""
    echo "Run: ./build.sh"
    exit 0
else
    echo "❌ $ERRORS error(s) found. Please fix before building."
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  $WARNINGS warning(s) also found."
    fi
    echo ""
    echo "Common fixes:"
    echo "  1. Activate venv: source venv/bin/activate"
    echo "  2. Install dependencies: pip install -r requirements.txt"
    echo "  3. Install PyInstaller: pip install pyinstaller"
    echo "  4. Make scripts executable: chmod +x build.sh create-dmg.sh"
    exit 1
fi

