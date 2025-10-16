#!/usr/bin/env python3
"""
Utility script to clean up zombie Python processes that might be holding HID devices.
Run this if you're having trouble connecting to your HID device.
"""

import subprocess
import sys
import os

def find_zombie_processes():
    """Find Python processes running server.py"""
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        if result.returncode != 0:
            print("Error: Could not list processes")
            return []
        
        lines = result.stdout.split('\n')
        zombie_processes = []
        
        for line in lines:
            if 'python' in line and 'server.py' in line:
                parts = line.split()
                if len(parts) > 1:
                    try:
                        pid = int(parts[1])
                        # Skip current process if this script is running
                        if pid != os.getpid():
                            zombie_processes.append((pid, line.strip()))
                    except (ValueError, IndexError):
                        continue
        
        return zombie_processes
        
    except Exception as e:
        print(f"Error finding processes: {e}")
        return []

def kill_processes(pids):
    """Kill the specified process IDs"""
    if not pids:
        return True
    
    try:
        # Try graceful kill first
        for pid in pids:
            try:
                os.kill(pid, 15)  # SIGTERM
            except ProcessLookupError:
                print(f"Process {pid} already terminated")
            except Exception as e:
                print(f"Error killing process {pid}: {e}")
        
        # Wait a moment
        import time
        time.sleep(1)
        
        # Check if processes are still running and force kill if needed
        remaining_pids = []
        for pid in pids:
            try:
                os.kill(pid, 0)  # Check if process exists
                remaining_pids.append(pid)
            except ProcessLookupError:
                pass  # Process is gone
        
        if remaining_pids:
            print(f"Force killing remaining processes: {remaining_pids}")
            for pid in remaining_pids:
                try:
                    os.kill(pid, 9)  # SIGKILL
                except ProcessLookupError:
                    pass  # Process already gone
                except Exception as e:
                    print(f"Error force killing process {pid}: {e}")
        
        return True
        
    except Exception as e:
        print(f"Error killing processes: {e}")
        return False

def main():
    print("HID Device Cleanup Utility")
    print("=" * 40)
    
    # Find zombie processes
    zombie_processes = find_zombie_processes()
    
    if not zombie_processes:
        print("✅ No zombie Python server processes found.")
        print("Your HID device should be available for connection.")
        return 0
    
    print(f"⚠️  Found {len(zombie_processes)} zombie Python server processes:")
    for pid, cmd in zombie_processes:
        print(f"   PID {pid}: {cmd}")
    
    print("\nThese processes may be preventing HID device access.")
    
    # Ask for confirmation
    try:
        response = input("\nKill these processes? (y/N): ").strip().lower()
        if response in ['y', 'yes']:
            pids = [pid for pid, _ in zombie_processes]
            if kill_processes(pids):
                print("✅ Processes killed successfully.")
                print("Your HID device should now be available for connection.")
                return 0
            else:
                print("❌ Failed to kill some processes.")
                return 1
        else:
            print("Processes left running. You may need to kill them manually:")
            pids = [str(pid) for pid, _ in zombie_processes]
            print(f"kill -9 {' '.join(pids)}")
            return 1
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
