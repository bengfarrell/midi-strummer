---
layout: page.njk
title: Web Dashboard
description: Using the web interface for real-time monitoring and control
---

# Web Dashboard

Strumboli includes a built-in web dashboard that provides real-time visualization of tablet input, MIDI output, and configuration status. The dashboard is perfect for debugging, performance monitoring, and visual feedback during sessions.

## Quick Start

### Enable the Dashboard

Add to your `settings.json`:

```json
{
  "startupConfiguration": {
    "useWebServer": true,
    "webServerPort": 82,
    "useSocketServer": true,
    "socketServerPort": 8080
  }
}
```

### Start Strumboli

```bash
python server/main.py
```

You should see:
```
[WebSocket Server] Starting on port 8080...
[Web Server] Starting on port 82...
```

### Access the Dashboard

Open your browser to:
```
http://localhost:82
```

## Dashboard Overview

![Dashboard overview showing all panels and real-time data](placeholder-dashboard-overview.png)

*Placeholder: Full dashboard view with labeled sections*

The dashboard is organized into several key areas:

1. **Connection Status** - Server connectivity indicator
2. **Tablet Input Panel** - Real-time stylus position, pressure, and tilt
3. **Current Notes Panel** - Active chord and note display
4. **MIDI Output Panel** - Live MIDI message stream
5. **Configuration Panel** - Active settings overview
6. **Performance Metrics** - Latency and event rates

---

## Tablet Input Visualization

### Position Display

![Tablet position grid showing stylus location](placeholder-tablet-position.png)

*Placeholder: X/Y position grid with current stylus location marked*

**Shows:**
- X/Y coordinates (normalized 0.0-1.0)
- Visual marker at current position
- Pressure-based marker size
- Movement trails (optional)

### Pressure Meter

![Vertical pressure meter with gradient](placeholder-pressure-meter.png)

*Placeholder: Vertical bar showing pressure level with gradient from light to dark*

**Features:**
- Real-time pressure reading (0-100%)
- Color-coded gradient (light=low, dark=high)
- Numerical value display
- Pressure curve visualization

### Tilt Indicators

![Dual axis tilt display showing X and Y tilt angles](placeholder-tilt-display.png)

*Placeholder: Two circular indicators showing tilt X and Y with angle markers*

**Displays:**
- Tilt X (left/right) angle
- Tilt Y (forward/back) angle
- Combined tilt magnitude
- Visual angle indicators

### Status Indicators

**Stylus State:**
- 🔴 **Away** - Stylus not detected
- 🟡 **Hover** - Stylus hovering above tablet
- 🟢 **Contact** - Stylus touching surface

**Button States:**
- Primary button pressed indicator
- Secondary button pressed indicator
- Tablet button press indicators (1-8)

---

## Current Notes Panel

![Notes panel showing active chord and spread](placeholder-notes-panel.png)

*Placeholder: Piano roll or note list showing currently active notes*

### Chord Display

**Shows:**
- Current chord name (e.g., "C Major", "Dm7")
- Root note and quality
- Number of notes in spread
- MIDI channel

### Note List

**Interactive list of strummable notes:**
```
Lower Spread:
  C1, E1, G1
  C2, E2, G2
  C3, E3, G3

Initial Chord:
  ► C4, E4, G4 ◄

Upper Spread:
  C5, E5, G5
  C6, E6, G6
  C7, E7, G7
```

### Active Note Highlighting

Notes currently playing are highlighted in real-time:
- **Green** - Note on
- **Gray** - Note off
- **Yellow** - Note sustaining

---

## MIDI Output Stream

![MIDI message stream with color-coded events](placeholder-midi-stream.png)

*Placeholder: Scrolling list of MIDI messages with timestamps*

### Message Display

Real-time stream of MIDI events:

```
[14:32:15.432] Note On  | Ch 1 | C4  | Vel 96
[14:32:15.445] Note On  | Ch 1 | E4  | Vel 98
[14:32:15.458] Note On  | Ch 1 | G4  | Vel 101
[14:32:15.680] Note Off | Ch 1 | C4  | Vel 0
[14:32:15.695] Pitch Bend | Ch 1 | +245
```

**Message Types:**
- **Note On** - Green
- **Note Off** - Red
- **Pitch Bend** - Blue
- **Control Change** - Orange
- **Program Change** - Purple

### Message Filtering

Toggle message types:
- ☑ Note On/Off
- ☑ Pitch Bend
- ☐ Control Change
- ☐ System Messages

### Message Rate

**Performance metrics:**
- Messages/second
- Average latency
- Peak message rate
- Dropped message count

---

## Configuration Panel

![Configuration overview panel](placeholder-config-panel.png)

*Placeholder: Organized display of active configuration settings*

