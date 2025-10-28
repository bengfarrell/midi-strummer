---
layout: page.njk
title: Transpose
description: Shift all notes up or down by semitones
---

# Transpose

Pitch transposition settings. Transpose shifts all notes up or down by a specified number of semitones, useful for playing in different keys or octaves.

## Settings

### active

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable transpose on startup

**Examples:**
```json
{
  "transpose": {
    "active": false
  }
}
```

Typically controlled via `transpose` action rather than startup config.

---

### semitones

**Type:** `integer`  
**Default:** `12`  
**Range:** Any integer  
**Description:** Number of semitones to transpose when active

**Examples:**
```json
{
  "transpose": {
    "semitones": 7
  }
}
```

Common values:
- `12` - Up one octave
- `-12` - Down one octave
- `7` - Up a perfect fifth
- `5` - Up a perfect fourth
- `2` - Up a whole step
- `-2` - Down a whole step

## Configuration Example

```json
{
  "transpose": {
    "active": false,
    "semitones": 12
  }
}
```

## Usage Examples

### Octave Up
```json
{
  "transpose": {
    "active": true,
    "semitones": 12
  }
}
```

### Octave Down
```json
{
  "transpose": {
    "active": true,
    "semitones": -12
  }
}
```

### Perfect Fifth
```json
{
  "transpose": {
    "active": true,
    "semitones": 7
  }
}
```

### Minor Third Up
```json
{
  "transpose": {
    "active": true,
    "semitones": 3
  }
}
```

## Common Intervals

| Semitones | Interval Name |
|-----------|---------------|
| 1 | Minor second |
| 2 | Major second |
| 3 | Minor third |
| 4 | Major third |
| 5 | Perfect fourth |
| 6 | Tritone |
| 7 | Perfect fifth |
| 8 | Minor sixth |
| 9 | Major sixth |
| 10 | Minor seventh |
| 11 | Major seventh |
| 12 | Octave |

## Related Documentation

- [Stylus Buttons](/about/stylus-buttons/) - Toggle transpose with stylus buttons
- [Tablet Buttons](/about/tablet-buttons/) - Configure transpose on tablet buttons
- [Actions Reference](/about/actions-reference/) - See `transpose` and `toggle-transpose` actions

