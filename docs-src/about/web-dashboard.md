---
layout: page.njk
title: Web Dashboard
description: Enable and configure the web interface and WebSocket server
---

# Web Dashboard

Configure Strumboli's built-in web server and dashboard for real-time monitoring and control.

## Web Server Settings

### useWebServer

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable HTTP web server for dashboard UI

When enabled, Strumboli starts an HTTP server that hosts the web dashboard interface.

**Examples:**
```json
{
  "startupConfiguration": {
    "useWebServer": true
  }
}
```

**Access the dashboard:**
- Local: `http://localhost:<webServerPort>`
- Network: `http://<your-ip>:<webServerPort>`

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

**Port recommendations:**
- **80** - Standard HTTP (requires admin/sudo)
- **3000** - Common dev port
- **8000** - Alternative standard
- **8080** - Common HTTP alternative
- **82** - Our default (accessible without admin)

**Note:** Ports below 1024 typically require administrator/root privileges.

---

## WebSocket Server Settings

The WebSocket server enables real-time bidirectional communication between Strumboli and the web dashboard (or custom applications).

### useSocketServer

**Type:** `boolean`  
**Default:** `true`  
**Description:** Enable WebSocket server for real-time communication

**Examples:**
```json
{
  "startupConfiguration": {
    "useSocketServer": true
  }
}
```

Set to `false` if you don't need the web dashboard or real-time monitoring.

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

Change if port 8080 is already in use by another application.

---

## Configuration Examples

### Minimal Dashboard Setup
```json
{
  "startupConfiguration": {
    "useWebServer": true,
    "webServerPort": 82
  }
}
```

### Complete Dashboard Configuration
```json
{
  "startupConfiguration": {
    "useSocketServer": true,
    "socketServerPort": 8080,
    "useWebServer": true,
    "webServerPort": 82
  }
}
```

### Dashboard Disabled
```json
{
  "startupConfiguration": {
    "useWebServer": false,
    "useSocketServer": false
  }
}
```

### Custom Ports
```json
{
  "startupConfiguration": {
    "useWebServer": true,
    "webServerPort": 3000,
    "useSocketServer": true,
    "socketServerPort": 3001
  }
}
```

---

## What's in the Dashboard?

### Real-Time Monitoring
- **Tablet Input**: Live visualization of X/Y position, pressure, and tilt
- **Current Notes**: Display of active chord and individual notes
- **MIDI Output**: Real-time MIDI message stream
- **Performance Metrics**: Latency, event rates

### Configuration Display
- Active settings overview
- Feature status (repeater, transpose, etc.)
- Tablet button mappings
- Current chord progression

### Visual Feedback
- Pressure gradient visualization
- Position tracking
- Tilt angle indicators
- Note velocity bars

---

## Network Access

### Local Machine Only
```
http://localhost:82
```

### Same Network (LAN)
Find your local IP address:
- **macOS/Linux**: `ifconfig` or `ip addr`
- **Windows**: `ipconfig`

Then access from another device:
```
http://192.168.1.xxx:82
```

### Firewall Configuration

You may need to allow incoming connections:
- **macOS**: System Preferences → Security & Privacy → Firewall
- **Windows**: Windows Defender Firewall → Allow an app
- **Linux**: `ufw allow 82/tcp` or `firewall-cmd --add-port=82/tcp`

---

## WebSocket Protocol

The WebSocket server uses JSON messages for communication.

### Message Types (Server → Client)
- `tablet_input` - Raw tablet data
- `midi_event` - MIDI output events
- `state_change` - Configuration changes
- `chord_change` - Chord/note updates

### Example Message
```json
{
  "type": "tablet_input",
  "timestamp": 1234567890,
  "data": {
    "x": 0.5,
    "y": 0.7,
    "pressure": 0.8,
    "tiltX": 0.1,
    "tiltY": -0.2
  }
}
```

---

## Troubleshooting

### Can't Access Dashboard

1. Verify web server is enabled
2. Check correct port in URL
3. Test localhost first: `http://localhost:82`
4. Check firewall settings
5. Verify Strumboli is running

### Port Already in Use

Change to different port:
```json
{
  "webServerPort": 3000,
  "socketServerPort": 3001
}
```

### WebSocket Connection Failed

1. Verify `useSocketServer` is `true`
2. Check `socketServerPort` matches client configuration
3. Ensure firewall allows WebSocket connections
4. Check browser console for errors

### Slow/Laggy Dashboard

1. Close other bandwidth-intensive applications
2. Reduce visualization complexity
3. Check network connection quality
4. Consider local-only access

---

## Related Documentation

- [Server & Startup](/about/server-startup/) - Overview of server features
- [Getting Started](/about/getting-started/) - Initial setup
- [Configuration Overview](/about/configuration-overview/) - Config system basics

