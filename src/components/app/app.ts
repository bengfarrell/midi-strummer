import { html, LitElement } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { styles } from './app.css';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/theme-dark.js';

import '../piano/piano.js';
import { PianoElement } from '../piano/piano.js';
import { NoteObject } from '../../utils/note.js';
import '../dashboard-panel/dashboard-panel.js';
import '../expression-mappings/expression-mappings.js';
import '../features/features.js';
import '../tablet-visualizer/tablet-visualizer.js';
import { TabletExpressionConfig } from '../tablet-expression-controls/tablet-expression-controls.js';
import { StrummingConfig } from '../strumming-controls/strumming-controls.js';
import { NoteRepeaterConfig } from '../note-repeater-controls/note-repeater-controls.js';
import { TransposeConfig } from '../transpose-controls/transpose-controls.js';
import { StylusButtonsConfig } from '../stylus-buttons-controls/stylus-buttons-controls.js';
import { StrumReleaseConfig } from '../strum-release-controls/strum-release-controls.js';

@customElement('strummer-app')
export class StrummerApp extends LitElement {
    static styles = styles;

    @query('piano-keys')
    protected piano?: PianoElement;

    protected notes: NoteObject[] = [];

    protected webSocket?: WebSocket;

    @state()
    protected allowPitchBend:boolean = false;

    @state()
    protected noteDuration: TabletExpressionConfig = {
        min: 0.15,
        max: 1.5,
        default: 1,
        multiplier: 1.0,
        curve: 1.0,
        spread: 'central',
        control: 'yaxis'
    };

    @state()
    protected pitchBend: TabletExpressionConfig = {
        min: -1.0,
        max: 1.0,
        default: 0,
        spread: 'direct',
        multiplier: 1.0,
        curve: 4.0,
        control: 'tiltXY'
    };

    @state()
    protected noteVelocity: TabletExpressionConfig = {
        min: 0,
        max: 127,
        spread: 'direct',
        multiplier: 1.0,
        curve: 4.0,
        control: 'pressure',
        default: 64
    };

    @state()
    protected strumming: StrummingConfig = {
        pluckVelocityScale: 4.0,
        pressureThreshold: 0.1,
        midiChannel: 10,
        initialNotes: ['C4', 'E4', 'G4'],
        upperNoteSpread: 3,
        lowerNoteSpread: 3
    };

    @state()
    protected noteRepeater: NoteRepeaterConfig = {
        active: false,
        pressureMultiplier: 1.0,
        frequencyMultiplier: 5.0
    };

    @state()
    protected transpose: TransposeConfig = {
        active: false,
        semitones: 12
    };

    @state()
    protected stylusButtons: StylusButtonsConfig = {
        primaryButtonAction: 'toggle-transpose',
        secondaryButtonAction: 'toggle-repeater'
    };

    @state()
    protected strumRelease: StrumReleaseConfig = {
        maxDuration: 0.25,
        velocityMultiplier: 2,
        midiNote: 38,
        midiChannel: 11
    };

    async connectedCallback() {
        super.connectedCallback();
        
        // Load settings in dev mode
        await this.loadSettingsIfDev();
        
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) return;
        this.webSocket = new WebSocket('ws://localhost:8080');
        this.webSocket.onopen = () => {
            //updateStatus(true);
            console.log('WebSocket opened');
        };

        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'notes':
                    this.updateNotes(data.notes);
                    break;

