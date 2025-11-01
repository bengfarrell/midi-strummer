---
layout: page.njk
title: Actions Reference
description: Complete guide to button actions in Strumboli
---

# Actions Reference

Actions define what happens when you press stylus buttons or tablet express keys. This complete reference covers all available actions and how to use them.

## Action Format

Actions can be specified in three formats:

### Simple String

For actions without parameters:

```json
"toggle-repeater"
```

### Array with Parameters

For actions that need configuration:

```json
["transpose", 12]
```

The first element is the action name, remaining elements are parameters.

### Nested Arrays

For actions with complex parameters like note lists:

```json
["set-strum-notes", ["C4", "E4", "G4"]]
```

## Button Configuration

### Stylus Buttons

Configure the two buttons on your stylus:

```json
{
  "stylusButtons": {
    "active": true,
    "primaryButtonAction": ["transpose", 12],
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

- **`active`**: Enable/disable stylus button handling
- **`primaryButtonAction`**: Action for the front button (typically)
- **`secondaryButtonAction`**: Action for the back button (typically)

### Tablet Buttons

Configure express keys on your tablet (typically 6-8 buttons):

#### Method 1: Chord Progression Preset

Use a preset to automatically configure all buttons:

```json
{
  "tabletButtons": "c-major-pop"
}
```

See [Chords & Progressions](/about/chords-and-progressions/) for available presets.

#### Method 2: Custom Configuration

Configure each button individually:

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

Button numbers start at 1 and typically go up to 6 or 8 depending on your tablet.

## Available Actions

### 1. toggle-repeater

Toggles the note repeater effect on/off.

**Format:**
```json
"toggle-repeater"
```

**Parameters:** None

**Description:**  
The note repeater automatically retriggers notes while you hold pressure on the tablet, creating tremolo or rhythmic effects. The repetition rate is controlled by pressure.

**Example:**
```json
{
  "stylusButtons": {
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

**Related Settings:**
```json
{
  "noteRepeater": {
    "active": false,
    "pressureMultiplier": 1.0,
    "frequencyMultiplier": 5.0
  }
}
```

**Use Cases:**
- Tremolo effects on sustained notes
- Rhythmic patterns
- Mandolin-style playing
- Drum rolls

---

### 2. transpose

Toggles transpose on/off with specified semitones. Pressing again with the same value turns it off.

**Format:**
```json
["transpose", semitones]
```

**Parameters:**
- **`semitones`** (integer, required): Number of semitones to shift
  - Positive values: transpose up (12 = one octave up)
  - Negative values: transpose down (-12 = one octave down)
  - Common intervals: 7 (fifth), 5 (fourth), 3 (minor third), 4 (major third)

**Description:**  
Shifts all notes by the specified number of semitones. Pressing the button again with the same transpose value disables transposition. Using a different value changes to the new transposition.

**Examples:**

Octave controls:
```json
{
  "stylusButtons": {
    "primaryButtonAction": ["transpose", 12],    // Up one octave
    "secondaryButtonAction": ["transpose", -12]  // Down one octave
  }
}
```

Musical intervals:
```json
{
  "tabletButtons": {
    "1": ["transpose", 7],     // Perfect fifth up
    "2": ["transpose", 5],     // Perfect fourth up
    "3": ["transpose", 3],     // Minor third up
    "4": ["transpose", -5],    // Perfect fourth down
    "5": ["transpose", 12],    // Octave up
    "6": ["transpose", -12]    // Octave down
  }
}
```

**Behavior:**
- First press with `["transpose", 12]`: Activates +12 semitone transpose
- Second press with `["transpose", 12]`: Deactivates transpose
- Press with `["transpose", 7]`: Changes to +7 semitone transpose

**Use Cases:**
- Quick octave changes during performance
- Playing in different keys without reconfiguring chords
- Creating harmonies by layering transposed parts
- Accessing extended range on limited keyboards

---

### 3. set-strum-notes

Sets specific notes to strum through, allowing you to play without holding MIDI keyboard keys.

**Format:**
```json
["set-strum-notes", [note1, note2, note3, ...]]
```

**Parameters:**
- **`notes`** (array of strings, required): Note list in scientific notation
  - Format: `"<NoteName><Octave>"` (e.g., `"C4"`, `"F#5"`, `"Bb3"`)
  - Must include at least one note
  - Can include as many notes as needed

**Description:**  
Explicitly sets which notes to strum through. This gives you complete control over voicing, including doubled notes, wide intervals, or unusual chord shapes.

**Examples:**

Basic triads:
```json
{
  "tabletButtons": {
    "1": ["set-strum-notes", ["C4", "E4", "G4"]],     // C major
    "2": ["set-strum-notes", ["G3", "B3", "D4"]],     // G major
    "3": ["set-strum-notes", ["A3", "C4", "E4"]],     // A minor
    "4": ["set-strum-notes", ["F3", "A3", "C4"]]      // F major
  }
}
```

Advanced voicings:
```json
{
  "tabletButtons": {
    "1": ["set-strum-notes", ["C3", "G3", "C4", "E4", "G4"]],  // C major with doubled root
    "2": ["set-strum-notes", ["E2", "B2", "E3", "G#3"]],       // E major power chord style
    "3": ["set-strum-notes", ["E2"]],                           // Single bass note (for tremolo)
    "4": ["set-strum-notes", ["D4", "F#4", "A4", "C5", "E5"]]  // D major 9 voicing
  }
}
```

Bass lines:
```json
{
  "tabletButtons": {
    "1": ["set-strum-notes", ["E1", "E2"]],   // Low E doubled
    "2": ["set-strum-notes", ["A1", "A2"]],   // Low A doubled
    "3": ["set-strum-notes", ["D2", "D3"]],   // D doubled
    "4": ["set-strum-notes", ["G2", "G3"]]    // G doubled
  }
}
```

**Note Spread:**  
The `lowerNoteSpread` and `upperNoteSpread` settings in the `strumming` configuration will add additional octaves above and below your specified notes.

**Use Cases:**
- Custom voicings not available as standard chords
- Bass performance with specific note patterns
- Doubled notes for richer sound
- Single-note tremolo effects
- Creating custom intervals

---

### 4. set-strum-chord

Sets strumming notes using convenient chord notation instead of listing individual notes.

**Format:**
```json
["set-strum-chord", chordNotation, octave]
```

**Parameters:**
- **`chordNotation`** (string, required): Chord name in standard notation
  - Root note: `C`, `C#`, `Db`, `D`, etc.
  - Chord type: `maj`, `m`, `7`, `maj7`, `dim`, `aug`, etc.
  - Examples: `"C"`, `"Am"`, `"G7"`, `"Fmaj7"`, `"Bdim"`
- **`octave`** (integer, optional): Base octave for root note (default: 4)
  - Range: 0-9
  - Octave 4 is middle C

**Description:**  
Automatically generates note lists from standard chord notation. Much more convenient than manually listing notes for common chords.

**Examples:**

Basic major and minor chords:
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C"],       // C major (C4, E4, G4)
    "2": ["set-strum-chord", "G"],       // G major (G4, B4, D5)
    "3": ["set-strum-chord", "Am"],      // A minor (A4, C5, E5)
    "4": ["set-strum-chord", "F"],       // F major (F4, A4, C5)
    "5": ["set-strum-chord", "Dm"],      // D minor (D4, F4, A4)
    "6": ["set-strum-chord", "Em"],      // E minor (E4, G4, B4)
  }
}
```

Seventh chords:
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "Cmaj7"],   // C major 7th
    "2": ["set-strum-chord", "G7"],      // G dominant 7th
    "3": ["set-strum-chord", "Am7"],     // A minor 7th
    "4": ["set-strum-chord", "Fmaj7"],   // F major 7th
    "5": ["set-strum-chord", "Dm7"],     // D minor 7th
    "6": ["set-strum-chord", "E7"],      // E dominant 7th
  }
}
```

