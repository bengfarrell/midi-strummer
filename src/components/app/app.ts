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
import '../tablet-visualizer/tablet-visualizer.js';
import '../curve-visualizer/curve-visualizer.js';
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
        active: true,
        primaryButtonAction: 'toggle-transpose',
        secondaryButtonAction: 'toggle-repeater'
    };

    @state()
    protected strumRelease: StrumReleaseConfig = {
        active: false,
        maxDuration: 0.25,
        velocityMultiplier: 2,
        midiNote: 38,
        midiChannel: 11
    };

    @state()
    protected panelOrder: string[] = [
        'drawing-tablet',
        'pen-tilt',
        'keyboard',
        'note-duration',
        'pitch-bend',
        'note-velocity',
        'strumming',
        'note-repeater',
        'transpose',
        'stylus-buttons',
        'strum-release'
    ];

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

    handlePanelDrop(e: CustomEvent) {
        const { draggedPanelId, targetPanelId } = e.detail;
        
        const draggedIndex = this.panelOrder.indexOf(draggedPanelId);
        const targetIndex = this.panelOrder.indexOf(targetPanelId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // Create new array with swapped positions
        const newOrder = [...this.panelOrder];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedPanelId);
        
        this.panelOrder = newOrder;
    }

    getPanels() {
        const colors = ['#51cf66', '#339af0', '#ff6b6b'];
        
        const panels: Record<string, any> = {
            'drawing-tablet': html`
                <dashboard-panel 
                    panelId="drawing-tablet"
                    title="Drawing Tablet" 
                    size="small"
                    @panel-drop=${this.handlePanelDrop}>
                <tablet-visualizer
                    mode="tablet"
                    .noteDuration=${this.noteDuration}
                    .pitchBend=${this.pitchBend}
                    .noteVelocity=${this.noteVelocity}
                    @config-change=${this.handleConfigChange}>
                </tablet-visualizer>
            </dashboard-panel>
            `,
            'pen-tilt': html`
                <dashboard-panel 
                    panelId="pen-tilt"
                    title="Pen Tilt & Pressure" 
                    size="small"
                    @panel-drop=${this.handlePanelDrop}>
                <tablet-visualizer
                    mode="tilt"
                    .noteDuration=${this.noteDuration}
                    .pitchBend=${this.pitchBend}
                    .noteVelocity=${this.noteVelocity}
                    @config-change=${this.handleConfigChange}>
                </tablet-visualizer>
            </dashboard-panel>
            `,
            'keyboard': html`
                <dashboard-panel 
                    panelId="keyboard"
                    title="Keyboard" 
                    size="wide"
                    @panel-drop=${this.handlePanelDrop}>
                    <piano-keys layout="C" keys=20></piano-keys>
                </dashboard-panel>
            `,
            'note-duration': html`
                <dashboard-panel 
                    panelId="note-duration"
                    title="Note Duration" 
                    size="small" 
                    closable
                    @panel-drop=${this.handlePanelDrop}>
                    <curve-visualizer
                        .label="Note Duration"
                        .parameterKey="noteDuration"
                        .control="${this.noteDuration.control}"
                        .outputLabel="Value"
                        .config="${this.noteDuration}"
                        .color="${colors[0]}"
                        @config-change=${this.handleConfigChange}
                        @control-change=${this.handleConfigChange}>
                    </curve-visualizer>
                </dashboard-panel>
            `,
            'pitch-bend': html`
                <dashboard-panel 
                    panelId="pitch-bend"
                    title="Pitch Bend" 
                    size="small" 
                    closable
                    @panel-drop=${this.handlePanelDrop}>
                    <curve-visualizer
                        .label="Pitch Bend"
                        .parameterKey="pitchBend"
                        .control="${this.pitchBend.control}"
                        .outputLabel="Value"
                        .config="${this.pitchBend}"
                        .color="${colors[1]}"
                        @config-change=${this.handleConfigChange}
                        @control-change=${this.handleConfigChange}>
                    </curve-visualizer>
                </dashboard-panel>
            `,
            'note-velocity': html`
                <dashboard-panel 
                    panelId="note-velocity"
                    title="Note Velocity" 
                    size="small" 
                    closable
                    @panel-drop=${this.handlePanelDrop}>
                    <curve-visualizer
                        .label="Note Velocity"
                        .parameterKey="noteVelocity"
                        .control="${this.noteVelocity.control}"
                        .outputLabel="Value"
                        .config="${this.noteVelocity}"
                        .color="${colors[2]}"
                        @config-change=${this.handleConfigChange}
                        @control-change=${this.handleConfigChange}>
                    </curve-visualizer>
                </dashboard-panel>
            `,
            'strumming': html`
                <dashboard-panel 
                    panelId="strumming"
                    title="Strumming" 
                    size="medium"
                    closable
                    @panel-drop=${this.handlePanelDrop}>
                <div class="config-group">
                    <sp-field-label for="pluck-velocity">Pluck Velocity Scale</sp-field-label>
                    <sp-number-field id="pluck-velocity" value="${this.strumming.pluckVelocityScale}" step="0.1"></sp-number-field>
                    
                    <sp-field-label for="pressure-threshold">Pressure Threshold</sp-field-label>
                    <sp-number-field id="pressure-threshold" value="${this.strumming.pressureThreshold}" step="0.01"></sp-number-field>
                    
                    <sp-field-label for="midi-channel">MIDI Channel</sp-field-label>
                    <sp-number-field id="midi-channel" value="${this.strumming.midiChannel}" step="1" min="1" max="16"></sp-number-field>
                    
                    <sp-field-label for="upper-spread">Upper Note Spread</sp-field-label>
                    <sp-number-field id="upper-spread" value="${this.strumming.upperNoteSpread}" step="1" min="0"></sp-number-field>
                    
                    <sp-field-label for="lower-spread">Lower Note Spread</sp-field-label>
                    <sp-number-field id="lower-spread" value="${this.strumming.lowerNoteSpread}" step="1" min="0"></sp-number-field>
                </div>
            </dashboard-panel>
            `,
            'note-repeater': html`
                <dashboard-panel 
                    panelId="note-repeater"
                    title="Note Repeater" 
                    size="medium"
                    hasActiveControl
                    .active="${this.noteRepeater.active}"
                    closable
                    @panel-drop=${this.handlePanelDrop}
                    @active-change="${(e: CustomEvent) => this.handleConfigChange(new CustomEvent('config-change', { detail: { 'noteRepeater.active': e.detail.active } }))}">
                    <div class="config-group">
                        <sp-field-label for="pressure-mult">Pressure Multiplier</sp-field-label>
                        <sp-number-field id="pressure-mult" value="${this.noteRepeater.pressureMultiplier}" step="0.1"></sp-number-field>
                        
                        <sp-field-label for="freq-mult">Frequency Multiplier</sp-field-label>
                        <sp-number-field id="freq-mult" value="${this.noteRepeater.frequencyMultiplier}" step="0.1"></sp-number-field>
                    </div>
                </dashboard-panel>
            `,
            'transpose': html`
                <dashboard-panel 
                    panelId="transpose"
                    title="Transpose" 
                    size="small"
                    hasActiveControl
                    .active="${this.transpose.active}"
                    closable
                    @panel-drop=${this.handlePanelDrop}
                    @active-change="${(e: CustomEvent) => this.handleConfigChange(new CustomEvent('config-change', { detail: { 'transpose.active': e.detail.active } }))}">
                    <div class="config-group">
                        <sp-field-label for="transpose-semitones">Semitones</sp-field-label>
                        <sp-number-field id="transpose-semitones" value="${this.transpose.semitones}" step="1"></sp-number-field>
                    </div>
                </dashboard-panel>
            `,
            'stylus-buttons': html`
                <dashboard-panel 
                    panelId="stylus-buttons"
                    title="Stylus Buttons" 
                    size="medium"
                    hasActiveControl
                    .active="${this.stylusButtons.active}"
                    closable
                    @panel-drop=${this.handlePanelDrop}
                    @active-change="${(e: CustomEvent) => this.handleConfigChange(new CustomEvent('config-change', { detail: { 'stylusButtons.active': e.detail.active } }))}">
                    <div class="config-group">
                        <sp-field-label for="primary-action">Primary Button Action</sp-field-label>
                        <sp-picker id="primary-action" value="${this.stylusButtons.primaryButtonAction}">
                            <sp-menu-item value="toggle-transpose">Toggle Transpose</sp-menu-item>
                            <sp-menu-item value="toggle-repeater">Toggle Repeater</sp-menu-item>
                        </sp-picker>
                        
                        <sp-field-label for="secondary-action">Secondary Button Action</sp-field-label>
                        <sp-picker id="secondary-action" value="${this.stylusButtons.secondaryButtonAction}">
                            <sp-menu-item value="toggle-transpose">Toggle Transpose</sp-menu-item>
                            <sp-menu-item value="toggle-repeater">Toggle Repeater</sp-menu-item>
                        </sp-picker>
                    </div>
                </dashboard-panel>
            `,
            'strum-release': html`
                <dashboard-panel 
                    panelId="strum-release"
                    title="Strum Release" 
                    size="medium"
                    hasActiveControl
                    .active="${this.strumRelease.active}"
                    closable
                    @panel-drop=${this.handlePanelDrop}
                    @active-change="${(e: CustomEvent) => this.handleConfigChange(new CustomEvent('config-change', { detail: { 'strumRelease.active': e.detail.active } }))}">
                    <div class="config-group">
                        <sp-field-label for="max-duration">Max Duration</sp-field-label>
                        <sp-number-field id="max-duration" value="${this.strumRelease.maxDuration}" step="0.01"></sp-number-field>
                        
                        <sp-field-label for="velocity-mult">Velocity Multiplier</sp-field-label>
                        <sp-number-field id="velocity-mult" value="${this.strumRelease.velocityMultiplier}" step="0.1"></sp-number-field>
                        
                        <sp-field-label for="midi-note">MIDI Note</sp-field-label>
                        <sp-number-field id="midi-note" value="${this.strumRelease.midiNote}" step="1" min="0" max="127"></sp-number-field>
                        
                        <sp-field-label for="release-channel">MIDI Channel</sp-field-label>
                        <sp-number-field id="release-channel" value="${this.strumRelease.midiChannel}" step="1" min="1" max="16"></sp-number-field>
                    </div>
                </dashboard-panel>
            `
        };
        
        return panels;
    }

    render() {
        const panels = this.getPanels();
        
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>

            <div class="dashboard-grid">
                ${this.panelOrder.map(panelId => panels[panelId])}
            </div>
        </sp-theme>`
    }

}