### Active Settings Display

**Strumming:**
- MIDI Channel: 1
- Note Spread: 3 ↑ / 3 ↓
- Pressure Threshold: 0.1

**Expression:**
- Velocity: Pressure (curve 4.0)
- Duration: Y-Axis (central)
- Pitch Bend: Tilt XY (curve 4.0)

**Effects:**
- Note Repeater: Off
- Transpose: +0 semitones
- Strum Release: Off

### Feature Toggles

**Interactive controls** (if enabled):
- [ ] Note Repeater
- [ ] Strum Release
- Transpose: [−12] [−1] [+1] [+12]

### Tablet Button Mappings

**Quick reference:**
```
Button 1: C Major
Button 2: Am
Button 3: F Major
Button 4: G Major
Button 5: Transpose +12
Button 6: Transpose -12
Button 7: Toggle Repeater
Button 8: Bass Note (E2)
```

---

## Performance Metrics

### Latency Graph

![Real-time latency graph](placeholder-latency-graph.png)

*Placeholder: Line graph showing latency over time*

**Tracks:**
- **Tablet Input Latency** - Time from stylus event to processing
- **MIDI Output Latency** - Time from processing to MIDI out
- **Total Latency** - End-to-end timing

**Targets:**
- < 10ms: Excellent
- 10-20ms: Good
- 20-50ms: Acceptable
- > 50ms: Check system load

### Event Rate

**Current rates:**
- Tablet events/sec: ~120 Hz
- MIDI events/sec: Variable
- WebSocket updates/sec: 60 Hz

### System Status

- CPU usage
- Memory usage
- Active connections
- Uptime

---

## Network Access

### Local Access

**Same machine:**
```
http://localhost:82
```

### LAN Access

**Other devices on your network:**

1. **Find your local IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Access from other device:**
   ```
   http://192.168.1.XXX:82
   ```

**Use cases:**
- Monitor from tablet/phone while performing
- Remote debugging
- Multi-screen setup
- Audience display during performances

### Firewall Configuration

**macOS:**
```
System Preferences → Security & Privacy → Firewall
→ Firewall Options → Add Strumboli/Python
```

**Linux:**
```bash
sudo ufw allow 82/tcp
sudo ufw allow 8080/tcp
```

**Windows:**
```
Windows Defender Firewall
→ Allow an app
→ Add Python/Strumboli
```

---

## WebSocket Protocol

The dashboard uses WebSocket for real-time bidirectional communication.

### Connection

**Client connects to:**
```javascript
ws://localhost:8080
```

### Message Format

All messages are JSON:

```json
{
  "type": "tablet_input",
  "timestamp": 1234567890123,
  "data": { }
}
```

### Message Types (Server → Client)

#### tablet_input

Raw tablet input data:
```json
{
  "type": "tablet_input",
  "timestamp": 1234567890123,
  "data": {
    "x": 0.523,
    "y": 0.748,
    "pressure": 0.814,
    "tiltX": 0.152,
    "tiltY": -0.203,
    "state": "contact",
    "primaryButton": false,
    "secondaryButton": false
  }
}
```

#### midi_event

MIDI output events:
```json
{
  "type": "midi_event",
  "timestamp": 1234567890123,
  "data": {
    "eventType": "note_on",
    "channel": 1,
    "note": 60,
    "velocity": 96
  }
}
```

#### chord_change

Chord/note updates:
```json
{
  "type": "chord_change",
  "timestamp": 1234567890123,
  "data": {
    "chordName": "C Major",
    "notes": ["C4", "E4", "G4"],
    "allNotes": ["C1", "E1", "G1", "..."]
  }
}
```

#### state_change

Configuration changes:
```json
{
  "type": "state_change",
  "timestamp": 1234567890123,
  "data": {
    "repeaterActive": true,
    "transpose": 12
  }
}
```

#### connection_status

Server status:
```json
{
  "type": "connection_status",
  "timestamp": 1234567890123,
  "data": {
    "connected": true,
    "deviceName": "XP-Pen Deco 640",
    "midiOutput": "IAC Driver Bus 1"
  }
}
```

---

## Custom Dashboard Development

### Basic HTML Client

```html
<!DOCTYPE html>
<html>
<head>
  <title>Strumboli Monitor</title>
</head>
<body>
  <h1>Tablet Input</h1>
  <div id="data"></div>
  
  <script>
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'tablet_input') {
        document.getElementById('data').innerHTML = 
          `X: ${message.data.x.toFixed(3)}<br>
           Y: ${message.data.y.toFixed(3)}<br>
           Pressure: ${message.data.pressure.toFixed(3)}`;
      }
    };
    
    ws.onopen = () => console.log('Connected');
    ws.onerror = (err) => console.error('Error:', err);
  </script>
</body>
</html>
```

