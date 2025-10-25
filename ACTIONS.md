# MIDI Strummer Actions Reference

This document describes all available actions that can be assigned to stylus buttons or tablet buttons in MIDI Strummer.

**For chord notation and progression presets, see [CHORDS.md](CHORDS.md)**

## Table of Contents

- [Action Format](#action-format)
- [Available Actions](#available-actions)
- [Usage Examples](#usage-examples)

---

## Action Format

Actions can be specified in several formats:

### String Format
```json
"toggle-repeater"
```

### Array Format with Parameters
```json
["transpose", 12]
```

### Nested Array Format
```json
["set-strum-notes", ["C4", "E4", "G4"]]
```

### Chord Notation Format
```json
["set-strum-chord", "Cmaj7", 3]
```

---

## Available Actions

### 1. `toggle-repeater`

Toggles the note repeater feature on/off.

**Format:**
```json
"toggle-repeater"
```
or
```json
["toggle-repeater"]
```

**Parameters:** None

**Example:**
```json
"stylusButtons": {
  "primaryButtonAction": "toggle-repeater"
}
```

---

### 2. `transpose`

Toggles transpose on/off with specified semitones. Pressing the button again with the same semitones value will turn off transpose.

**Format:**
```json
["transpose", <semitones>]
```

**Parameters:**
- `semitones` (integer, required): Number of semitones to transpose
  - Positive values transpose up (e.g., `12` = one octave up)
  - Negative values transpose down (e.g., `-12` = one octave down)

**Examples:**
```json
"stylusButtons": {
  "primaryButtonAction": ["transpose", 12],     // Transpose up one octave
  "secondaryButtonAction": ["transpose", -12]   // Transpose down one octave
}
```

```json
"tabletButtons": {
  "1": ["transpose", 7],    // Up a perfect fifth
  "2": ["transpose", -5]    // Down a perfect fourth
}
```

---

### 3. `set-strum-notes`

Sets the strumming notes to a specific list of notes. This allows you to strum without holding down MIDI keyboard keys.

**Format:**
```json
["set-strum-notes", [<note1>, <note2>, ...]]
```

**Parameters:**
- `notes` (array of strings, required): Array of note strings in notation format
  - Format: `"<Note><Octave>"` (e.g., `"C4"`, `"F#5"`, `"Bb3"`)
  - Must include at least one note

**Examples:**
```json
"tabletButtons": {
  "1": ["set-strum-notes", ["C4", "E4", "G4"]],              // C major triad
  "2": ["set-strum-notes", ["G3", "B3", "D4", "G4"]],        // G major with doubled root
  "3": ["set-strum-notes", ["A3", "C4", "E4"]],              // A minor triad
  "4": ["set-strum-notes", ["E2"]],                          // Single note (for tremolo)
  "5": ["set-strum-notes", ["C4", "E4", "G4", "B4", "D5"]]   // Complex voicing
}
```

---

### 4. `set-strum-chord`

Sets the strumming notes using chord notation. This is a more convenient way to specify chords compared to listing individual notes.

**Format:**
```json
["set-strum-chord", <chord-notation>, <octave>]
```

**Parameters:**
- `chord-notation` (string, required): Chord notation (see [CHORDS.md](CHORDS.md) for full reference)
- `octave` (integer, optional): Base octave for the root note (default: `4`)

**Examples:**
```json
"tabletButtons": {
  "1": ["set-strum-chord", "C"],              // C major in octave 4
  "2": ["set-strum-chord", "Gm", 3],          // G minor in octave 3
  "3": ["set-strum-chord", "Am7"],            // A minor 7th in octave 4
  "4": ["set-strum-chord", "Fmaj7", 3],       // F major 7th in octave 3
  "5": ["set-strum-chord", "Ddim"],           // D diminished in octave 4
  "6": ["set-strum-chord", "Esus4"],          // E suspended 4th in octave 4
  "7": ["set-strum-chord", "Cmaj9", 3],       // C major 9th in octave 3
  "8": ["set-strum-chord", "G7"]              // G dominant 7th in octave 4
}
```

**Supported Chord Types:**  
Major, Minor, Diminished, Augmented, Suspended (2 & 4), Power chords (5), 7th chords, 9th chords, 6th chords, and more.

**See [CHORDS.md](CHORDS.md) for:**
- Complete chord notation reference with all supported chord types
- Chord progression presets that configure all 8 buttons at once
- Detailed examples and usage patterns

---

### 5. `set-chord-in-progression`

Sets a chord progression to a specific index position and applies that chord to the strummer. Maintains progression state across button presses.

**Format:**
```json
["set-chord-in-progression", <progression-name>, <index>, <octave>]
```

**Parameters:**
- `progression-name` (string, required): Name of the chord progression (see [CHORDS.md](CHORDS.md))
- `index` (integer, required): Index position in the progression (0-based, wraps around)
- `octave` (integer, optional): Base octave for the chord (default: `4`)

**Examples:**
```json
"tabletButtons": {
  "1": ["set-chord-in-progression", "c-major-pop", 0],      // First chord (C)
  "2": ["set-chord-in-progression", "c-major-pop", 1],      // Second chord (G)
  "3": ["set-chord-in-progression", "c-major-pop", 2],      // Third chord (Am)
  "4": ["set-chord-in-progression", "c-major-pop", 3],      // Fourth chord (F)
  "5": ["set-chord-in-progression", "blues-e", 0, 3],       // E7 in octave 3
  "6": ["set-chord-in-progression", "blues-e", 1, 3],       // A7 in octave 3
  "7": ["set-chord-in-progression", "blues-e", 2, 3],       // B7 in octave 3
  "8": ["increment-chord-in-progression", "c-major-pop"]    // Next chord
}
```

**Use Cases:**
- Direct access to specific chords in a progression
- Jumping to different sections of a song
- Setting up pedal boards with fixed chord positions

---

### 6. `increment-chord-in-progression`

Advances (or reverses) through a chord progression and applies the new chord to the strummer. Maintains progression state across button presses.

**Format:**
```json
["increment-chord-in-progression", <progression-name>, <amount>, <octave>]
```

**Parameters:**
- `progression-name` (string, required): Name of the chord progression (see [CHORDS.md](CHORDS.md))
- `amount` (integer, optional): Number of steps to advance (default: `1`, can be negative for reverse)
- `octave` (integer, optional): Base octave for the chord (default: `4`)

**Examples:**
```json
"stylusButtons": {
  "primaryButtonAction": ["increment-chord-in-progression", "c-major-pop"],      // Next chord
  "secondaryButtonAction": ["increment-chord-in-progression", "c-major-pop", -1] // Previous chord
}
```

```json
"tabletButtons": {
  "1": ["increment-chord-in-progression", "c-major-pop", 1],   // Next chord
  "2": ["increment-chord-in-progression", "c-major-pop", -1],  // Previous chord
  "3": ["increment-chord-in-progression", "c-major-pop", 2],   // Skip ahead 2
  "4": ["set-chord-in-progression", "c-major-pop", 0],         // Reset to start
  "5": ["increment-chord-in-progression", "blues-e"],          // Blues progression next
  "6": ["increment-chord-in-progression", "blues-e", -1],      // Blues progression previous
  "7": "toggle-repeater",
  "8": ["transpose", 12]
}
```

**Use Cases:**
- Foot pedals for live performance (next/previous chord)
- Sequential playback through a progression
- Practice tools for learning progressions
- Dynamic accompaniment

---

## Usage Examples

### Using Chord Progression Presets

The easiest way to configure tablet buttons is to use a chord progression preset:

```json
{
  "tabletButtons": "c-major-pop"
}
```

This automatically configures all 8 buttons with the C Major Pop progression (C-G-Am-F pattern).

**More preset examples:**
```json
"tabletButtons": "blues-e"        // 12-bar blues in E
"tabletButtons": "jazz-251-c"     // Jazz ii-V-I in C
"tabletButtons": "a-minor-sad"    // Melancholic A minor progression
"tabletButtons": "rock-power"     // Rock power chord progression
```

**See [CHORDS.md](CHORDS.md) for the complete list of 25+ progression presets.**

---

### Custom Button Configuration

For full control, configure each button individually:

```json
"stylusButtons": {
  "primaryButtonAction": ["transpose", 12],
  "secondaryButtonAction": "toggle-repeater"
},
"tabletButtons": {
  "1": ["set-strum-chord", "C"],
  "2": ["set-strum-chord", "G"],
  "3": ["set-strum-chord", "Am"],
  "4": ["set-strum-chord", "F"],
  "5": ["transpose", 7],
  "6": ["transpose", -5],
  "7": ["set-strum-notes", ["E2"]],
  "8": "toggle-repeater"
}
```

```json
{
  "tabletButtons": {
    "1": ["set-strum-chord", "C", 2],     // Bass range C major
    "2": ["set-strum-chord", "E", 2],     // Bass range E major
    "3": ["set-strum-chord", "Am", 2],    // Bass range A minor
    "4": ["set-strum-chord", "G", 2],     // Bass range G major
    "5": ["transpose", 12],               // Transpose up octave
    "6": ["transpose", -12],              // Transpose down octave
    "7": ["set-strum-notes", ["E2"]],     // Single bass note
    "8": "toggle-repeater"                // Toggle repeater
  }
}
```

---

## Notes

- **Chord Progression Presets**: Use a preset string like `"c-major-pop"` to quickly configure all 8 buttons. See [CHORDS.md](CHORDS.md) for 25+ presets.
- **Custom Configuration**: Define each button individually for maximum flexibility (both methods work simultaneously)
- **Progression State**: The `set-chord-in-progression` and `increment-chord-in-progression` actions maintain a shared progression state. This means you can navigate through a progression sequentially using buttons or pedals.
- **Index Wrapping**: All progression indices automatically wrap around - index 4 in a 4-chord progression wraps to 0, negative indices work backwards.
- All chord notes are automatically adjusted for `lowerNoteSpread` and `upperNoteSpread` configured in the `strumming` section
- When using `set-strum-chord`, `set-strum-notes`, or progression actions, you can strum immediately without holding MIDI keyboard keys
- Transpose affects all notes being played, including those set by chord/note actions
- The note repeater works with any notes set via actions

