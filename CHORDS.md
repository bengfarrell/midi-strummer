# MIDI Strummer Chord Reference

This document describes chord notation and chord progression presets available in MIDI Strummer.

**Chord progression presets are loaded from `server/chord_progressions.json` - you can customize or add your own progressions by editing this file!**

## Table of Contents

- [Chord Notation](#chord-notation)
- [Chord Progression Presets](#chord-progression-presets)
- [Using Chord Progressions](#using-chord-progressions)
- [Customizing Progressions](#customizing-progressions)

---

## Chord Notation

### Supported Chord Types

#### Triads

| Notation | Name | Intervals | Example | Notes in Example (Octave 4) |
|----------|------|-----------|---------|------------------------------|
| `maj` or _(none)_ | Major | 0, 4, 7 | `C` or `Cmaj` | C4, E4, G4 |
| `m` or `min` | Minor | 0, 3, 7 | `Cm` or `Cmin` | C4, Eb4, G4 |
| `dim` | Diminished | 0, 3, 6 | `Cdim` | C4, Eb4, Gb4 |
| `aug` | Augmented | 0, 4, 8 | `Caug` | C4, E4, G#4 |
| `sus2` | Suspended 2nd | 0, 2, 7 | `Csus2` | C4, D4, G4 |
| `sus4` | Suspended 4th | 0, 5, 7 | `Csus4` | C4, F4, G4 |
| `5` | Power chord | 0, 7 | `C5` | C4, G4 |

#### Seventh Chords

| Notation | Name | Intervals | Example | Notes in Example (Octave 4) |
|----------|------|-----------|---------|------------------------------|
| `7` | Dominant 7th | 0, 4, 7, 10 | `C7` | C4, E4, G4, Bb4 |
| `maj7` | Major 7th | 0, 4, 7, 11 | `Cmaj7` | C4, E4, G4, B4 |
| `m7` or `min7` | Minor 7th | 0, 3, 7, 10 | `Cm7` | C4, Eb4, G4, Bb4 |
| `dim7` | Diminished 7th | 0, 3, 6, 9 | `Cdim7` | C4, Eb4, Gb4, A4 |
| `aug7` | Augmented 7th | 0, 4, 8, 10 | `Caug7` | C4, E4, G#4, Bb4 |

#### Extended Chords

| Notation | Name | Intervals | Example | Notes in Example (Octave 4) |
|----------|------|-----------|---------|------------------------------|
| `9` | Dominant 9th | 0, 4, 7, 10, 14 | `C9` | C4, E4, G4, Bb4, D5 |
| `maj9` | Major 9th | 0, 4, 7, 11, 14 | `Cmaj9` | C4, E4, G4, B4, D5 |
| `m9` or `min9` | Minor 9th | 0, 3, 7, 10, 14 | `Cm9` | C4, Eb4, G4, Bb4, D5 |
| `add9` | Major add 9 | 0, 4, 7, 14 | `Cadd9` | C4, E4, G4, D5 |
| `6` | Major 6th | 0, 4, 7, 9 | `C6` | C4, E4, G4, A4 |
| `m6` or `min6` | Minor 6th | 0, 3, 7, 9 | `Cm6` | C4, Eb4, G4, A4 |

### Root Notes

All 12 chromatic notes are supported in both sharp and flat notation:

**Sharp notation:** `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`

**Flat notation:** `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`

### Octave Range

Octaves can be specified from 0 to 9. Default octave is 4 if not specified when using the `set-strum-chord` action.

---

## Chord Progression Presets

Chord progression presets allow you to quickly configure all 8 tablet buttons with a complete progression. Each preset contains a sequence of unique chords that automatically wrap around to fill all 8 buttons.

**How it works:** If a progression has 4 chords, buttons 1-4 will use those chords, and buttons 5-8 will repeat the pattern (wrapping to the beginning).

### Major Key Progressions

#### C Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `c-major-basic` | C, F, G, Am → (repeats) | Classic I-IV-V progression with vi |
| `c-major-pop` | C, G, Am, F → (repeats) | Popular I-V-vi-IV progression |
| `c-major-jazz` | Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7 → (wraps) | Diatonic 7th chords |

#### G Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `g-major-basic` | G, C, D, Em → (repeats) | Classic I-IV-V progression with vi |
| `g-major-pop` | G, D, Em, C → (repeats) | Popular I-V-vi-IV progression |
| `g-major-jazz` | Gmaj7, Am7, Bm7, Cmaj7, D7, Em7, F#m7 → (wraps) | Diatonic 7th chords |

#### D Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `d-major-basic` | D, G, A, Bm → (repeats) | Classic I-IV-V progression with vi |
| `d-major-pop` | D, A, Bm, G → (repeats) | Popular I-V-vi-IV progression |
| `d-major-jazz` | Dmaj7, Em7, F#m7, Gmaj7, A7, Bm7, C#m7 → (wraps) | Diatonic 7th chords |

#### A Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `a-major-basic` | A, D, E, F#m → (repeats) | Classic I-IV-V progression with vi |
| `a-major-pop` | A, E, F#m, D → (repeats) | Popular I-V-vi-IV progression |

#### E Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `e-major-basic` | E, A, B, C#m → (repeats) | Classic I-IV-V progression with vi |
| `e-major-pop` | E, B, C#m, A → (repeats) | Popular I-V-vi-IV progression |

#### F Major

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `f-major-basic` | F, Bb, C, Dm → (repeats) | Classic I-IV-V progression with vi |
| `f-major-pop` | F, C, Dm, Bb → (repeats) | Popular I-V-vi-IV progression |

### Minor Key Progressions

#### A Minor

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `a-minor-basic` | Am, Dm, Em, F, E → (wraps) | Classic i-iv-v progression |
| `a-minor-pop` | Am, F, C, G, E → (wraps) | Popular minor progression |
| `a-minor-sad` | Am, Em, F, C, G, Dm, E → (wraps) | Melancholic progression |

#### E Minor

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `e-minor-basic` | Em, Am, Bm, C, B → (wraps) | Classic i-iv-v progression |
| `e-minor-pop` | Em, C, G, D, B → (wraps) | Popular minor progression |

#### D Minor

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `d-minor-basic` | Dm, Gm, Am, Bb, A → (wraps) | Classic i-iv-v progression |
| `d-minor-pop` | Dm, Bb, F, C, A → (wraps) | Popular minor progression |

### Blues Progressions

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `blues-e` | E7, A7, B7 → (repeats) | 12-bar blues in E |
| `blues-a` | A7, D7, E7 → (repeats) | 12-bar blues in A |
| `blues-g` | G7, C7, D7 → (repeats) | 12-bar blues in G |

### Rock Progressions

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `rock-classic` | E, A, D, B → (repeats) | Classic rock progression |
| `rock-power` | E5, G5, A5, C5, D5 → (wraps) | Power chord progression |

### Jazz Progressions

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `jazz-251-c` | Dm7, G7, Cmaj7, Em7, A7 → (wraps) | ii-V-I in C major |
| `jazz-251-f` | Gm7, C7, Fmaj7, Am7, D7 → (wraps) | ii-V-I in F major |

### Gospel Progressions

| Preset Name | Chords (wraps to fill 8 buttons) | Description |
|-------------|-----------------------------------|-------------|
| `gospel-c` | C, Am7, Dm7, G7, F → (wraps) | Gospel progression in C |
| `gospel-g` | G, Em7, Am7, D7, C → (wraps) | Gospel progression in G |

---

## Using Chord Progressions

### Method 1: Progression Preset (Simple)

Set `tabletButtons` to a progression preset name to automatically configure all 8 buttons:

```json
{
  "tabletButtons": "c-major-pop"
}
```

This will expand to:
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["set-strum-chord", "C"],
    "6": ["set-strum-chord", "G"],
    "7": ["set-strum-chord", "F"],
    "8": ["set-strum-chord", "G"]
  }
}
```

### Method 2: Custom Button Configuration (Advanced)

Configure each button individually for full control:

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G", 3],
    "3": ["set-strum-notes", ["E2", "B2", "E3"]],
    "4": ["transpose", 12],
    "5": "toggle-repeater",
    "6": ["set-strum-chord", "Fmaj7"],
    "7": ["set-strum-chord", "Am7"],
    "8": ["set-strum-chord", "G7"]
  }
}
```

### Method 3: Mixed Approach

You can also start with a preset and override specific buttons in your code (requires custom modification).

---

## Examples

### Quick Setup for Pop Song in C

```json
{
  "tabletButtons": "c-major-pop"
}
```

### Blues Jam in E

```json
{
  "tabletButtons": "blues-e"
}
```

### Jazz Standard in F

```json
{
  "tabletButtons": "jazz-251-f"
}
```

### Custom Rock Setup

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "E5", 2],
    "2": ["set-strum-chord", "A5", 2],
    "3": ["set-strum-chord", "D5", 2],
    "4": ["set-strum-chord", "G5", 2],
    "5": ["set-strum-chord", "C5", 2],
    "6": ["transpose", 12],
    "7": ["transpose", -12],
    "8": "toggle-repeater"
  }
}
```

---

## Customizing Progressions

### Adding Your Own Progressions

Chord progressions are stored in `server/chord_progressions.json`. You can add your own custom progressions or modify existing ones by editing this file.

**File Structure:**

```json
{
  "category-name": {
    "progression-name": ["Chord1", "Chord2", "Chord3", "Chord4"]
  }
}
```

**Example - Adding a Custom Progression:**

```json
{
  "major": {
    "c-major-basic": ["C", "F", "G", "Am"],
    "my-custom-c": ["C", "Em", "F", "G"]
  },
  "custom": {
    "my-favorite": ["Cmaj7", "Fmaj7", "Dm7", "G7", "Am7"]
  }
}
```

**The chords will automatically wrap to fill all 8 buttons:**
- `my-custom-c` with 4 chords: buttons 1-4 use the progression, 5-8 repeat it
- `my-favorite` with 5 chords: buttons 1-5 use the progression, 6-8 wrap to chords 1-3

Then use it in your `settings.json`:

```json
{
  "tabletButtons": "my-custom-c"
}
```

or

```json
{
  "tabletButtons": "my-favorite"
}
```

### Creating Progressions for Different Genres

**Ambient/Atmospheric:**
```json
"ambient": {
  "ambient-pad": ["Cmaj9", "Fmaj9", "Am9", "Gmaj9", "Dm9", "Em9"]
}
```

**Latin:**
```json
"latin": {
  "bossa-nova": ["Cmaj7", "Dm7", "G7", "Fmaj7", "Fm7", "Em7", "A7"]
}
```

**Metal:**
```json
"metal": {
  "metal-riff": ["E5", "G5", "F#5", "D5", "C5", "B5"]
}
```

### Tips for Creating Progressions

1. **Progressions can be any length** - they will automatically wrap to fill all 8 buttons
   - Short progressions (3-4 chords) are great for repetitive patterns
   - Longer progressions (5-7 chords) provide more variety before repeating
2. **Avoid duplicate chords** - the wrap-around feature handles repetition automatically
3. **Use any valid chord notation** from the [Chord Notation](#chord-notation) section
4. **Categories are for organization** - the category name doesn't affect functionality
5. **Progression names must be unique** across all categories
6. **Use lowercase with hyphens** for consistency (e.g., `"my-custom-progression"`)

---

## Notes

- All progression presets automatically use octave 4 unless otherwise specified in custom configurations
- When using progression presets, you get instant access to complete, musically coherent chord progressions
- You can always switch back to custom button configuration for more flexibility
- Chord progression presets are loaded from `server/chord_progressions.json` at startup
- All chords respect the `lowerNoteSpread` and `upperNoteSpread` settings from the `strumming` configuration
- Changes to `chord_progressions.json` require restarting the application to take effect

