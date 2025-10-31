#!/usr/bin/env python3
"""
Multi-Interface HID Monitor

Monitors multiple interfaces of the same device simultaneously.
Useful for tablets that split stylus and buttons across interfaces.
"""

import sys
import os
import time
import threading
from typing import Dict, Any, List

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'server'))

try:
    import hid
except ImportError:
    print("Error: hidapi library not found.")
    print("Please install it: pip install hidapi")
    sys.exit(1)


class MultiInterfaceMonitor:
    """Monitor multiple interfaces simultaneously"""
    
    def __init__(self, vendor_id: int, product_id: int):
        self.vendor_id = vendor_id
        self.product_id = product_id
        self.running = False
        self.threads = []
        
    def find_devices(self) -> List[Dict[str, Any]]:
        """Find all interfaces for the device"""
        devices = hid.enumerate(self.vendor_id, self.product_id)
        
        if not devices:
            raise ValueError(f"Device 0x{self.vendor_id:04x}:0x{self.product_id:04x} not found")
        
        return sorted(devices, key=lambda d: d.get('interface_number', 0))
    
    def monitor_interface(self, device_info: Dict[str, Any]):
        """Monitor a specific interface in a thread"""
        interface_num = device_info.get('interface_number', -1)
        
        try:
            device = hid.device()
            if 'path' in device_info and device_info['path']:
                device.open_path(device_info['path'])
            else:
                device.open(device_info['vendor_id'], device_info['product_id'])
            
            device.set_nonblocking(True)
            
            print(f"[Interface {interface_num}] Started")
            
            last_data_hex = None
            repeat_count = 0
            last_report_time = 0
            
            while self.running:
                data = device.read(64)
                if data and len(data) > 0:
                    current_time = time.time()
                    
                    # Throttle to avoid spam (10 updates/sec max per interface)
                    if current_time - last_report_time < 0.1:
                        time.sleep(0.01)
                        continue
                    
                    hex_data = ' '.join(f'{b:02x}' for b in data[:16])
                    
                    # Only display if changed
                    if hex_data != last_data_hex:
                        if repeat_count > 1:
                            print(f"[Interface {interface_num}] ... (x{repeat_count})")
                        
                        self._display_data(data, interface_num)
                        last_data_hex = hex_data
                        repeat_count = 0
                        last_report_time = current_time
                    else:
                        repeat_count += 1
                else:
                    time.sleep(0.001)
            
            device.close()
            print(f"[Interface {interface_num}] Stopped")
            
        except Exception as e:
            print(f"[Interface {interface_num}] Error: {e}")
    
    def _display_data(self, data: List[int], interface: int):
        """Display data with interface label"""
        # Format hex dump
        hex_str = ' '.join(f'{b:02x}' for b in data[:16])
        
        report_id = data[0] if len(data) > 0 else 0
        
        # Try to decode common patterns
        decoded = []
        
        # Coordinates (bytes 2-5)
        if len(data) >= 6:
            x = data[2] + (data[3] << 8)
            y = data[4] + (data[5] << 8)
            if x > 0 or y > 0:
                decoded.append(f"X:{x:5d} Y:{y:5d}")
        
        # Pressure (bytes 6-7)
        if len(data) >= 8:
            pressure = data[6] + (data[7] << 8)
            if pressure > 0:
                decoded.append(f"Prs:{pressure:5d}")
        
        # Tilt (bytes 8-9)
        if len(data) >= 10:
            tilt_x = data[8] if data[8] < 128 else data[8] - 256
            tilt_y = data[9] if data[9] < 128 else data[9] - 256
            if tilt_x != 0 or tilt_y != 0:
                decoded.append(f"Tilt:({tilt_x:+3d},{tilt_y:+3d})")
        
        # Buttons (byte 2 for button interface)
        if report_id == 6 or (len(data) > 2 and data[1] == 0 and data[2] != 0):
            byte2 = data[2] if len(data) > 2 else 0
            if byte2 != 0:
                bits = bin(byte2)[2:].zfill(8)
                pressed = [str(i+1) for i in range(8) if byte2 & (1 << i)]
                decoded.append(f"Btns:[{','.join(pressed)}] ({bits})")
        
        # Build output
        output = f"[I{interface}] RID:{report_id:2d} | {hex_str}"
        if decoded:
            output += f" | {' | '.join(decoded)}"
        
        print(output)
    
    def run(self):
        """Run the multi-interface monitor"""
        print("\n" + "="*80)
        print("   Multi-Interface HID Monitor - Strumboli")
        print("="*80)
        print(f"\nDevice: 0x{self.vendor_id:04x}:0x{self.product_id:04x}")
        
        try:
            devices = self.find_devices()
            print(f"Interfaces found: {len(devices)}\n")
            
            for device in devices:
                interface = device.get('interface_number', -1)
                usage = device.get('usage', 0)
                print(f"  Interface {interface}: Usage 0x{usage:04x}")
            
            print("\nPress Ctrl+C to stop monitoring.")
            print("-" * 80)
            
            self.running = True
            
            # Start a thread for each interface
            for device in devices:
                thread = threading.Thread(
                    target=self.monitor_interface,
                    args=(device,),
                    daemon=True
                )
                thread.start()
                self.threads.append(thread)
            
            # Keep main thread alive
            while self.running:
                time.sleep(0.1)
            
        except KeyboardInterrupt:
            print("\n\nStopping...")
            self.running = False
            
            # Wait for threads to finish
            for thread in self.threads:
                thread.join(timeout=1.0)
            
            print("Stopped.")
            
        except Exception as e:
            print(f"\nError: {e}")
            self.running = False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Monitor multiple interfaces of an HID device simultaneously'
    )
    parser.add_argument('vendor_id', help='Vendor ID (hex, e.g., 0x28bd)')
    parser.add_argument('product_id', help='Product ID (hex, e.g., 0x2904)')
    
    args = parser.parse_args()
    
    # Parse hex values
    try:
        vid = int(args.vendor_id, 16) if args.vendor_id.startswith('0x') else int(args.vendor_id)
        pid = int(args.product_id, 16) if args.product_id.startswith('0x') else int(args.product_id)
    except ValueError:
        print("Error: Invalid vendor or product ID")
        return 1
    
    monitor = MultiInterfaceMonitor(vid, pid)
    monitor.run()


if __name__ == '__main__':
    sys.exit(main() or 0)

