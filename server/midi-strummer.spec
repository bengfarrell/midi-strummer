# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for MIDI Strummer
Builds a standalone application bundle
"""

import sys
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Collect all data files and hidden imports
datas = [
    ('../settings.json', '.'),  # Include settings.json in the bundle
]

# Hidden imports that PyInstaller might miss
hiddenimports = [
    'rtmidi',
    'rtmidi._rtmidi',
    'websockets',
    'websockets.legacy',
    'websockets.legacy.server',
    'hid',
    'hidapi',
]

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='MIDI-Strummer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Set to False for GUI mode (no terminal window)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='MIDI-Strummer',
)

# macOS: Create .app bundle
if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='MIDI-Strummer.app',
        icon=None,  # Add 'icon.icns' here if you create an icon
        bundle_identifier='com.midistrummer.app',
        info_plist={
            'NSPrincipalClass': 'NSApplication',
            'NSHighResolutionCapable': 'True',
            'CFBundleShortVersionString': '1.0.0',
            'CFBundleVersion': '1.0.0',
        },
    )

