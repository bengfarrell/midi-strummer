import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
    TabletExpressionConfig,
    StrummingConfig,
    NoteRepeaterConfig,
    TransposeConfig,
    StylusButtonsConfig,
    StrumReleaseConfig,
    TabletButtonsConfig,
    ButtonAction
} from '../types/config-types.js';

/**
 * Startup configuration interface
 */
export interface StartupConfiguration {
    drawingTablet: string;
    useSocketServer: boolean;
    socketServerPort: number;
    midiInputId: string;
}

/**
 * Complete settings state model matching settings.json
 */
export interface SettingsState {
    startupConfiguration: StartupConfiguration;
    noteDuration: TabletExpressionConfig;
    pitchBend: TabletExpressionConfig;
    noteVelocity: TabletExpressionConfig;
    strumming: StrummingConfig;
    noteRepeater: NoteRepeaterConfig;
    transpose: TransposeConfig;
    stylusButtons: StylusButtonsConfig;
    tabletButtons: TabletButtonsConfig;
    strumRelease: StrumReleaseConfig;
    allowPitchBend?: boolean;
}

/**
 * Reactive controller that manages application settings
 * and notifies multiple host components when settings change
 */
export class SettingsController implements ReactiveController {
    private hosts: Set<ReactiveControllerHost> = new Set();
    
    // Settings state
    private _state: SettingsState = {
        startupConfiguration: {
            drawingTablet: 'auto-detect',
            useSocketServer: true,
            socketServerPort: 8080,
            midiInputId: ''
        },
        noteDuration: {
            min: 0.15,
            max: 1.5,
            default: 1,
            multiplier: 1.0,
            curve: 1.0,
            spread: 'central',
            control: 'yaxis'
        },
        pitchBend: {
            min: -1.0,
            max: 1.0,
            default: 0,
            spread: 'direct',
            multiplier: 1.0,
            curve: 4.0,
            control: 'tiltXY'
        },
        noteVelocity: {
            min: 0,
            max: 127,
            spread: 'direct',
            multiplier: 1.0,
            curve: 4.0,
            control: 'pressure',
            default: 64
        },
        strumming: {
            pluckVelocityScale: 4.0,
            pressureThreshold: 0.1,
            midiChannel: 10,
            initialNotes: ['C4', 'E4', 'G4'],
            upperNoteSpread: 3,
            lowerNoteSpread: 3
        },
        noteRepeater: {
            active: false,
            pressureMultiplier: 1.0,
            frequencyMultiplier: 5.0
        },
        transpose: {
            active: false,
            semitones: 12
        },
        stylusButtons: {
            active: true,
            primaryButtonAction: ['transpose', 12],
            secondaryButtonAction: 'toggle-repeater'
        },
        tabletButtons: {
            '1': ['set-strum-chord', 'C', 4],
            '2': ['set-strum-chord', 'G', 4],
            '3': ['set-strum-chord', 'Am', 4],
            '4': ['set-strum-chord', 'F', 4],
            '5': ['set-strum-chord', 'Dm', 4],
            '6': ['set-strum-chord', 'Em', 4],
            '7': ['set-strum-chord', 'C', 4],
            '8': ['set-strum-chord', 'G', 4]
        },
        strumRelease: {
            active: false,
            maxDuration: 0.25,
            velocityMultiplier: 2,
            midiNote: 38,
            midiChannel: 11
        },
        allowPitchBend: false
    };
    
    constructor(host?: ReactiveControllerHost) {
        if (host) {
            this.addHost(host);
        }
    }
    
    /**
     * Add a host component to track
     */
    addHost(host: ReactiveControllerHost) {
        this.hosts.add(host);
        host.addController(this);
    }
    
    /**
     * Remove a host component
     */
    removeHost(host: ReactiveControllerHost) {
        this.hosts.delete(host);
    }
    
