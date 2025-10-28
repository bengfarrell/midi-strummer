---
layout: page.njk
title: Chords & Progressions
description: Complete guide to the chord system in Strumboli
---

# Chords & Progressions

Strumboli includes a comprehensive chord system with built-in progressions and flexible chord notation. This guide covers everything from basic chord types to creating custom progressions.

## Chord Notation

### Supported Chord Types

#### Triads (3-note chords)

| Notation | Name | Intervals | Example | Notes (Octave 4) |
|----------|------|-----------|---------|------------------|
| `maj` or _(none)_ | Major | 0, 4, 7 | `C` or `Cmaj` | C4, E4, G4 |
| `m` or `min` | Minor | 0, 3, 7 | `Cm` or `Cmin` | C4, Eb4, G4 |
| `dim` | Diminished | 0, 3, 6 | `Cdim` | C4, Eb4, Gb4 |
| `aug` | Augmented | 0, 4, 8 | `Caug` | C4, E4, G#4 |
| `sus2` | Suspended 2nd | 0, 2, 7 | `Csus2` | C4, D4, G4 |
| `sus4` | Suspended 4th | 0, 5, 7 | `Csus4` | C4, F4, G4 |
| `5` | Power chord | 0, 7 | `C5` | C4, G4 |

#### Seventh Chords (4-note chords)

| Notation | Name | Intervals | Example | Notes (Octave 4) |
|----------|------|-----------|---------|------------------|
| `7` | Dominant 7th | 0, 4, 7, 10 | `C7` | C4, E4, G4, Bb4 |
| `maj7` | Major 7th | 0, 4, 7, 11 | `Cmaj7` | C4, E4, G4, B4 |
| `m7` or `min7` | Minor 7th | 0, 3, 7, 10 | `Cm7` | C4, Eb4, G4, Bb4 |
| `dim7` | Diminished 7th | 0, 3, 6, 9 | `Cdim7` | C4, Eb4, Gb4, A4 |
| `aug7` | Augmented 7th | 0, 4, 8, 10 | `Caug7` | C4, E4, G#4, Bb4 |

#### Extended Chords (5+ notes)

| Notation | Name | Intervals | Example | Notes (Octave 4-5) |
|----------|------|-----------|---------|---------------------|
| `9` | Dominant 9th | 0, 4, 7, 10, 14 | `C9` | C4, E4, G4, Bb4, D5 |
| `maj9` | Major 9th | 0, 4, 7, 11, 14 | `Cmaj9` | C4, E4, G4, B4, D5 |
| `m9` or `min9` | Minor 9th | 0, 3, 7, 10, 14 | `Cm9` | C4, Eb4, G4, Bb4, D5 |
| `add9` | Major add 9 | 0, 4, 7, 14 | `Cadd9` | C4, E4, G4, D5 |
| `6` | Major 6th | 0, 4, 7, 9 | `C6` | C4, E4, G4, A4 |
| `m6` or `min6` | Minor 6th | 0, 3, 7, 9 | `Cm6` | C4, Eb4, G4, A4 |

### Root Notes

All 12 chromatic notes are supported:

**Sharp notation:** `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`

**Flat notation:** `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`

Both notations produce identical results (e.g., `C#` = `Db`).

### Octave Range

When using chord notation with actions, you can specify octave 0-9. Default is octave 4 (middle C).

## Using Chords

### In Button Actions

Use `set-strum-chord` action:

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],        // C major, octave 4
    "2": ["set-strum-chord", "Am7", 3],   // A minor 7th, octave 3
    "3": ["set-strum-chord", "G9", 2]     // G dominant 9th, octave 2
  }
}
```

### Examples by Style

**Pop/Rock:**
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"]
  }
}
```

**Jazz:**
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "Cmaj7"],
    "2": ["set-strum-chord", "Dm7"],
    "3": ["set-strum-chord", "G7"],
    "4": ["set-strum-chord", "Cmaj9"]
  }
}
```

**Blues:**
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "E7"],
    "2": ["set-strum-chord", "A7"],
    "3": ["set-strum-chord", "B7"]
  }
}
```