With octave control:
```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C", 3],     // C major in octave 3 (bass range)
    "2": ["set-strum-chord", "G", 3],     // G major in octave 3
    "3": ["set-strum-chord", "Am", 5],    // A minor in octave 5 (high)
    "4": ["set-strum-chord", "E5", 2],    // E power chord in octave 2 (very low)
  }
}
```

**Supported Chord Types:**

See [Chords & Progressions](/about/chords-and-progressions/) for the complete list, including:
- Triads: major, minor, diminished, augmented, sus2, sus4, power chords (5)
- Seventh: 7, maj7, m7, dim7, aug7
- Extended: 9, maj9, m9, add9, 6, m6

**Note Spread:**  
Like `set-strum-notes`, the chord notes are expanded with `lowerNoteSpread` and `upperNoteSpread`.

**Use Cases:**
- Quick chord changes during performance
- Setting up common progressions
- Jazz voicings with 7th and 9th chords
- Power chords for rock/metal
- Convenient chord selection without memorizing note names

---

### 5. set-chord-in-progression

Jumps to a specific position in a chord progression and applies that chord.

**Format:**
```json
["set-chord-in-progression", progressionName, index, octave]
```

**Parameters:**
- **`progressionName`** (string, required): Progression name (e.g., `"c-major-pop"`)
- **`index`** (integer, required): Position in progression (0-based, wraps around)
- **`octave`** (integer, optional): Base octave (default: 4)