    /**
     * Notify all registered hosts to update
     */
    private notifyHosts() {
        this.hosts.forEach(host => host.requestUpdate());
    }
    
    // Lifecycle methods (required by ReactiveController)
    hostConnected() {
        // Called when host is connected to DOM
    }
    
    hostDisconnected() {
        // Called when host is disconnected from DOM
    }
    
    // State accessor
    get state(): Readonly<SettingsState> {
        return this._state;
    }
    
    // Update methods for each settings section
    
    updateStartupConfiguration(config: Partial<StartupConfiguration>) {
        this._state.startupConfiguration = {
            ...this._state.startupConfiguration,
            ...config
        };
        this.notifyHosts();
    }
    
    updateNoteDuration(config: Partial<TabletExpressionConfig>) {
        this._state.noteDuration = {
            ...this._state.noteDuration,
            ...config
        };
        this.notifyHosts();
    }
    
    updatePitchBend(config: Partial<TabletExpressionConfig>) {
        this._state.pitchBend = {
            ...this._state.pitchBend,
            ...config
        };
        this.notifyHosts();
    }
    
    updateNoteVelocity(config: Partial<TabletExpressionConfig>) {
        this._state.noteVelocity = {
            ...this._state.noteVelocity,
            ...config
        };
        this.notifyHosts();
    }
    
    updateStrumming(config: Partial<StrummingConfig>) {
        this._state.strumming = {
            ...this._state.strumming,
            ...config
        };
        this.notifyHosts();
    }
    
    updateNoteRepeater(config: Partial<NoteRepeaterConfig>) {
        this._state.noteRepeater = {
            ...this._state.noteRepeater,
            ...config
        };
        this.notifyHosts();
    }
    
    updateTranspose(config: Partial<TransposeConfig>) {
        this._state.transpose = {
            ...this._state.transpose,
            ...config
        };
        this.notifyHosts();
    }
    
    updateStylusButtons(config: Partial<StylusButtonsConfig>) {
        this._state.stylusButtons = {
            ...this._state.stylusButtons,
            ...config
        };
        this.notifyHosts();
    }
    
    updateTabletButtons(config: Partial<TabletButtonsConfig>) {
        this._state.tabletButtons = {
            ...this._state.tabletButtons,
            ...config
        };
        this.notifyHosts();
    }
    
    updateTabletButtonAction(buttonNumber: string, action: ButtonAction) {
        this._state.tabletButtons = {
            ...this._state.tabletButtons,
            [buttonNumber]: action
        } as TabletButtonsConfig;
        this.notifyHosts();
    }
    
    updateStrumRelease(config: Partial<StrumReleaseConfig>) {
        this._state.strumRelease = {
            ...this._state.strumRelease,
            ...config
        };
        this.notifyHosts();
    }
    
    setAllowPitchBend(allow: boolean) {
        this._state.allowPitchBend = allow;
        this.notifyHosts();
    }
    
    /**
     * Load settings from an object (e.g., from settings.json or API)
     */
    loadSettings(settings: Partial<SettingsState>) {
        if (settings.startupConfiguration) {
            this.updateStartupConfiguration(settings.startupConfiguration);
        }
        if (settings.noteDuration) {
            this.updateNoteDuration(settings.noteDuration);
        }
        if (settings.pitchBend) {
            this.updatePitchBend(settings.pitchBend);
        }
        if (settings.noteVelocity) {
            this.updateNoteVelocity(settings.noteVelocity);
        }
        if (settings.strumming) {
            this.updateStrumming(settings.strumming);
        }
        if (settings.noteRepeater) {
            this.updateNoteRepeater(settings.noteRepeater);
        }
        if (settings.transpose) {
            this.updateTranspose(settings.transpose);
        }
        if (settings.stylusButtons) {
            this.updateStylusButtons(settings.stylusButtons);
        }
        if (settings.tabletButtons) {
            this.updateTabletButtons(settings.tabletButtons);
        }
        if (settings.strumRelease) {
            this.updateStrumRelease(settings.strumRelease);
        }
        if (settings.allowPitchBend !== undefined) {
            this.setAllowPitchBend(settings.allowPitchBend);
        }
    }
    