**Rock/Metal Power Chords:**
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "E5", 2],
    "2": ["set-strum-chord", "G5", 2],
    "3": ["set-strum-chord", "A5", 2],
    "4": ["set-strum-chord", "C5", 2]
  }
}
```

## Chord Progression Presets

Chord progressions are pre-configured sets of chords that automatically fill all 8 tablet buttons. They're perfect for playing in a specific key or style.

### How Progressions Work

When you set `tabletButtons` to a progression name:

```json
{
  "tabletButtons": "c-major-pop"
}
```

It expands to individual button actions:

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["set-strum-chord", "C"],    // Wraps back to start
    "6": ["set-strum-chord", "G"],
    "7": ["set-strum-chord", "Am"],
    "8": ["set-strum-chord", "F"]
  }
}
```

**Wrapping:** If a progression has fewer chords than buttons (8), it repeats from the beginning to fill all buttons.

### Major Key Progressions

#### C Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `c-major-basic` | C, F, G, Am | Classic I-IV-V-vi |
| `c-major-pop` | C, G, Am, F | Popular I-V-vi-IV |
| `c-major-jazz` | Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7 | Diatonic 7th chords |

#### G Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `g-major-basic` | G, C, D, Em | Classic I-IV-V-vi |
| `g-major-pop` | G, D, Em, C | Popular I-V-vi-IV |
| `g-major-jazz` | Gmaj7, Am7, Bm7, Cmaj7, D7, Em7, F#m7 | Diatonic 7th chords |

#### D Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `d-major-basic` | D, G, A, Bm | Classic I-IV-V-vi |
| `d-major-pop` | D, A, Bm, G | Popular I-V-vi-IV |
| `d-major-jazz` | Dmaj7, Em7, F#m7, Gmaj7, A7, Bm7, C#m7 | Diatonic 7th chords |

#### A Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `a-major-basic` | A, D, E, F#m | Classic I-IV-V-vi |
| `a-major-pop` | A, E, F#m, D | Popular I-V-vi-IV |

#### E Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `e-major-basic` | E, A, B, C#m | Classic I-IV-V-vi |
| `e-major-pop` | E, B, C#m, A | Popular I-V-vi-IV |

#### F Major

| Preset | Chords | Description |
|--------|--------|-------------|
| `f-major-basic` | F, Bb, C, Dm | Classic I-IV-V-vi |
| `f-major-pop` | F, C, Dm, Bb | Popular I-V-vi-IV |

### Minor Key Progressions

#### A Minor

| Preset | Chords | Description |
|--------|--------|-------------|
| `a-minor-basic` | Am, Dm, Em, F, E | Classic i-iv-v |
| `a-minor-pop` | Am, F, C, G, E | Popular minor progression |
| `a-minor-sad` | Am, Em, F, C, G, Dm, E | Melancholic 7-chord progression |

#### E Minor

| Preset | Chords | Description |
|--------|--------|-------------|
| `e-minor-basic` | Em, Am, Bm, C, B | Classic i-iv-v |
| `e-minor-pop` | Em, C, G, D, B | Popular minor progression |

#### D Minor

| Preset | Chords | Description |
|--------|--------|-------------|
| `d-minor-basic` | Dm, Gm, Am, Bb, A | Classic i-iv-v |
| `d-minor-pop` | Dm, Bb, F, C, A | Popular minor progression |

### Blues Progressions

| Preset | Chords | Description |
|--------|--------|-------------|
| `blues-e` | E7, A7, B7 | 12-bar blues in E |
| `blues-a` | A7, D7, E7 | 12-bar blues in A |
| `blues-g` | G7, C7, D7 | 12-bar blues in G |

### Rock Progressions

| Preset | Chords | Description |
|--------|--------|-------------|
| `rock-classic` | E, A, D, B | Classic rock changes |
| `rock-power` | E5, G5, A5, C5, D5 | Power chord progression |

### Jazz Progressions

| Preset | Chords | Description |
|--------|--------|-------------|
| `jazz-251-c` | Dm7, G7, Cmaj7, Em7, A7 | ii-V-I in C major |
| `jazz-251-f` | Gm7, C7, Fmaj7, Am7, D7 | ii-V-I in F major |

### Gospel Progressions

| Preset | Chords | Description |
|--------|--------|-------------|
| `gospel-c` | C, Am7, Dm7, G7, F | Gospel in C |
| `gospel-g` | G, Em7, Am7, D7, C | Gospel in G |

## Note Spread

When you set a chord, Strumboli automatically adds octaves above and below based on your `strumming` configuration:

```json
{
  "strumming": {
    "initialNotes": ["C4", "E4", "G4"],
    "upperNoteSpread": 3,
    "lowerNoteSpread": 3
  }
}
```

