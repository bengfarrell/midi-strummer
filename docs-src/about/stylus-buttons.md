---
layout: page.njk
title: Stylus Buttons
description: Configure your stylus pen buttons
---

# Stylus Buttons

Configuration for stylus pen buttons. Most drawing tablets have one or two buttons on the stylus itself, providing quick access to common actions without interrupting your playing.

## Settings

### active

**Type:** `boolean`  
**Default:** `true`  
**Description:** Enable stylus button handling

**Examples:**
```json
{
  "stylusButtons": {
    "active": true
  }
}
```

Set to `false` to disable stylus button actions.

---

### primaryButtonAction

**Type:** `string`, `array`, or `null`  
**Default:** `"toggle-transpose"`  
**Description:** Action for primary stylus button (typically front button)

**Examples:**

Simple action:
```json
{
  "stylusButtons": {
    "primaryButtonAction": "toggle-repeater"
  }
}
```

Action with parameters:
```json
{
  "stylusButtons": {
    "primaryButtonAction": ["transpose", 12]
  }
}
```

Disabled:
```json
{
  "stylusButtons": {
    "primaryButtonAction": null
  }
}
```

See [Actions Reference](/about/actions-reference/) for all available actions.

---

### secondaryButtonAction

**Type:** `string`, `array`, or `null`  
**Default:** `"toggle-repeater"`  
**Description:** Action for secondary stylus button (typically back button)

**Examples:**

Simple action:
```json
{
  "stylusButtons": {
    "secondaryButtonAction": "toggle-transpose"
  }
}
```

Action with parameters:
```json
{
  "stylusButtons": {
    "secondaryButtonAction": ["transpose", -12]
  }
}
```

Disabled:
```json
{
  "stylusButtons": {
    "secondaryButtonAction": null
  }
}
```

See [Actions Reference](/about/actions-reference/) for all available actions.

## Configuration Example

```json
{
  "stylusButtons": {
    "active": true,
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

## Common Configurations

### Octave Switching
```json
{
  "stylusButtons": {
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": ["transpose", -12]
  }
}
```

### Repeater and Transpose
```json
{
  "stylusButtons": {
    "primaryButtonAction": "toggle-transpose",
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

### Chord Changes
```json
{
  "stylusButtons": {
    "primaryButtonAction": ["set-strum-chord", "G"],
    "secondaryButtonAction": ["set-strum-chord", "Am"]
  }
}
```

## Related Documentation

- [Actions Reference](/about/actions-reference/) - Complete list of available actions
- [Tablet Buttons](/about/tablet-buttons/) - Configure tablet express keys
- [Transpose](/about/transpose/) - Transpose settings
- [Note Repeater](/about/note-repeater/) - Repeater settings

