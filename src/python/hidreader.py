"""
HID Device Reader Module

Handles reading data from HID devices (e.g., graphics tablets)
and processing the raw data according to configuration mappings.
"""

import time
from typing import Dict, Any, Union, Callable, Optional

from datahelpers import parse_code, parse_range_data, parse_wrapped_range_data


class HIDReader:
    """Manages HID device reading and data processing"""
    
    def __init__(self, device, config: Dict[str, Any], data_callback: Callable[[Dict[str, Union[str, int, float]]], None]):
        """
        Initialize HID reader
        
        Args:
            device: HID device object (from hid library)
            config: Configuration dictionary with device mappings
            data_callback: Callback function to handle processed data
        """
        self.device = device
        self.config = config
        self.data_callback = data_callback
        self.is_running = False
        
    def process_device_data(self, data: bytes) -> Dict[str, Union[str, int, float]]:
        """
        Process raw device data according to configuration mappings
        
        Args:
            data: Raw bytes from HID device
            
        Returns:
            Dictionary with processed data values
        """
        # Convert bytes to list of integers
        data_list = list(data)

        result: Dict[str, Union[str, int, float]] = {}
        
        # Process each mapping in the configuration
        for key, mapping in self.config['mappings'].items():
            mapping_type = mapping.get('type')
            byte_index = mapping.get('byteIndex', 0)
            
            if byte_index >= len(data_list):
                continue
                
            if mapping_type == 'range':
                result[key] = parse_range_data(
                    data_list, 
                    byte_index, 
                    mapping.get('min', 0), 
                    mapping.get('max', 0)
                )
            elif mapping_type == 'wrapped-range':
                result[key] = parse_wrapped_range_data(
                    data_list,
                    byte_index,
                    mapping.get('positiveMin', 0),
                    mapping.get('positiveMax', 0),
                    mapping.get('negativeMin', 0),
                    mapping.get('negativeMax', 0)
                )
            elif mapping_type == 'code':
                code_result = parse_code(data_list, byte_index, mapping.get('values', []))
                if isinstance(code_result, dict):
                    result.update(code_result)
                else:
                    result[key] = code_result
        
        return result
    
    def start_reading(self, buffer_size: int = 64, sleep_interval: float = 0.001):
        """
        Start reading from the HID device in a loop
        
        Args:
            buffer_size: Size of read buffer in bytes
            sleep_interval: Sleep time between reads when no data (seconds)
        """
        if not self.device:
            raise ValueError("No device available for reading")
        
        self.is_running = True
        
        # Use non-blocking mode to allow signal handling
        self.device.set_nonblocking(True)
        read_count = 0
        empty_read_count = 0

        print("[HID] Starting device reading loop...")

        while self.is_running:
            try:
                # Read data from device (non-blocking)
                data = self.device.read(buffer_size)
                read_count += 1

                if data:
                    empty_read_count = 0  # Reset empty count
                    # Process the data
                    processed_data = self.process_device_data(bytes(data))
                    
                    # Call the callback with processed data
                    if self.data_callback:
                        self.data_callback(processed_data)
                else:
                    empty_read_count += 1
                    # Small sleep to prevent CPU spinning
                    time.sleep(sleep_interval)

            except OSError as e:
                # Handle device disconnection
                if "read error" in str(e).lower() or "device" in str(e).lower():
                    print(f"[HID] Device disconnected or error: {e}")
                    self.is_running = False
                    break
                print(f"[HID] Error reading from device: {e}")
                time.sleep(0.1)
            except Exception as e:
                print(f"[HID] Unexpected error: {e}")
                time.sleep(0.1)
        
        print("[HID] Device reading loop stopped")
    
    def stop(self):
        """Stop the reading loop"""
        print("[HID] Stopping HID reader...")
        self.is_running = False
    
    def close(self):
        """Close the HID device"""
        if self.device:
            try:
                print("[HID] Closing HID device...")
                # Try to ensure the device is in a good state before closing
                try:
                    self.device.set_nonblocking(False)
                except:
                    pass  # Ignore if this fails
                
                self.device.close()
                print("[HID] HID device closed successfully")
                self.device = None
                
                # Give the OS more time to fully release the device handle
                # This is crucial for HID devices on macOS
                print("[HID] Waiting for OS to release device handle...")
                time.sleep(0.5)
                print("[HID] Device should be released now")
                
            except Exception as e:
                print(f"[HID] Error closing device: {e}")
                self.device = None  # Clear reference even if close failed