With these settings, setting a C major chord (`C4, E4, G4`) creates:

**Lower spread (3 notes):**
- C3, E3, G3

**Core chord:**
- C4, E4, G4

**Upper spread (3 notes):**
- C5, E5, G5

**Total: 9 notes** to strum through

### Adjusting Note Spread

**Wide spread (more notes):**
```json
{
  "strumming": {
    "upperNoteSpread": 5,
    "lowerNoteSpread": 5
  }
}
```
Creates a fuller, richer sound with more notes.

**Narrow spread (fewer notes):**
```json
{
  "strumming": {
    "upperNoteSpread": 1,
    "lowerNoteSpread": 1
  }
}
```
More focused, easier to control.

**Asymmetric spread:**
```json
{
  "strumming": {
    "upperNoteSpread": 4,
    "lowerNoteSpread": 1
  }
}
```
Emphasizes higher octaves.

**No spread (chord only):**
```json
{
  "strumming": {
    "upperNoteSpread": 0,
    "lowerNoteSpread": 0
  }
}
```
Only the core chord notes.

## Custom Progressions

You can create your own chord progressions by editing `/server/chord_progressions.json`.

### File Structure

```json
{
  "category-name": {
    "progression-name": ["Chord1", "Chord2", "Chord3", ...]
  }
}
```

### Adding a Custom Progression

Open `/server/chord_progressions.json` and add your progression:

```json
{
  "major": {
    "c-major-basic": ["C", "F", "G", "Am"],
    "my-custom-c": ["C", "Em", "F", "G"]
  },
  "custom": {
    "my-favorite": ["Cmaj7", "Fmaj7", "Dm7", "G7", "Am7"],
    "experimental": ["Cmaj9", "Eb7", "Abmaj7", "Dbmaj7"]
  }
}
```

Then use it:

```json
{
  "tabletButtons": "my-custom-c"
}
```

### Progression Best Practices

1. **Length:** Any length works (3-8 chords is typical)
   - Short (3-4): Repeats more often, good for loops
   - Long (5-7): More variety before repeating

2. **Naming:** Use lowercase with hyphens
   - ✅ `my-custom-progression`
   - ❌ `My Custom Progression`

3. **Avoid duplicates:** Don't repeat chords in the same progression
   - The wrap-around feature handles repetition automatically

4. **Categories:** Organize by style or key
   - `major`, `minor`, `blues`, `jazz`, `rock`, `gospel`, `custom`

### Example: Creating a Progression Collection

```json
{
  "my-songs": {
    "verse-a": ["C", "G", "Am", "F"],
    "chorus-a": ["F", "C", "G", "Am"],
    "bridge-a": ["Dm", "G", "C", "Am"],
    "outro-a": ["F", "G", "C"]
  }
}
```

Use in settings:

```json
{
  "tabletButtons": "verse-a"
}
```

Switch progressions by changing settings and restarting, or use buttons with `set-chord-in-progression` to access different progressions dynamically.

## Progression Performance Techniques

### Technique 1: Static Progression (Preset)

Use a preset for a consistent key:

```json
{
  "tabletButtons": "c-major-pop"
}
```

**Best for:**
- Single-key songs
- Practice and learning
- Simple performances

### Technique 2: Dynamic Progression (Increment Actions)

Use buttons to navigate through a progression:

```json
{
  "stylusButtons": {
    "primaryButtonAction": ["increment-chord-in-progression", "c-major-pop"],
    "secondaryButtonAction": ["increment-chord-in-progression", "c-major-pop", -1]
  },
  "tabletButtons": {
    "1": ["set-chord-in-progression", "c-major-pop", 0],  // Reset to C
    "2": "toggle-repeater",
    "3": ["transpose", 12],
    "4": ["transpose", -12]
  }
}
```

**Best for:**
- Sequential chord changes
- Foot pedal control
- Following song structure

### Technique 3: Mixed Chords and Utilities