### Integration with DAW

Use the WebSocket API to integrate Strumboli data into your DAW or custom applications:

- **Visualizers** - Create custom visualizations
- **Recording** - Log tablet input for analysis
- **Control surfaces** - Build custom control interfaces
- **Performance tools** - Create performer-specific displays

---

## Configuration Settings

### Enable/Disable Components

**Minimal (no dashboard):**
```json
{
  "startupConfiguration": {
    "useWebServer": false,
    "useSocketServer": false
  }
}
```

**WebSocket only (custom client):**
```json
{
  "startupConfiguration": {
    "useWebServer": false,
    "useSocketServer": true,
    "socketServerPort": 8080
  }
}
```

**Complete dashboard:**
```json
{
  "startupConfiguration": {
    "useWebServer": true,
    "webServerPort": 82,
    "useSocketServer": true,
    "socketServerPort": 8080
  }
}
```

### Custom Ports

**Avoid conflicts:**
```json
{
  "startupConfiguration": {
    "webServerPort": 3000,
    "socketServerPort": 3001
  }
}
```

**Common alternatives:**
- 3000/3001 - Node.js convention
- 8000/8001 - Python convention
- 8080/8081 - Tomcat convention
- 5000/5001 - Flask convention

---

## Troubleshooting

### Cannot Access Dashboard

**Check server is running:**
```bash
# Look for these lines in console:
[WebSocket Server] Starting on port 8080...
[Web Server] Starting on port 82...
```

**Verify settings:**
```json
{
  "startupConfiguration": {
    "useWebServer": true
  }
}
```

**Try localhost first:**
```
http://localhost:82
```

**Check firewall** (see Firewall Configuration above)

---

### Port Already in Use

**Error message:**
```
[Web Server] Error: Port 82 already in use
```

**Solution - Change port:**
```json
{
  "startupConfiguration": {
    "webServerPort": 3000
  }
}
```

**Or kill process using port:**
```bash
# Find process
lsof -i :82

# Kill it
kill -9 <PID>
```

---

### WebSocket Connection Failed

**Browser console shows:**
```
WebSocket connection to 'ws://localhost:8080' failed
```

**Verify WebSocket server:**
```json
{
  "startupConfiguration": {
    "useSocketServer": true
  }
}
```

**Check port matches:**
```javascript
// In dashboard JavaScript
const ws = new WebSocket('ws://localhost:8080');
```

**Check CORS (if remote):**
WebSocket server allows all origins by default.

---

### Slow/Laggy Dashboard

**Reduce update frequency** in dashboard code

**Close other applications** using bandwidth

**Check network quality** if accessing remotely

**Use local access** instead of network access

**Disable heavy visualizations** (trails, graphs)

---

### Dashboard Shows Stale Data

**Refresh the browser** (Ctrl+R / Cmd+R)

**Check WebSocket connection** in browser console

**Restart Strumboli server**

**Clear browser cache**

---

## Performance Tips

### Optimal Settings

**For local monitoring:**
- Use localhost (fastest)
- Enable all visualizations
- 60 Hz update rate

**For remote monitoring:**
- Reduce update frequency to 30 Hz
- Disable heavy animations
- Use wired network if possible

**For performance:**
- Disable dashboard during recording
- Use WebSocket only if custom client needed
- Close dashboard tab when not in use

### Resource Usage

**Typical overhead:**
- Web Server: ~5 MB RAM, <1% CPU
- WebSocket: ~10 MB RAM, 1-2% CPU
- Dashboard (browser): ~50-100 MB RAM, 5-10% CPU

**Negligible impact** on MIDI latency when properly configured.

---

## Advanced Features

### Message Recording

**Log all MIDI events:**
```javascript
const messages = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'midi_event') {
    messages.push(msg);
  }
};

// Export to JSON
function exportLog() {
  const json = JSON.stringify(messages, null, 2);
  // Download or save
}
```

### Performance Analysis

**Track and analyze latency:**
```javascript
const latencies = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const now = Date.now();
  const latency = now - msg.timestamp;
  latencies.push(latency);
  
  // Calculate statistics
  const avg = latencies.reduce((a, b) => a + b) / latencies.length;
  console.log(`Avg latency: ${avg.toFixed(2)}ms`);
};
```

### Custom Visualizations

Integrate with visualization libraries:
- **D3.js** - Complex data visualizations
- **Three.js** - 3D graphics
- **P5.js** - Creative coding
- **Chart.js** - Charts and graphs

---

## Dashboard Customization

The dashboard is built with:
- HTML/CSS/JavaScript
- Lit web components
- WebSocket API

Source code: `server/public/` directory

Feel free to customize or create your own dashboard to fit your workflow!

