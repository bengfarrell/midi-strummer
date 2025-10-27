# Reactive Controllers

This directory contains Lit Reactive Controllers that manage shared state across multiple components.

## TabletInteractionController

A reactive controller that manages shared state for tablet and pen interactions. Multiple components can register with this controller and all will be updated when the state changes.

### Features

- **Multi-host support**: Multiple components can use the same controller instance
- **Automatic updates**: When state changes, all registered hosts call `requestUpdate()`
- **Shared state**: Tablet position, pen tilt, pressure, buttons, and string interactions

### Usage

#### Option 1: Use the Shared Instance (Recommended)

```typescript
import { LitElement } from 'lit';
import { sharedTabletInteraction } from '../controllers';

class MyComponent extends LitElement {
    constructor() {
        super();
        // Register this component with the shared controller
        sharedTabletInteraction.addHost(this);
    }
    
    render() {
        // Access state
        const state = sharedTabletInteraction.state;
        return html`
            <div>Tablet X: ${state.tabletX}</div>
            <div>Tilt Pressure: ${state.tiltPressure}</div>
        `;
    }
    
    handleMouseMove(e: MouseEvent) {
        // Update state - all components will re-render
        sharedTabletInteraction.setTabletPosition(e.offsetX, e.offsetY, true);
    }
}
```

#### Option 2: Create Your Own Instance

```typescript
import { TabletInteractionController } from '../controllers';

class MyComponent extends LitElement {
    private tabletController = new TabletInteractionController(this);
    
    render() {
        const state = this.tabletController.state;
        return html`<div>X: ${state.tabletX}</div>`;
    }
}
```

### State Interface

```typescript
interface TabletInteractionState {
    // Tablet state
    tabletPressed: boolean;
    tabletX: number;
    tabletY: number;
    
    // Pen tilt state
    tiltPressed: boolean;
    tiltX: number;
    tiltY: number;
    tiltPressure: number;
    
    // Button states
    primaryButtonPressed: boolean;
    secondaryButtonPressed: boolean;
    tabletButtons: boolean[]; // 8 tablet buttons
    
    // Last interaction info
    lastHoveredString: number | null;
    lastPressedButton: number | null;
}
```

### Methods

#### Tablet Methods
- `setTabletPosition(x, y, pressed)` - Update tablet position and pressed state
- `setTabletPressed(pressed)` - Update only the pressed state

#### Pen Tilt Methods
- `setTiltPosition(x, y, pressure, pressed)` - Update tilt position, pressure, and pressed state
- `setTiltPressed(pressed)` - Update only the pressed state (resets tilt to 0 when released)

#### Button Methods
- `setPrimaryButton(pressed)` - Update primary stylus button
- `setSecondaryButton(pressed)` - Update secondary stylus button
- `setTabletButton(index, pressed)` - Update a specific tablet button (0-7)

#### String Methods
- `setLastHoveredString(index | null)` - Update the last hovered string

#### Utility Methods
- `reset()` - Reset all state to defaults
- `addHost(host)` - Register a new component
- `removeHost(host)` - Unregister a component

### Architecture

The controller implements Lit's `ReactiveController` interface, which provides:

1. **Lifecycle hooks**: `hostConnected()` and `hostDisconnected()`
2. **Multi-host tracking**: Maintains a Set of all registered components
3. **Centralized updates**: All hosts are notified via `requestUpdate()` when state changes

This pattern ensures:
- All visualizations stay in sync
- Single source of truth for interaction state
- Decoupled components that don't need to know about each other

---

## SettingsController

A reactive controller that manages application settings from `settings.json`. This provides a centralized, reactive state management system for all configuration data.

### Features

- **Multi-host support**: Multiple components can use the same controller instance
- **Automatic updates**: When settings change, all registered hosts call `requestUpdate()`
- **Shared state**: All application configuration including tablet expressions, MIDI settings, and feature toggles
- **Path-based updates**: Update settings using dot-notation paths (e.g., `'noteDuration.curve'`)
- **Bulk loading**: Load entire settings object from JSON or API responses

### Usage

#### Use the Shared Instance (Recommended)

```typescript
import { LitElement } from 'lit';
import { sharedSettings } from '../controllers';

class MyComponent extends LitElement {
    constructor() {
        super();
        // Register this component with the shared controller
        sharedSettings.addHost(this);
    }
    
    render() {
        // Access settings
        const settings = sharedSettings.state;
        return html`
            <div>Note Duration Min: ${settings.noteDuration.min}</div>
            <div>MIDI Channel: ${settings.strumming.midiChannel}</div>
        `;
    }
    
    handleCurveChange(newValue: number) {
        // Update a setting - all components will re-render
        sharedSettings.updateNoteDuration({ curve: newValue });
        
        // Or use path-based update
        sharedSettings.updateSettingByPath('noteDuration.curve', newValue);
    }
}
```

#### Load Settings from API or File

```typescript
async loadSettings() {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    
    // Load all settings at once
    sharedSettings.loadSettings(settings);
}
```

### State Interface

```typescript
interface SettingsState {
    startupConfiguration: StartupConfiguration;
    noteDuration: TabletExpressionConfig;
    pitchBend: TabletExpressionConfig;
    noteVelocity: TabletExpressionConfig;
    strumming: StrummingConfig;
    noteRepeater: NoteRepeaterConfig;
    transpose: TransposeConfig;
    stylusButtons: StylusButtonsConfig;
    tabletButtons: string;
    strumRelease: StrumReleaseConfig;
    allowPitchBend?: boolean;
}
```

### Methods

#### Section Update Methods
- `updateStartupConfiguration(config)` - Update startup configuration
- `updateNoteDuration(config)` - Update note duration settings
- `updatePitchBend(config)` - Update pitch bend settings
- `updateNoteVelocity(config)` - Update note velocity settings
- `updateStrumming(config)` - Update strumming settings
- `updateNoteRepeater(config)` - Update note repeater settings
- `updateTranspose(config)` - Update transpose settings
- `updateStylusButtons(config)` - Update stylus button actions
- `updateTabletButtons(preset)` - Update tablet button preset
- `updateStrumRelease(config)` - Update strum release settings
- `setAllowPitchBend(allow)` - Toggle pitch bend allowance

#### Bulk Operations
- `loadSettings(settings)` - Load settings from an object (e.g., from settings.json or API)
- `updateSettingByPath(path, value)` - Update a setting using dot-notation (e.g., 'noteDuration.curve')

#### Utility Methods
- `reset()` - Reset all settings to defaults
- `addHost(host)` - Register a new component
- `removeHost(host)` - Unregister a component

### Architecture

The controller provides:

1. **Centralized State**: Single source of truth for all application settings
2. **Reactive Updates**: All registered components automatically re-render on changes
3. **Type Safety**: Full TypeScript support with interfaces from `config-types.ts`
4. **Flexible Updates**: Support for both section-level and path-based updates

This pattern ensures:
- Settings stay synchronized across all components
- No prop drilling required
- Easy integration with WebSocket updates or API calls
- Consistent state management throughout the application

