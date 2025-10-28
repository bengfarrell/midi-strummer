---
layout: page.njk
title: Startup Configuration
description: System-level settings and device connections
---

# Startup Configuration

System-level settings controlling device connection and server startup.

## Settings

### drawingTablet

**Type:** `string` or `object`  
**Default:** Device-specific defaults  
**Description:** Tablet device configuration

**Options:**
- `"auto-detect"` - Automatically find and configure supported tablet
- `"driver_name"` - Load specific driver profile (e.g., `"xp_pen_deco_640"`)
- `{ ... }` - Inline device configuration object

**Examples:**

Auto-detection (recommended):
```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect"
  }
}
```

Specific driver:
```json
{
  "startupConfiguration": {
    "drawingTablet": "xp_pen_deco_640"
  }
}
```

Inline configuration:
```json
{
  "startupConfiguration": {
    "drawingTablet": {
      "product": "My Tablet",
      "usage": 1,
      "interface": 2,
      "byteCodeMappings": { /* ... */ }
    }
  }
}
```

See [Tablet Setup](/about/tablet-setup/) for detailed device configuration.

---

### useSocketServer

**Type:** `boolean`  
**Default:** `true`  
**Description:** Enable WebSocket server for real-time communication with web dashboard

**Examples:**
```json
{
  "startupConfiguration": {
    "useSocketServer": true
  }
}
```

Set to `false` if you don't need the web dashboard or want to reduce system load.

---

### socketServerPort

**Type:** `integer`  
**Default:** `8080`  
**Range:** 1-65535  
**Description:** Port number for WebSocket server

**Examples:**
```json
{
  "startupConfiguration": {
    "socketServerPort": 8080
  }
}
```

Change if port 8080 is already in use.

---

### useWebServer

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable HTTP web server for dashboard UI

**Examples:**
```json
{
  "startupConfiguration": {
    "useWebServer": true
  }
}
```

When enabled, access dashboard at `http://localhost:<webServerPort>`.

---

### webServerPort

**Type:** `integer`  
**Default:** `80`  
**Range:** 1-65535  
**Description:** Port number for HTTP web server

**Examples:**
```json
{
  "startupConfiguration": {
    "webServerPort": 82
  }
}
```

Use a high port (e.g., 3000, 8000, 8080) if you don't have admin privileges.

---

### midiInputId

**Type:** `string` or `null`  
**Default:** `null`  
**Description:** MIDI input device name for receiving keyboard input

**Examples:**
```json
{
  "startupConfiguration": {
    "midiInputId": "Launchkey MK4 25 MIDI Out"
  }
}
```

Set to `null` or omit to not receive MIDI input. When set, Strumboli will listen for MIDI notes to determine which notes to strum.

## Configuration Example

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useSocketServer": true,
    "socketServerPort": 8080,
    "useWebServer": true,
    "webServerPort": 82,
    "midiInputId": null
  }
}
```

## Related Documentation

- [Tablet Setup](/about/tablet-setup/) - Configure your tablet hardware
- [Configuration Overview](/about/configuration-overview/) - Understand the config system