**Description:**  
Loads a chord progression and jumps directly to a specific chord in it. Maintains progression state so other progression actions know where you are.

**Examples:**

Direct chord access:
```json
{
  "tabletButtons": {
    "1": ["set-chord-in-progression", "c-major-pop", 0],  // C
    "2": ["set-chord-in-progression", "c-major-pop", 1],  // G
    "3": ["set-chord-in-progression", "c-major-pop", 2],  // Am
    "4": ["set-chord-in-progression", "c-major-pop", 3],  // F
    "5": ["set-chord-in-progression", "c-major-pop", 0],  // Back to C
  }
}
```

Multiple progressions:
```json
{
  "tabletButtons": {
    "1": ["set-chord-in-progression", "c-major-pop", 0],     // Verse: C
    "2": ["set-chord-in-progression", "c-major-pop", 1],     // Verse: G
    "3": ["set-chord-in-progression", "a-minor-sad", 0],     // Bridge: Am
    "4": ["set-chord-in-progression", "a-minor-sad", 1],     // Bridge: Em
    "5": ["set-chord-in-progression", "blues-e", 0, 2],      // Solo: E7 (low)
  }
}
```

**Index Wrapping:**  
If you specify an index beyond the progression length, it wraps around. For a 4-chord progression:
- Index 0 → Chord 1
- Index 3 → Chord 4
- Index 4 → Chord 1 (wraps)
- Index -1 → Chord 4 (negative wraps backward)

**Use Cases:**
- Song structure navigation (verse/chorus/bridge)
- Direct access to specific chords in long progressions
- Setting up performance templates with fixed positions
- A/B comparison between chords

---

### 6. increment-chord-in-progression

Moves forward or backward through a chord progression.

**Format:**
```json
["increment-chord-in-progression", progressionName, amount, octave]
```

**Parameters:**
- **`progressionName`** (string, required): Progression name
- **`amount`** (integer, optional): Steps to move (default: 1, negative for backward)
- **`octave`** (integer, optional): Base octave (default: 4)

**Description:**  
Steps through a chord progression sequentially. Perfect for foot pedals or buttons dedicated to "next/previous chord". Maintains progression state across button presses.

**Examples:**

Simple next/previous:
```json
{
  "stylusButtons": {
    "primaryButtonAction": ["increment-chord-in-progression", "c-major-pop"],      // Next
    "secondaryButtonAction": ["increment-chord-in-progression", "c-major-pop", -1] // Previous
  }
}
```

Multiple progression controls:
```json
{
  "tabletButtons": {
    "1": ["increment-chord-in-progression", "c-major-pop", 1],      // Next in C major
    "2": ["increment-chord-in-progression", "c-major-pop", -1],     // Previous in C major
    "3": ["set-chord-in-progression", "c-major-pop", 0],            // Reset to start
    "4": ["increment-chord-in-progression", "blues-e", 1],          // Next in blues
    "5": ["increment-chord-in-progression", "blues-e", -1],         // Previous in blues
    "6": ["set-chord-in-progression", "blues-e", 0],                // Reset blues
  }
}
```

Large steps:
```json
{
  "tabletButtons": {
    "1": ["increment-chord-in-progression", "c-major-jazz", 1],    // Next chord
    "2": ["increment-chord-in-progression", "c-major-jazz", 2],    // Skip ahead 2
    "3": ["increment-chord-in-progression", "c-major-jazz", -2],   // Skip back 2
  }
}
```

**Progression State:**  
The progression state is shared across all progression actions. If you use `set-chord-in-progression` to jump to index 2, the next `increment-chord-in-progression` will move to index 3.

**Wrapping:**  
When you reach the end of the progression, it wraps to the beginning. Moving backward from the first chord wraps to the last.

**Use Cases:**
- Foot pedal control for live performance
- Sequential playback through progressions
- Practice tools for learning chord changes
- Dynamic accompaniment
- Song structure following

---

## Combining Actions

You can mix and match actions to create powerful control schemes:

