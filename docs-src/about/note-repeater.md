---
layout: page.njk
title: Note Repeater
description: Automatic note repetition and tremolo effects
---

# Note Repeater

Automatic note repetition (tremolo) effect. When enabled, notes automatically repeat at a rate influenced by tablet pressure.

## Settings

### active

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable note repeater on startup

**Examples:**
```json
{
  "noteRepeater": {
    "active": true
  }
}
```

Can be toggled at runtime with `toggle-repeater` action.

---

### pressureMultiplier

**Type:** `float`  
**Default:** `1.0`  
**Range:** > 0  
**Description:** How pressure affects repetition rate

**Examples:**
```json
{
  "noteRepeater": {
    "pressureMultiplier": 2.0
  }
}
```

Higher values = more pressure variation in repeat rate.

---

### frequencyMultiplier

**Type:** `float`  
**Default:** `5.0`  
**Range:** > 0  
**Description:** Overall repetition speed multiplier

**Examples:**
```json
{
  "noteRepeater": {
    "frequencyMultiplier": 10.0
  }
}
```

Higher values = faster repetition.

## Configuration Example

```json
{
  "noteRepeater": {
    "active": false,
    "pressureMultiplier": 1.0,
    "frequencyMultiplier": 5.0
  }
}
```

## Usage Examples

### Slow Tremolo
```json
{
  "noteRepeater": {
    "active": true,
    "frequencyMultiplier": 2.0,
    "pressureMultiplier": 1.5
  }
}
```

### Fast Trill
```json
{
  "noteRepeater": {
    "active": true,
    "frequencyMultiplier": 15.0,
    "pressureMultiplier": 0.5
  }
}
```

### Pressure-Responsive
```json
{
  "noteRepeater": {
    "active": true,
    "frequencyMultiplier": 8.0,
    "pressureMultiplier": 3.0
  }
}
```

## Related Documentation

- [Stylus Buttons](/about/stylus-buttons/) - Toggle repeater with stylus buttons
- [Actions Reference](/about/actions-reference/) - See `toggle-repeater` action
- [Strumming](/about/strumming/) - Configure strumming behavior