    /**
     * Update a setting by dot-notation path (e.g., 'noteDuration.curve')
     */
    updateSettingByPath(path: string, value: any) {
        const [section, field] = path.split('.');
        
        switch (section) {
            case 'startupConfiguration':
                this.updateStartupConfiguration({ [field]: value });
                break;
            case 'noteDuration':
                this.updateNoteDuration({ [field]: value });
                break;
            case 'pitchBend':
                this.updatePitchBend({ [field]: value });
                break;
            case 'noteVelocity':
                this.updateNoteVelocity({ [field]: value });
                break;
            case 'strumming':
                this.updateStrumming({ [field]: value });
                break;
            case 'noteRepeater':
                this.updateNoteRepeater({ [field]: value });
                break;
            case 'transpose':
                this.updateTranspose({ [field]: value });
                break;
            case 'stylusButtons':
                this.updateStylusButtons({ [field]: value });
                break;
            case 'tabletButtons':
                // If field is a button number (1-8), update that specific button
                if (field && ['1', '2', '3', '4', '5', '6', '7', '8'].includes(field)) {
                    this.updateTabletButtonAction(field, value);
                } else {
                    // Otherwise update the entire config
                    this.updateTabletButtons(value);
                }
                break;
            case 'strumRelease':
                this.updateStrumRelease({ [field]: value });
                break;
            case 'allowPitchBend':
                this.setAllowPitchBend(value);
                break;
        }
    }
    
    /**
     * Reset all settings to defaults
     */
    reset() {
        this._state = {
            startupConfiguration: {
                drawingTablet: 'auto-detect',
                useSocketServer: true,
                socketServerPort: 8080,
                midiInputId: ''
            },
            noteDuration: {
                min: 0.15,
                max: 1.5,
                default: 1,
                multiplier: 1.0,
                curve: 1.0,
                spread: 'central',
                control: 'yaxis'
            },
            pitchBend: {
                min: -1.0,
                max: 1.0,
                default: 0,
                spread: 'direct',
                multiplier: 1.0,
                curve: 4.0,
                control: 'tiltXY'
            },
            noteVelocity: {
                min: 0,
                max: 127,
                spread: 'direct',
                multiplier: 1.0,
                curve: 4.0,
                control: 'pressure',
                default: 64
            },
            strumming: {
                pluckVelocityScale: 4.0,
                pressureThreshold: 0.1,
                midiChannel: 10,
                initialNotes: ['C4', 'E4', 'G4'],
                upperNoteSpread: 3,
                lowerNoteSpread: 3
            },
            noteRepeater: {
                active: false,
                pressureMultiplier: 1.0,
                frequencyMultiplier: 5.0
            },
            transpose: {
                active: false,
                semitones: 12
            },
            stylusButtons: {
                active: true,
                primaryButtonAction: ['transpose', 12],
                secondaryButtonAction: 'toggle-repeater'
            },
            tabletButtons: {
                '1': ['set-strum-chord', 'C', 4],
                '2': ['set-strum-chord', 'G', 4],
                '3': ['set-strum-chord', 'Am', 4],
                '4': ['set-strum-chord', 'F', 4],
                '5': ['set-strum-chord', 'Dm', 4],
                '6': ['set-strum-chord', 'Em', 4],
                '7': ['set-strum-chord', 'C', 4],
                '8': ['set-strum-chord', 'G', 4]
            },
            strumRelease: {
                active: false,
                maxDuration: 0.25,
                velocityMultiplier: 2,
                midiNote: 38,
                midiChannel: 11
            },
            allowPitchBend: false
        };
        this.notifyHosts();
    }
}

// Singleton instance that can be shared across components
export const sharedSettings = new SettingsController();

