---
layout: page.njk
title: Tablet Buttons
description: Configure your tablet's express keys
---

# Tablet Buttons

Configuration for tablet express keys. Most drawing tablets have 6-8 programmable buttons that can be used for quick chord changes, transposition, or other actions.

## Configuration Options

You can configure tablet buttons in two ways:

### Option 1: Chord Progression Preset

**Type:** `string`  
**Description:** Use a preset chord progression

**Examples:**
```json
{
  "tabletButtons": "c-major-pop"
}
```

Automatically configures all buttons with chords from the progression.

See [Chords & Progressions](/about/chords-and-progressions/) for available presets.

---

### Option 2: Custom Button Configuration

**Type:** `object`  
**Description:** Individually configure each button

**Examples:**
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["transpose", 12],
    "6": ["transpose", -12],
    "7": "toggle-repeater",
    "8": ["set-strum-notes", ["E2"]]
  }
}
```

Button numbers typically range from 1-8 depending on your tablet.

See [Actions Reference](/about/actions-reference/) for all available actions.

## Configuration Examples

### Using Chord Progression Presets

```json
{
  "tabletButtons": "c-major-pop"
}
```

```json
{
  "tabletButtons": "minor-emotional"
}
```

```json
{
  "tabletButtons": "jazz-251"
}
```

### Custom Chord Buttons

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "Am"],
    "3": ["set-strum-chord", "F"],
    "4": ["set-strum-chord", "G"],
    "5": ["set-strum-chord", "Dm"],
    "6": ["set-strum-chord", "Em"]
  }
}
```

### Mixed Actions

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["transpose", 12],
    "6": ["transpose", -12],
    "7": "toggle-repeater",
    "8": "toggle-transpose"
  }
}
```

### Bass Performance

```json
{
  "tabletButtons": {
    "1": ["set-strum-notes", ["E1", "E2"]],
    "2": ["set-strum-notes", ["A1", "A2"]],
    "3": ["set-strum-notes", ["D2", "D3"]],
    "4": ["set-strum-notes", ["G2", "G3"]],
    "5": ["set-strum-notes", ["C2", "C3"]],
    "6": ["set-strum-notes", ["F2", "F3"]],
    "7": ["set-strum-notes", ["B1", "B2"]],
    "8": ["set-strum-notes", ["Bb1", "Bb2"]]
  }
}
```

### Extended Chords

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "Cmaj7", 3],
    "2": ["set-strum-chord", "Fmaj7", 3],
    "3": ["set-strum-chord", "Am7", 3],
    "4": ["set-strum-chord", "G7", 3],
    "5": ["set-strum-chord", "Dm7", 3],
    "6": ["set-strum-chord", "Em7", 3]
  }
}
```

## Common Actions for Tablet Buttons

| Action | Use Case |
|--------|----------|
| `set-strum-chord` | Switch between chords |
| `set-strum-notes` | Set specific notes (for bass, etc.) |
| `transpose` | Shift octaves or keys |
| `toggle-transpose` | Toggle transpose on/off |
| `toggle-repeater` | Toggle note repeater |

## Tips

- **Start with presets**: Chord progression presets are the easiest way to get started
- **Group similar actions**: Keep chord buttons together, utility buttons together
- **Most-used chords first**: Put your most frequently used chords on the easiest-to-reach buttons
- **Octave controls**: Reserve 1-2 buttons for transpose actions to access different octaves

## Related Documentation

- [Chords & Progressions](/about/chords-and-progressions/) - Available chord presets
- [Actions Reference](/about/actions-reference/) - Complete list of available actions
- [Stylus Buttons](/about/stylus-buttons/) - Configure stylus pen buttons
- [Tablet Setup](/about/tablet-setup/) - Initial tablet configuration

