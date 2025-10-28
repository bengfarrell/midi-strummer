---
layout: page.njk
title: Server & Startup
description: Understanding Strumboli's server features and startup options
---

# Server & Startup

Strumboli includes several powerful server features that enhance your workflow and provide real-time monitoring and control capabilities.

## What Can Strumboli's Servers Do?

### Web Dashboard Server

The built-in web dashboard provides a visual interface for monitoring and controlling Strumboli in real-time. Access it through any web browser on your local network.

**Features:**
- Real-time visualization of tablet input (pressure, position, tilt)
- Current chord and note display
- MIDI output monitoring
- Configuration status
- Performance metrics

**Perfect for:**
- Debugging tablet behavior
- Live performance monitoring
- Teaching and demonstrations
- Verifying MIDI output

---

### WebSocket Server

The WebSocket server enables real-time bidirectional communication between Strumboli and external applications, including the web dashboard.

**Features:**
- Low-latency event streaming
- Two-way communication
- JSON-based message protocol
- Multiple client support

**Perfect for:**
- Custom integrations
- Third-party control surfaces
- Visual feedback systems
- Remote monitoring

---

### Device Auto-Detection

Strumboli can automatically detect and configure compatible drawing tablets, making setup effortless.

**Features:**
- Automatic HID device scanning
- Driver profile matching
- Plug-and-play operation
- Manual override options

---

### MIDI Input Integration

Strumboli can receive MIDI input from keyboards or controllers to determine which notes to strum, combining tablet expression with keyboard note selection.

**Features:**
- MIDI keyboard input
- Note-based chord triggering
- Velocity passthrough
- Multiple input device support

---

## Configuration Sections

Explore each area of startup configuration:

- **[Device Configuration](/about/device-configuration/)** - Configure your drawing tablet
- **[Web Dashboard](/about/web-dashboard/)** - Enable and configure the web interface
- **[MIDI Input](/about/midi-input/)** - Connect MIDI keyboards and controllers

## Quick Start Example

Here's a minimal startup configuration:

```json
{
  "startupConfiguration": {
    "drawingTablet": "auto-detect",
    "useWebServer": true,
    "webServerPort": 82
  }
}
```

This enables auto-detection of your tablet and starts the web dashboard on port 82.

## Related Documentation

- [Getting Started](/about/getting-started/) - Initial setup guide
- [Configuration Overview](/about/configuration-overview/) - Understanding the config system
- [Tablet Setup](/about/tablet-setup/) - Detailed tablet configuration

