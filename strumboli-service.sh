#!/bin/bash
# Strumboli Service Management Script
# Helper script for managing the Strumboli systemd service

set -e

SERVICE_NAME="strumboli"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if service file exists
check_service_exists() {
    if ! systemctl list-unit-files | grep -q "^${SERVICE_NAME}.service"; then
        print_error "Strumboli service not found. Please install Strumboli first."
        exit 1
    fi
}

# Show usage
show_usage() {
    cat << EOF
Strumboli Service Management Script

Usage: $0 [command]

Commands:
    start       Start the Strumboli service
    stop        Stop the Strumboli service
    restart     Restart the Strumboli service
    status      Show service status
    enable      Enable auto-start on boot
    disable     Disable auto-start on boot
    logs        Show recent logs
    follow      Follow live logs
    edit        Edit the service configuration
    reload      Reload systemd daemon after config changes
    help        Show this help message

Examples:
    $0 start            # Start the service
    $0 enable           # Enable auto-start on boot
    $0 logs             # View recent logs
    $0 follow           # Watch live logs
EOF
}

# Start service
start_service() {
    print_status "Starting Strumboli service..."
    sudo systemctl start "$SERVICE_NAME"
    sleep 1
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service started successfully"
        show_status
    else
        print_error "Failed to start service"
        show_status
        exit 1
    fi
}

# Stop service
stop_service() {
    print_status "Stopping Strumboli service..."
    sudo systemctl stop "$SERVICE_NAME"
    sleep 1
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service stopped successfully"
    else
        print_error "Failed to stop service"
        exit 1
    fi
}

# Restart service
restart_service() {
    print_status "Restarting Strumboli service..."
    sudo systemctl restart "$SERVICE_NAME"
    sleep 1
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service restarted successfully"
        show_status
    else
        print_error "Failed to restart service"
        show_status
        exit 1
    fi
}

# Show status
show_status() {
    echo ""
    echo "=========================================="
    echo "Strumboli Service Status"
    echo "=========================================="
    systemctl status "$SERVICE_NAME" --no-pager || true
    echo ""
    
    # Check if enabled
    if systemctl is-enabled --quiet "$SERVICE_NAME"; then
        print_success "Auto-start: ENABLED"
    else
        print_warning "Auto-start: DISABLED (run '$0 enable' to enable)"
    fi
    
    # Show web dashboard URL if running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo ""
        print_status "Web Dashboard: http://localhost:8080"
        print_status "From other devices: http://$(hostname -I | awk '{print $1}'):8080"
    fi
    echo ""
}

# Enable service
enable_service() {
    print_status "Enabling auto-start on boot..."
    sudo systemctl enable "$SERVICE_NAME"
    print_success "Auto-start enabled"
    print_status "Strumboli will start automatically on system boot"
}

# Disable service
disable_service() {
    print_status "Disabling auto-start on boot..."
    sudo systemctl disable "$SERVICE_NAME"
    print_success "Auto-start disabled"
    print_status "Strumboli will not start automatically on system boot"
}

# Show logs
show_logs() {
    print_status "Showing recent logs (press 'q' to quit)..."
    echo ""
    journalctl -u "$SERVICE_NAME" -n 50 --no-pager
}

# Follow logs
follow_logs() {
    print_status "Following live logs (press Ctrl+C to stop)..."
    echo ""
    journalctl -u "$SERVICE_NAME" -f
}

# Edit service
edit_service() {
    print_warning "Editing service file. Be careful with changes!"
    print_status "After editing, run '$0 reload' to apply changes"
    echo ""
    sleep 2
    sudo systemctl edit --full "$SERVICE_NAME"
}

# Reload daemon
reload_daemon() {
    print_status "Reloading systemd daemon..."
    sudo systemctl daemon-reload
    print_success "Daemon reloaded"
    print_status "If service is running, restart it to apply changes: $0 restart"
}

# Main command dispatcher
case "${1:-}" in
    start)
        check_service_exists
        start_service
        ;;
    stop)
        check_service_exists
        stop_service
        ;;
    restart)
        check_service_exists
        restart_service
        ;;
    status)
        check_service_exists
        show_status
        ;;
    enable)
        check_service_exists
        enable_service
        ;;
    disable)
        check_service_exists
        disable_service
        ;;
    logs)
        check_service_exists
        show_logs
        ;;
    follow)
        check_service_exists
        follow_logs
        ;;
    edit)
        check_service_exists
        edit_service
        ;;
    reload)
        reload_daemon
        ;;
    help|--help|-h)
        show_usage
        ;;
    "")
        print_error "No command specified"
        echo ""
        show_usage
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

