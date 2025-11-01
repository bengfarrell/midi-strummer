# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Strumboli Device Discovery Tool
Builds a standalone command-line application for discovering HID devices
"""

import sys

block_cipher = None

# Collect data files (documentation)
datas = [
    ('README.md', '.'),
    ('QUICK_START.md', '.'),
]

# Hidden imports
hiddenimports = [
    'hid',
    'hidapi',
]

a = Analysis(
    ['discover_device.py'],
    pathex=['.'],
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
    name='strumboli-discover',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Command-line tool
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
    name='strumboli-discover',
)

# macOS: Create .app bundle
if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='Strumboli-Discover.app',
        icon=None,
        bundle_identifier='com.strumboli.discover',
        info_plist={
            'NSPrincipalClass': 'NSApplication',
            'NSHighResolutionCapable': 'True',
            'CFBundleShortVersionString': '1.0.0',
            'CFBundleVersion': '1.0.0',
        },
    )

