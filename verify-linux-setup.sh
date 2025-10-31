#!/bin/bash
# Strumboli Linux Setup Verification Script
# Checks if system is properly configured for Strumboli

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Strumboli Setup Verification"
echo "=========================================="
echo ""

# Track overall status
all_checks_passed=true

# Function to print status
print_check() {
    local status=$1
    local message=$2
    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $message"
    elif [ "$status" = "fail" ]; then
        echo -e "${RED}✗${NC} $message"
        all_checks_passed=false
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}!${NC} $message"
    else
        echo -e "${BLUE}ℹ${NC} $message"
    fi
}

# Check 1: System Architecture
echo "Checking System..."
ARCH=$(uname -m)
if [ "$ARCH" = "armv7l" ] || [ "$ARCH" = "aarch64" ]; then
    print_check "pass" "Architecture: $ARCH (Raspberry Pi)"
elif [ "$ARCH" = "x86_64" ]; then
    print_check "pass" "Architecture: $ARCH (Desktop Linux)"
else
    print_check "warn" "Architecture: $ARCH (may not be supported)"
fi

# Check 2: Operating System
if [ -f /etc/os-release ]; then
    OS_NAME=$(grep "^NAME=" /etc/os-release | cut -d'"' -f2)
    OS_VERSION=$(grep "^VERSION=" /etc/os-release | cut -d'"' -f2)
    print_check "info" "OS: $OS_NAME $OS_VERSION"
fi

echo ""
echo "Checking Dependencies..."

# Check 3: Python 3
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_check "pass" "Python 3: $PYTHON_VERSION"
else
    print_check "fail" "Python 3: Not found"
    echo "       Install with: sudo apt install python3"
fi

# Check 4: HIDApi library
if ldconfig -p | grep -q libhidapi; then
    print_check "pass" "HIDApi library installed"
else
    print_check "fail" "HIDApi library not found"
    echo "       Install with: sudo apt install libhidapi-hidraw0 libhidapi-dev"
fi

# Check 5: ALSA (for MIDI)
if command -v aconnect &> /dev/null; then
    print_check "pass" "ALSA MIDI tools installed"
else
    print_check "warn" "ALSA MIDI tools not found (optional)"
    echo "       Install with: sudo apt install alsa-utils"
fi

echo ""
echo "Checking Permissions..."

# Check 6: User groups
USER_GROUPS=$(groups)
if echo "$USER_GROUPS" | grep -q "input"; then
    print_check "pass" "User in 'input' group (HID access)"
else
    print_check "fail" "User NOT in 'input' group"
    echo "       Add with: sudo usermod -a -G input $USER"
    echo "       Then log out and back in"
fi

if echo "$USER_GROUPS" | grep -q "audio"; then
    print_check "pass" "User in 'audio' group (MIDI access)"
else
    print_check "fail" "User NOT in 'audio' group"
    echo "       Add with: sudo usermod -a -G audio $USER"
    echo "       Then log out and back in"
fi

echo ""
echo "Checking Hardware..."

# Check 7: HID devices
HID_DEVICES=$(ls /dev/hidraw* 2>/dev/null | wc -l)
if [ "$HID_DEVICES" -gt 0 ]; then
    print_check "pass" "Found $HID_DEVICES HID device(s)"
    ls -l /dev/hidraw* 2>/dev/null | while read line; do
        echo "       $line"
    done
else
    print_check "warn" "No HID devices found"
    echo "       Connect your tablet and try again"
fi

# Check 8: USB devices
if command -v lsusb &> /dev/null; then
    TABLET_FOUND=false
    if lsusb | grep -qi "xp-pen\|wacom\|huion"; then
        TABLET_FOUND=true
        print_check "pass" "Drawing tablet detected:"
        lsusb | grep -i "xp-pen\|wacom\|huion" | while read line; do
            echo "       $line"
        done
    else
        print_check "warn" "No known drawing tablet detected"
        echo "       Connect your tablet or it may not be recognized"
    fi
else
    print_check "warn" "lsusb not available"
fi

