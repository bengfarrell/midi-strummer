/**
 * TypeScript interfaces for all configuration objects
 * These types are used by both the factory components and the app state
 */

export interface TabletExpressionConfig {
    min: number;
    max: number;
    default: number;
    multiplier: number;
    curve: number;
    spread: 'direct' | 'inverse' | 'central';
    control: 'yaxis' | 'pressure' | 'tiltX' | 'tiltY' | 'tiltXY';
}

export interface StrummingConfig {
    pluckVelocityScale: number;
    pressureThreshold: number;
    midiChannel: number;
    initialNotes: string[];
    upperNoteSpread: number;
    lowerNoteSpread: number;
}

export interface NoteRepeaterConfig {
    active: boolean;
    pressureMultiplier: number;
    frequencyMultiplier: number;
}

export interface TransposeConfig {
    active: boolean;
    semitones: number;
}

// Action can be a string or an array [actionName, ...params]
export type ButtonAction = string | Array<string | number>;

export interface StylusButtonsConfig {
    active: boolean;
    primaryButtonAction: ButtonAction;
    secondaryButtonAction: ButtonAction;
}

export interface StrumReleaseConfig {
    active: boolean;
    maxDuration: number;
    velocityMultiplier: number;
    midiNote: number;
    midiChannel: number;
}

// Tablet buttons can be configured as individual button actions
// or as a preset name that gets expanded into 8 button actions
export interface TabletButtonsConfig {
    '1': ButtonAction;
    '2': ButtonAction;
    '3': ButtonAction;
    '4': ButtonAction;
    '5': ButtonAction;
    '6': ButtonAction;
    '7': ButtonAction;
    '8': ButtonAction;
}