                case 'config':
                    const config = data.config;
                    if (config.allowPitchBend !== undefined) {
                        this.allowPitchBend = config.allowPitchBend;
                    }
                    if (config.noteDuration) {
                        this.noteDuration = { ...this.noteDuration, ...config.noteDuration };
                    }
                    if (config.pitchBend) {
                        this.pitchBend = { ...this.pitchBend, ...config.pitchBend };
                    }
                    if (config.noteVelocity) {
                        this.noteVelocity = { ...this.noteVelocity, ...config.noteVelocity };
                    }
                    if (config.strumming) {
                        this.strumming = { ...this.strumming, ...config.strumming };
                    }
                    if (config.noteRepeater) {
                        this.noteRepeater = { ...this.noteRepeater, ...config.noteRepeater };
                    }
                    if (config.transpose) {
                        this.transpose = { ...this.transpose, ...config.transpose };
                    }
                    if (config.stylusButtons) {
                        this.stylusButtons = { ...this.stylusButtons, ...config.stylusButtons };
                    }
                    if (config.strumRelease) {
                        this.strumRelease = { ...this.strumRelease, ...config.strumRelease };
                    }
                    break;
            }
        };

        this.webSocket.onerror = (error) => {
            console.log(`❌ WebSocket error: ${error}`);
        };

        this.webSocket.onclose = () => {
            console.log('WebSocket closed');
        };
    }

    async loadSettingsIfDev() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                console.log('📋 Loaded settings from /api/settings', settings);
                
                if (settings.noteDuration) {
                    this.noteDuration = settings.noteDuration;
                }
                if (settings.pitchBend) {
                    this.pitchBend = settings.pitchBend;
                }
                if (settings.noteVelocity) {
                    this.noteVelocity = settings.noteVelocity;
                }
                if (settings.strumming) {
                    this.strumming = settings.strumming;
                }
                if (settings.noteRepeater) {
                    this.noteRepeater = settings.noteRepeater;
                }
                if (settings.transpose) {
                    this.transpose = settings.transpose;
                }
                if (settings.stylusButtons) {
                    this.stylusButtons = settings.stylusButtons;
                }
                if (settings.strumRelease) {
                    this.strumRelease = settings.strumRelease;
                }
                if (settings.allowPitchBend !== undefined) {
                    this.allowPitchBend = settings.allowPitchBend;
                }
            }
        } catch (error) {
            // Silently fail - likely not in dev mode or server not running
            console.log('Settings not loaded from /api/settings (normal in production)');
        }
    }

    updateServerConfig(data: any) {
        const json = JSON.stringify(data);
        this.webSocket?.send(json);
    }

    handleConfigChange(event: CustomEvent) {
        // Update local state immediately for live UI updates
        const detail = event.detail;
        
        console.log('Config change received:', detail);
        
        for (const key in detail) {
            const [section, field] = key.split('.');
            const value = detail[key];
            
            switch (section) {
                case 'noteDuration':
                    if (this.noteDuration) {
                        this.noteDuration = { ...this.noteDuration, [field]: value } as TabletExpressionConfig;
                        console.log('Updated noteDuration:', this.noteDuration);
                    }
                    break;
                case 'pitchBend':
                    if (this.pitchBend) {
                        this.pitchBend = { ...this.pitchBend, [field]: value } as TabletExpressionConfig;
                        console.log('Updated pitchBend:', this.pitchBend);
                    }
                    break;
                case 'noteVelocity':
                    if (this.noteVelocity) {
                        this.noteVelocity = { ...this.noteVelocity, [field]: value } as TabletExpressionConfig;
                        console.log('Updated noteVelocity:', this.noteVelocity);
                    }
                    break;
                case 'strumming':
                    this.strumming = { ...this.strumming, [field]: value };
                    break;
                case 'noteRepeater':
                    this.noteRepeater = { ...this.noteRepeater, [field]: value };
                    break;
                case 'transpose':
                    this.transpose = { ...this.transpose, [field]: value };
                    break;
                case 'stylusButtons':
                    this.stylusButtons = { ...this.stylusButtons, [field]: value };
                    break;
                case 'strumRelease':
                    this.strumRelease = { ...this.strumRelease, [field]: value };
                    break;
                case 'allowPitchBend':
                    this.allowPitchBend = value;
                    break;
            }
        }
        
        // Also send to server
        this.updateServerConfig(detail);
    }

    updateNotes(notes: NoteObject[]) {
        this.notes.forEach(note => {
            this.piano?.setNoteUp(note.notation, note.octave);
        });

        this.notes = notes;
        this.notes.forEach(note => {
            this.piano?.setNoteDown(note.notation, note.octave, note.secondary);
        });
    }

    render() {
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>

            <piano-keys layout="C" keys=20></piano-keys>

            <dashboard-panel title="Expression Mapping Visualizations" collapsible>
                <tablet-visualizer
                    .noteDuration=${this.noteDuration}
                    .pitchBend=${this.pitchBend}
                    .noteVelocity=${this.noteVelocity}
                    @config-change=${this.handleConfigChange}>
                </tablet-visualizer>
            </dashboard-panel>

            <dashboard-panel title="Expression Mappings" collapsible>
                <expression-mappings
                    .noteDuration=${this.noteDuration}
                    .pitchBend=${this.pitchBend}
                    .noteVelocity=${this.noteVelocity}
                    @config-change=${this.handleConfigChange}>
                </expression-mappings>
            </dashboard-panel>

            <dashboard-panel title="Features" collapsible>
                <features-panel
                    .strumming=${this.strumming}
                    .noteRepeater=${this.noteRepeater}
                    .transpose=${this.transpose}
                    .stylusButtons=${this.stylusButtons}
                    .strumRelease=${this.strumRelease}
                    @config-change=${this.handleConfigChange}>
                </features-panel>
            </dashboard-panel>
        </sp-theme>`
    }

}