# Check 9: MIDI devices
if command -v aconnect &> /dev/null; then
    MIDI_PORTS=$(aconnect -l 2>/dev/null | grep -c "client")
    if [ "$MIDI_PORTS" -gt 0 ]; then
        print_check "pass" "MIDI system available"
    else
        print_check "warn" "No MIDI ports found"
    fi
else
    print_check "warn" "aconnect not available (install alsa-utils)"
fi

echo ""
echo "Checking Strumboli Installation..."

# Check 10: Strumboli installed
if [ -d "/opt/strumboli" ]; then
    print_check "pass" "Strumboli installed in /opt/strumboli"
    
    # Check for executable
    if [ -x "/opt/strumboli/Strumboli" ]; then
        print_check "pass" "Strumboli executable found"
    else
        print_check "fail" "Strumboli executable not found or not executable"
    fi
    
    # Check for launcher script
    if [ -x "/opt/strumboli/strumboli.sh" ]; then
        print_check "pass" "Launcher script found"
    else
        print_check "warn" "Launcher script not found"
    fi
    
    # Check for settings file
    if [ -f "/opt/strumboli/settings.json" ]; then
        print_check "pass" "Configuration file found"
    else
        print_check "warn" "Configuration file not found"
        echo "       Create /opt/strumboli/settings.json"
    fi
else
    print_check "warn" "Strumboli not installed in /opt/strumboli"
    echo "       Run from source or install package first"
fi

# Check 11: Strumboli command
if command -v strumboli &> /dev/null; then
    print_check "pass" "Strumboli command available"
else
    print_check "warn" "Strumboli command not in PATH"
fi

# Check 12: Systemd service
if systemctl list-unit-files | grep -q "strumboli.service"; then
    print_check "pass" "Systemd service installed"
    
    # Check if enabled
    if systemctl is-enabled --quiet strumboli 2>/dev/null; then
        print_check "info" "Service: Enabled (auto-start on boot)"
    else
        print_check "info" "Service: Disabled (manual start only)"
    fi
    
    # Check if running
    if systemctl is-active --quiet strumboli 2>/dev/null; then
        print_check "info" "Service: Running"
    else
        print_check "info" "Service: Not running"
    fi
else
    print_check "warn" "Systemd service not installed"
fi

echo ""
echo "Checking Network..."

# Check 13: Web server port
if command -v netstat &> /dev/null; then
    if netstat -tln | grep -q ":8080"; then
        print_check "pass" "Web server port 8080 is in use (Strumboli may be running)"
    else
        print_check "info" "Web server port 8080 is available"
    fi
else
    print_check "warn" "netstat not available"
    echo "       Install with: sudo apt install net-tools"
fi

# Check 14: WebSocket port
if command -v netstat &> /dev/null; then
    if netstat -tln | grep -q ":9001"; then
        print_check "pass" "WebSocket port 9001 is in use (Strumboli may be running)"
    else
        print_check "info" "WebSocket port 9001 is available"
    fi
fi

echo ""
echo "=========================================="
if [ "$all_checks_passed" = true ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Your system is ready for Strumboli."
    echo ""
    echo "Next steps:"
    echo "  1. Configure settings.json"
    echo "  2. Run: strumboli"
    echo "  3. Access dashboard: http://localhost:8080"
else
    echo -e "${YELLOW}! Some checks failed${NC}"
    echo ""
    echo "Please address the failed checks above."
    echo "Common fixes:"
    echo "  - Install dependencies: sudo apt install libhidapi-hidraw0 libhidapi-dev"
    echo "  - Add user to groups: sudo usermod -a -G input,audio $USER"
    echo "  - Log out and log back in after group changes"
fi
echo "=========================================="
echo ""

# Additional info
echo "Useful Commands:"
echo "  Start Strumboli:        strumboli"
echo "  Start service:          sudo systemctl start strumboli"
echo "  Enable auto-start:      sudo systemctl enable strumboli"
echo "  Check service status:   sudo systemctl status strumboli"
echo "  View logs:              journalctl -u strumboli -f"
echo "  Service manager:        ./strumboli-service.sh help"
echo ""
echo "Documentation:"
echo "  Quick Start:            RASPBERRY-PI-QUICKSTART.md"
echo "  Full Guide:             LINUX-INSTALL.md"
echo ""