### Performance Setup

```json
{
  "stylusButtons": {
    "primaryButtonAction": ["increment-chord-in-progression", "c-major-pop"],
    "secondaryButtonAction": ["transpose", 12]
  },
  "tabletButtons": {
    "1": ["set-chord-in-progression", "c-major-pop", 0],   // Verse: C
    "2": ["set-chord-in-progression", "c-major-pop", 1],   // Verse: G
    "3": ["set-chord-in-progression", "c-major-pop", 2],   // Verse: Am
    "4": ["set-chord-in-progression", "c-major-pop", 3],   // Verse: F
    "5": ["set-strum-chord", "Am", 3],                     // Bridge (bass)
    "6": ["set-strum-chord", "F", 3],                      // Bridge (bass)
    "7": "toggle-repeater",                                // Effect toggle
    "8": ["transpose", -12]                                 // Octave down
  }
}
```

### Worship/Gospel Setup

```json
{
  "tabletButtons": "gospel-g",  // Automatically sets buttons 1-8 to gospel-g progression
  "stylusButtons": {
    "primaryButtonAction": ["increment-chord-in-progression", "gospel-g"],
    "secondaryButtonAction": "toggle-repeater"
  }
}
```

### Jazz Practice

```json
{
  "tabletButtons": {
    "1": ["increment-chord-in-progression", "jazz-251-c", 1],   // Next chord
    "2": ["increment-chord-in-progression", "jazz-251-c", -1],  // Previous chord
    "3": ["set-chord-in-progression", "jazz-251-c", 0],         // Reset
    "4": ["set-strum-chord", "Cmaj7", 3],                       // Tonic
    "5": ["transpose", 12],
    "6": ["transpose", -12],
    "7": "toggle-repeater",
    "8": ["set-strum-notes", ["C2"]]                             // Bass note
  }
}
```

### Rock/Metal Setup

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "E5", 2],    // E power chord (low)
    "2": ["set-strum-chord", "G5", 2],    // G power chord (low)
    "3": ["set-strum-chord", "A5", 2],    // A power chord (low)
    "4": ["set-strum-chord", "C5", 2],    // C power chord (low)
    "5": ["set-strum-chord", "D5", 2],    // D power chord (low)
    "6": ["transpose", 12],               // Octave up
    "7": ["transpose", -12],              // Octave down
    "8": "toggle-repeater"                // Palm mute effect
  }
}
```

## Tips and Best Practices

### Stylus Button Considerations

- **Frequent actions first**: Put your most-used action on the easier-to-reach button
- **Complementary pairs**: Use transpose up/down or next/previous chord
- **Avoid complex actions**: Stylus buttons are hard to press while playing

### Tablet Button Layout

- **Group by function**: Put chord buttons together, utility buttons together
- **Progression order**: Match button order to chord progression order for easier learning
- **Reserve utilities**: Keep 1-2 buttons for transpose, repeater, etc.

### Progression vs. Individual Chords

**Use progression presets** when:
- You're playing in one key
- You want consistent chord order
- You're learning or practicing progressions

**Use custom button config** when:
- You need specific voicings
- You want mixed functions (chords + utilities)
- You're jumping between different keys/progressions

### Performance Workflow

1. Start with a progression preset to learn the basics
2. Identify which chords you use most
3. Customize individual buttons for your specific needs
4. Test thoroughly before performance

## Troubleshooting

### Buttons Not Responding

- Check that your tablet driver software isn't intercepting button presses
- Verify button numbers match your tablet (use web dashboard to see which buttons register)
- Ensure `stylusButtons.active` is set to `true`

### Wrong Chord Playing

- Verify chord notation is correct (case-sensitive)
- Check octave parameter isn't too high or low
- Verify progression name exists in `server/chord_progressions.json`

### Action Not Found

If you see "Unknown action" in console:
- Check spelling of action name
- Ensure parameters are in correct format
- Verify you're using a supported action

## Action Quick Reference

| Action | Format | Purpose |
|--------|--------|---------|
| `toggle-repeater` | String | Toggle note repeater on/off |
| `transpose` | `[name, semitones]` | Transpose notes up/down |
| `set-strum-notes` | `[name, [notes]]` | Set explicit note list |
| `set-strum-chord` | `[name, chord, octave?]` | Set chord by notation |
| `set-chord-in-progression` | `[name, prog, index, oct?]` | Jump to progression chord |
| `increment-chord-in-progression` | `[name, prog, amount?, oct?]` | Step through progression |

