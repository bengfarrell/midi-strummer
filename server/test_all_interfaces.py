#!/usr/bin/env python3
"""
Test script to read from all XP-Pen interfaces simultaneously
Press tablet buttons and see which interface receives the data
"""

import hid
import time
import threading

def monitor_interface(interface_num, device_path):
    """Monitor a specific interface"""
    try:
        device = hid.device()
        device.open_path(device_path)
        device.set_nonblocking(True)
        print(f"[Interface {interface_num}] Opened successfully")
        
        last_report_time = 0
        while True:
            data = device.read(64)
            if data:
                current_time = time.time()
                # Only print if it's been at least 0.1s since last report
                if current_time - last_report_time > 0.1:
                    hex_data = ' '.join(f'{b:02x}' for b in data[:12])
                    print(f"[Interface {interface_num}] {hex_data}")
                    last_report_time = current_time
            else:
                time.sleep(0.001)
                
    except Exception as e:
        print(f"[Interface {interface_num}] Error: {e}")

def main():
    # Find all XP-Pen Deco 640 interfaces
    devices = hid.enumerate(0x28bd, 0x2904)
    
    print(f"Found {len(devices)} XP-Pen Deco 640 interfaces")
    print("\nPress any tablet button and watch for output...")
    print("Press Ctrl+C to exit\n")
    
    threads = []
    for i, device_info in enumerate(devices):
        interface_num = device_info.get('interface_number', i)
        path = device_info['path']
        print(f"Starting monitor for interface {interface_num}")
        
        thread = threading.Thread(
            target=monitor_interface,
            args=(interface_num, path),
            daemon=True
        )
        thread.start()
        threads.append(thread)
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nExiting...")

if __name__ == '__main__':
    main()

