#!/usr/bin/env python3
"""
Kill XPPen driver processes that might be preventing HID device access.
"""

import os
import sys
import subprocess
import signal

def find_xppen_processes():
    """Find XPPen driver processes"""
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        if result.returncode != 0:
            return []
        
        lines = result.stdout.split('\n')
        xppen_processes = []
        
        for line in lines:
            if 'XPPen' in line or 'xppen' in line.lower():
                parts = line.split()
                if len(parts) > 1:
                    try:
                        pid = int(parts[1])
                        xppen_processes.append((pid, line.strip()))
                    except (ValueError, IndexError):
                        continue
        
        return xppen_processes
    except Exception as e:
        print(f"Error finding XPPen processes: {e}")
        return []

def kill_xppen_processes():
    """Kill XPPen driver processes"""
    xppen_processes = find_xppen_processes()
    
    if not xppen_processes:
        print("✅ No XPPen driver processes found")
        return True
    
    print(f"Found {len(xppen_processes)} XPPen driver processes:")
    for pid, cmd in xppen_processes:
        print(f"  PID {pid}: {cmd}")
    
    # Kill the processes
    for pid, cmd in xppen_processes:
        try:
            print(f"Killing XPPen process {pid}...")
            os.kill(pid, signal.SIGTERM)
            # Wait a moment and force kill if needed
            import time
            time.sleep(0.5)
            try:
                os.kill(pid, 0)  # Check if still running
                print(f"Force killing XPPen process {pid}...")
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                print(f"XPPen process {pid} terminated successfully")
        except ProcessLookupError:
            print(f"XPPen process {pid} already terminated")
        except Exception as e:
            print(f"Error killing XPPen process {pid}: {e}")
    
    print("✅ XPPen driver cleanup completed")
    return True

def main():
    print("XPPen Driver Cleanup")
    print("=" * 30)
    
    if kill_xppen_processes():
        print("\n💡 TIP: You may need to restart the XPPen driver if you want to use")
        print("   XPPen's official software. The driver will restart automatically")
        print("   when you connect your tablet.")
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())
