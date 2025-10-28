"""
PyInstaller runtime hook to ensure local modules can be imported
"""
import sys
import os

# Get the directory where the executable is located
if getattr(sys, 'frozen', False):
    # Running in a bundle
    bundle_dir = sys._MEIPASS
    
    # Add the bundle directory to Python path so local modules can be imported
    if bundle_dir not in sys.path:
        sys.path.insert(0, bundle_dir)