Combine specific chords with utility actions:

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],
    "2": ["set-strum-chord", "G"],
    "3": ["set-strum-chord", "Am"],
    "4": ["set-strum-chord", "F"],
    "5": ["set-strum-chord", "Dm7"],
    "6": ["transpose", 12],
    "7": ["transpose", -12],
    "8": "toggle-repeater"
  }
}
```

**Best for:**
- Custom song arrangements
- Mixing common chords with special features
- Performance flexibility

### Technique 4: Multiple Progressions

Access different progressions for song sections:

```json
{
  "tabletButtons": {
    "1": ["set-chord-in-progression", "c-major-pop", 0],      // Verse: C
    "2": ["set-chord-in-progression", "c-major-pop", 1],      // Verse: G
    "3": ["set-chord-in-progression", "c-major-pop", 2],      // Verse: Am
    "4": ["set-chord-in-progression", "c-major-pop", 3],      // Verse: F
    "5": ["set-chord-in-progression", "a-minor-sad", 0],      // Bridge: Am
    "6": ["set-chord-in-progression", "a-minor-sad", 1],      // Bridge: Em
    "7": ["increment-chord-in-progression", "c-major-pop"],   // Next
    "8": ["increment-chord-in-progression", "a-minor-sad"]    // Next (bridge)
  }
}
```

**Best for:**
- Complex song structures
- Switching between verse/chorus/bridge
- Multi-section performances

## Common Chord Progressions

Here are some classic progressions you can create:

### Pop/Rock Standards

**I-V-vi-IV** (most popular):
- C major: C, G, Am, F (`c-major-pop`)
- G major: G, D, Em, C (`g-major-pop`)
- D major: D, A, Bm, G (`d-major-pop`)

**I-IV-V** (classic rock):
- C major: C, F, G (`c-major-basic`)
- E major: E, A, B (`e-major-basic`)

### Blues

**12-bar blues** (3-chord):
- E blues: E7, A7, B7 (`blues-e`)
- A blues: A7, D7, E7 (`blues-a`)

### Jazz

**ii-V-I** (foundational):
- C major: Dm7, G7, Cmaj7 (`jazz-251-c`)
- F major: Gm7, C7, Fmaj7 (`jazz-251-f`)

### Minor Keys

**Natural minor** (sad/emotional):
- A minor: Am, F, C, G (`a-minor-pop`)
- E minor: Em, C, G, D (`e-minor-pop`)

## Tips for Working with Chords

### Learning Chord Notation

Start with basic triads:
1. Major: `C`, `G`, `F`, `D`
2. Minor: `Am`, `Em`, `Dm`
3. Then add 7ths: `Cmaj7`, `G7`, `Am7`

### Voicing Considerations

**Lower octaves** (1-3): Bass, foundations
**Middle octaves** (3-5): Chords, melody
**Upper octaves** (5-7): Leads, texture

### Combining with Note Spread

- **Wide spread** (5+ notes): Fuller chords, ambient
- **Narrow spread** (1-2 notes): Focused, clear
- **Asymmetric spread**: Emphasize range

### Performance Tips

1. **Practice progressions** before performing
2. **Mark buttons** with tape/stickers for visual reference
3. **Test octaves** to find the right range for your sound
4. **Combine** with transpose for even more flexibility

## Troubleshooting

### Chord Sounds Wrong

- **Check octave:** Too high or low octaves sound unusual
- **Verify notation:** Ensure spelling is correct (case-sensitive)
- **Check spread:** Very wide spreads can sound muddy

### Progression Not Loading

- **Check name:** Must match exactly (case-sensitive, use hyphens)
- **Verify file:** Ensure `chord_progressions.json` is valid JSON
- **Restart:** Changes to progressions require restarting Strumboli

### Button Not Playing Chord

- **Verify button number:** Must match your tablet (1-8 typically)
- **Check action format:** Ensure proper array format
- **Look at console:** Error messages will indicate the problem

## Next Steps

- **[Actions Reference](/about/actions-reference/)** - Full action documentation
- **[Settings Reference](/about/settings-reference/)** - Complete settings guide
- **[Configuration Overview](/about/configuration-overview/)** - Understanding the config system
- **[Getting Started](/about/getting-started/)** - Installation and setup

## Chord Reference Tables

Quick reference for copying into configurations:

### Major Chords (All Keys)

```
C, D, E, F, G, A, B
C#/Db, D#/Eb, F#/Gb, G#/Ab, A#/Bb
```

### Minor Chords (All Keys)

```
Cm, Dm, Em, Fm, Gm, Am, Bm
C#m/Dbm, D#m/Ebm, F#m/Gbm, G#m/Abm, A#m/Bbm
```

### Common 7th Chords

```
Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5
C7, D7, E7, F7, G7, A7, B7
```

### Power Chords

```
C5, D5, E5, F5, G5, A5, B5
```

