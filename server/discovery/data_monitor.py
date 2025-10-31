#!/usr/bin/env python3
"""
HID Data Monitor

Real-time monitoring of HID device data to understand byte layouts and mappings.
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


class DataMonitor:
    """Monitor and display HID device data"""
    
    def __init__(self, vendor_id: int, product_id: int, interface: int = None):
        self.vendor_id = vendor_id
        self.product_id = product_id
        self.target_interface = interface
        self.running = False
        self.last_data = {}
        
    def find_device(self) -> Dict[str, Any]:
        """Find the device and interface"""
        devices = hid.enumerate(self.vendor_id, self.product_id)
        
        if not devices:
            raise ValueError(f"Device 0x{self.vendor_id:04x}:0x{self.product_id:04x} not found")
        
        # If specific interface requested, use it
        if self.target_interface is not None:
            for device in devices:
                if device.get('interface_number') == self.target_interface:
                    return device
            raise ValueError(f"Interface {self.target_interface} not found")
        
        # Otherwise use first available
        return devices[0]
    
    def monitor_interface(self, device_info: Dict[str, Any]):
        """Monitor a specific interface"""
        interface_num = device_info.get('interface_number', -1)
        
        try:
            device = hid.device()
            if 'path' in device_info and device_info['path']:
                device.open_path(device_info['path'])
            else:
                device.open(device_info['vendor_id'], device_info['product_id'])
            
            device.set_nonblocking(True)
            
            print(f"\n[Interface {interface_num}] Monitoring started...")
            print("Move stylus, press buttons, etc. to see data.\n")
            
            last_displayed = None
            same_count = 0
            
            while self.running:
                data = device.read(64)
                if data and len(data) > 0:
                    # Convert to hex string for comparison
                    hex_data = ' '.join(f'{b:02x}' for b in data[:16])
                    
                    # Only display if changed
                    if hex_data != last_displayed:
                        if same_count > 0:
                            print(f"  (repeated {same_count} times)")
                            same_count = 0
                        
                        self._display_data(data, interface_num)
                        last_displayed = hex_data
                    else:
                        same_count += 1
                else:
                    time.sleep(0.001)
            
            device.close()
            
        except Exception as e:
            print(f"[Interface {interface_num}] Error: {e}")
    
    def _display_data(self, data: List[int], interface: int):
        """Display data in a readable format"""
        # First 16 bytes in hex
        hex_str = ' '.join(f'{b:02x}' for b in data[:16])
        
        # Decode some common patterns
        report_id = data[0] if len(data) > 0 else 0
        byte1 = data[1] if len(data) > 1 else 0
        byte2 = data[2] if len(data) > 2 else 0
        
        # Try to detect coordinate data (16-bit little-endian)
        coords = []
        if len(data) >= 6:
            x = data[2] + (data[3] << 8)
            y = data[4] + (data[5] << 8)
            coords.append(f"X:{x:5d} Y:{y:5d}")
        
        # Try to detect pressure (16-bit)
        if len(data) >= 8:
            pressure = data[6] + (data[7] << 8)
            coords.append(f"P:{pressure:5d}")
        
        # Build output
        output = f"[I{interface}] ReportID:{report_id:3d} | {hex_str}"
        if coords:
            output += f" | {' '.join(coords)}"
        
        # Highlight if byte2 has bits set (might be buttons)
        if byte2 != 0:
            output += f" | Byte2:0x{byte2:02x} (bits: {bin(byte2)[2:].zfill(8)})"
        
        print(output)
    
    def run(self):
        """Run the monitor"""
        print("\n" + "="*70)
        print("   HID Data Monitor - Strumboli")
        print("="*70)
        print(f"\nDevice: 0x{self.vendor_id:04x}:0x{self.product_id:04x}")
        
        try:
            device_info = self.find_device()
            interface = device_info.get('interface_number', -1)
            print(f"Interface: {interface}")
            print(f"Product: {device_info.get('product_string', 'Unknown')}")
            print("\nPress Ctrl+C to stop monitoring.")
            print("-" * 70)
            
            self.running = True
            self.monitor_interface(device_info)
            
        except KeyboardInterrupt:
            print("\n\nStopped.")
            self.running = False
        except Exception as e:
            print(f"\nError: {e}")
            self.running = False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Monitor HID device data')
    parser.add_argument('vendor_id', help='Vendor ID (hex, e.g., 0x28bd)')
    parser.add_argument('product_id', help='Product ID (hex, e.g., 0x2904)')
    parser.add_argument('-i', '--interface', type=int, help='Interface number (optional)')
    
    args = parser.parse_args()
    
    # Parse hex values
    try:
        vid = int(args.vendor_id, 16) if args.vendor_id.startswith('0x') else int(args.vendor_id)
        pid = int(args.product_id, 16) if args.product_id.startswith('0x') else int(args.product_id)
    except ValueError:
        print("Error: Invalid vendor or product ID")
        return 1
    
    monitor = DataMonitor(vid, pid, args.interface)
    monitor.run()


if __name__ == '__main__':
    sys.exit(main() or 0)

