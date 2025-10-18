import sys
from typing import Dict, Optional, Any

import hid

DEBUG = False

def get_tablet_device(filter_values: Dict[str, str]) -> Optional[Any]:
    try:
        devices = hid.enumerate()

        if DEBUG:
            print(f"Found {len(devices)} HID devices")
        
            # Debug: Show all available devices
            print("Available HID devices:")
            for i, device_info in enumerate(devices):
                print(f"  Device {i}:")
                for key, value in device_info.items():
                    if isinstance(value, int):
                        print(f"    {key}: {value} (0x{value:04x})")
                    else:
                        print(f"    {key}: {value}")
            
    except Exception as e:
        print(f'Error enumerating HID devices: {e}')
        return None

    print(f"Looking for device with filters: {filter_values}")
    
    # Filter devices based on the provided criteria
    matching_devices = []
    for i, device_info in enumerate(devices):
        matches = True
        if DEBUG:
            print(f"\nChecking device {i}: {device_info.get('product_string', 'Unknown')}")
        
        for filter_key, filter_value in filter_values.items():
            # Convert filter_key to match HID device info keys
            device_key = filter_key
            if filter_key == 'vendorId':
                device_key = 'vendor_id'
            elif filter_key == 'productId':
                device_key = 'product_id'
            elif filter_key == 'product':
                device_key = 'product_string'
            elif filter_key == 'usage':
                device_key = 'usage'
            elif filter_key == 'interface':
                device_key = 'interface_number'
            # usage and interface are also valid keys in HID device info
            
            if device_key in device_info:
                # Handle both string and integer comparisons
                device_value = device_info[device_key]

                # Handle hex string values (common in settings.json)
                if isinstance(filter_value, str) and filter_value.startswith('0x'):
                    try:
                        filter_int = int(filter_value, 16)
                        if device_value != filter_int:
                            matches = False
                            break
                    except ValueError:
                        matches = False
                        break
                elif isinstance(device_value, int) and isinstance(filter_value, str) and filter_value.isdigit():
                    if device_value != int(filter_value):
                        matches = False
                        break
                elif isinstance(device_value, int) and isinstance(filter_value, int):
                    if device_value != filter_value:
                        matches = False
                        break
                elif str(device_value) != str(filter_value):
                    matches = False
                    break
            else:
                matches = False
                break
        
        if matches:
            matching_devices.append(device_info)

    if not matching_devices:
        print('Could not find matching HID device')
        return None
    
    # Try to open the first matching device
    if matching_devices:
        device_info = matching_devices[0]
        print(f"Attempting to open device: {device_info}")
        
        try:
            device = hid.device()
            
            # Try opening by path first (preferred for exclusive access)
            if 'path' in device_info and device_info['path']:
                print(f"Opening device by path: {device_info['path']}")
                device.open_path(device_info['path'])
                print('Device opened successfully by path')
            else:
                # Fallback to vendor/product ID
                print(f"Opening device by vendor/product ID: 0x{device_info['vendor_id']:04x}/0x{device_info['product_id']:04x}")
                device.open(device_info['vendor_id'], device_info['product_id'])
                print('Device opened successfully by vendor/product ID')
            
            # Test if device is working by trying to get manufacturer string
            try:
                manufacturer = device.get_manufacturer_string()
                product = device.get_product_string()
                print(f"Device info - Manufacturer: {manufacturer}, Product: {product}")
            except:
                print("Could not get device strings (this might be normal)")
            
            # Try to ensure we have exclusive access
            try:
                # Some HID libraries support setting exclusive access
                if hasattr(device, 'set_exclusive'):
                    device.set_exclusive(True)
                    print("Set device to exclusive mode")
            except:
                print("Could not set exclusive mode (might not be supported)")
            
            return device
            
        except Exception as e:
            print(f'Error opening device: {e}')
            print(f'Device info was: {device_info}')
            return None
    
    return None

