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
import '../config-panel/config-panel.js';
import '../stylus-buttons-config/stylus-buttons-config.js';
import '../tablet-buttons-config/tablet-buttons-config.js';
import '../websocket-connection/websocket-connection.js';
import { PANEL_SCHEMAS } from '../../panel-schemas.js';
import { sharedSettings, sharedTabletInteraction } from '../../controllers/index.js';
import type { ConnectionStatus } from '../websocket-connection/websocket-connection.js';

@customElement('strummer-app')
export class StrummerApp extends LitElement {
    static styles = styles;

    @query('piano-keys')
    protected piano?: PianoElement;

    @state()
    protected notes: NoteObject[] = [];

    protected webSocket?: WebSocket;

    // Settings are now managed by the shared controller
    protected settings = sharedSettings;

    @state()
    protected socketMode: boolean = false;

    @state()
    protected connectionStatus: ConnectionStatus = 'disconnected';

    @state()
    protected connectionError: string = '';

    @state()
    protected stringCount: number = 6;

    @state()
    protected lastPluckedString: number | null = null;

    @state()
    protected pressedButtons: Set<number> = new Set();

    @state()
    protected tabletData: {
        x: number;
        y: number;
        pressure: number;
        tiltX: number;
        tiltY: number;
        tiltXY: number;
        primaryButtonPressed: boolean;
        secondaryButtonPressed: boolean;
    } = {
        x: 0,
        y: 0,
        pressure: 0,
        tiltX: 0,
        tiltY: 0,
        tiltXY: 0,
        primaryButtonPressed: false,
        secondaryButtonPressed: false
    };

    constructor() {
        super();
        // Register this component with the settings controller
        sharedSettings.addHost(this);
    }

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
        'tablet-buttons',
        'strum-release'
    ];

    @state()
    protected panelVisibility: Record<string, boolean> = {
        'drawing-tablet': true,
        'pen-tilt': true,
        'keyboard': true,
        'note-duration': true,
        'pitch-bend': true,
        'note-velocity': true,
        'strumming': true,
        'note-repeater': true,
        'transpose': true,
        'stylus-buttons': true,
        'tablet-buttons': true,
        'strum-release': true
    };

    async connectedCallback() {
        super.connectedCallback();
        
        console.log('🚀 App connected to DOM');
        
        // Check if we're in socket mode
        await this.detectMode();
        
        console.log('✅ Mode detection complete. socketMode:', this.socketMode);
        
        // If not in socket mode, load settings from JSON and connect to WebSocket automatically
        if (!this.socketMode) {
            console.log('📥 Loading settings from JSON (dev mode)');
            await this.loadSettingsIfDev();
            this.connectWebSocket('ws://localhost:8080');
        } else {
            console.log('⏸️  Waiting for user to connect (socket mode)');
        }
    }

    async detectMode() {
        // Read socket mode from injected global config
        const config = (window as any).__MIDI_STRUMMER_CONFIG__;
        
        if (config && config.socketMode === true) {
            console.log('🔧 Socket mode enabled via injected config');
            this.socketMode = true;
        } else {
            console.log('🔧 Dev mode (loading from settings.json)');
            this.socketMode = false;
        }
        
        console.log('   Global config:', config);
    }

    connectWebSocket(address: string) {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        this.connectionStatus = 'connecting';
        this.connectionError = '';

        try {
            this.webSocket = new WebSocket(address);
            
            this.webSocket.onopen = () => {
                this.connectionStatus = 'connected';
                this.connectionError = '';
                console.log('✅ WebSocket connected');
            };

            this.webSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'notes':
                        this.updateNotes(data.notes);
                        // Update string count if provided
                        if (data.stringCount !== undefined) {
                            this.stringCount = data.stringCount;
                        }
                        break;

                    case 'config':
                        // Update settings through the shared controller
                        sharedSettings.loadSettings(data.config);
                        break;

                    case 'string_pluck':
                        // Update which string was plucked
                        this.lastPluckedString = data.string;
                        
                        // Update the shared tablet interaction controller
                        if (this.socketMode) {
                            sharedTabletInteraction.setLastHoveredString(data.string);
                        }
                        
                        // Clear after a short delay
                        setTimeout(() => {
                            if (this.lastPluckedString === data.string) {
                                this.lastPluckedString = null;
                                if (this.socketMode) {
                                    sharedTabletInteraction.setLastHoveredString(null);
                                }
                            }
                        }, 500);
                        break;

                    case 'tablet_button':
                        // Update button pressed state
                        if (data.pressed) {
                            this.pressedButtons = new Set([...this.pressedButtons, data.button]);
                        } else {
                            const newSet = new Set(this.pressedButtons);
                            newSet.delete(data.button);
                            this.pressedButtons = newSet;
                        }
                        
                        // Update the shared tablet interaction controller
                        if (this.socketMode) {
                            sharedTabletInteraction.setTabletButton(data.button, data.pressed);
                        }
                        break;

                    case 'tablet_data':
                        // Update tablet coordinates, pressure, tilt, and stylus buttons
                        this.tabletData = {
                            x: data.x,
                            y: data.y,
                            pressure: data.pressure,
                            tiltX: data.tiltX,
                            tiltY: data.tiltY,
                            tiltXY: data.tiltXY,
                            primaryButtonPressed: data.primaryButtonPressed,
                            secondaryButtonPressed: data.secondaryButtonPressed
                        };
                        
                        // Update the shared tablet interaction controller so curve visualizers react
                        if (this.socketMode) {
                            const isPressed = data.pressure > 0;
                            sharedTabletInteraction.setTabletPosition(data.x, data.y, isPressed);
                            sharedTabletInteraction.setTiltPosition(data.tiltX, data.tiltY, data.pressure, isPressed, data.tiltXY);
                            sharedTabletInteraction.setPrimaryButton(data.primaryButtonPressed);
                            sharedTabletInteraction.setSecondaryButton(data.secondaryButtonPressed);
                        }
                        break;
                }
            };

            this.webSocket.onerror = (error) => {
                this.connectionStatus = 'error';
                this.connectionError = 'Failed to connect to server';
                console.log(`❌ WebSocket error:`, error);
            };

            this.webSocket.onclose = () => {
                if (this.connectionStatus === 'connected') {
                    this.connectionStatus = 'disconnected';
                    this.connectionError = 'Connection closed';
                }
                console.log('WebSocket closed');
            };
        } catch (error) {
            this.connectionStatus = 'error';
            this.connectionError = error instanceof Error ? error.message : 'Connection failed';
            console.error('❌ WebSocket connection error:', error);
        }
    }

    disconnectWebSocket() {
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = undefined;
            this.connectionStatus = 'disconnected';
            this.connectionError = '';
        }
    }

    handleConnect(e: CustomEvent) {
        const { address } = e.detail;
        this.connectWebSocket(address);
    }

    handleDisconnect() {
        this.disconnectWebSocket();
    }

    async loadSettingsIfDev() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                console.log('📋 Loaded settings from /api/settings', settings);
                
                // Load settings into the shared controller
                sharedSettings.loadSettings(settings);
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
        // Update settings through the shared controller
        const detail = event.detail;
        
        console.log('Config change received:', detail);
        
        for (const key in detail) {
            const value = detail[key];
            // Use the controller's path-based update method
            sharedSettings.updateSettingByPath(key, value);
        }
        
        // Also send to server
        this.updateServerConfig(detail);
    }

    private noteToMidiNumber(notation: string, octave: number): number {
        // Convert note notation to MIDI number for sorting
        const noteMap: { [key: string]: number } = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const noteValue = noteMap[notation] ?? 0;
        return (octave + 1) * 12 + noteValue;
    }

    updateNotes(notes: NoteObject[]) {
        // Clear previous notes on piano
        this.notes.forEach(note => {
            this.piano?.setNoteUp(note.notation, note.octave);
        });

        // Sort notes by pitch (MIDI number) and update notes array - force reactivity
        this.notes = [...notes].sort((a, b) => {
            const midiA = this.noteToMidiNumber(a.notation, a.octave);
            const midiB = this.noteToMidiNumber(b.notation, b.octave);
            return midiA - midiB;
        });
        
        // Set new notes on piano
        this.notes.forEach(note => {
            this.piano?.setNoteDown(note.notation, note.octave, note.secondary);
        });
        
        // Force a re-render to update components that depend on notes
        this.requestUpdate();
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

    handlePanelClose(e: CustomEvent) {
        const panel = e.target as any;
        const panelId = panel.panelId;
        
        if (panelId) {
            this.panelVisibility = {
                ...this.panelVisibility,
                [panelId]: false
            };
        }
    }

    togglePanelVisibility(panelId: string) {
        this.panelVisibility = {
            ...this.panelVisibility,
            [panelId]: !this.panelVisibility[panelId]
        };
    }

    /**
     * Renders a custom component based on schema definition
     */
    private renderCustomComponent(panelId: string) {
        const schema = PANEL_SCHEMAS[panelId];
        if (!schema.customComponent) return html``;
        
        const { type, props } = schema.customComponent;
        const settings = sharedSettings.state;
        
        switch (type) {
            case 'tablet-visualizer':
                return html`
                <tablet-visualizer
                        mode="${props.mode}"
                    .socketMode=${this.socketMode}
                    .stringCount=${this.stringCount}
                    .notes=${this.notes}
                    .externalLastPluckedString=${this.lastPluckedString}
                    .externalPressedButtons=${this.pressedButtons}
                    .externalTabletData=${this.tabletData}
                    .noteDuration=${settings.noteDuration}
                    .pitchBend=${settings.pitchBend}
                    .noteVelocity=${settings.noteVelocity}
                    @config-change=${this.handleConfigChange}>
                </tablet-visualizer>
                `;
            
            case 'curve-visualizer':
                const config = schema.configKey ? (settings as any)[schema.configKey] : null;
                return html`
                    <curve-visualizer
                        .label="${props.label}"
                        .parameterKey="${props.parameterKey}"
                        .control="${(config as any)?.control}"
                        .outputLabel="${props.outputLabel}"
                        .config="${config}"
                        .color="${props.color}"
                        @config-change=${this.handleConfigChange}
                        @control-change=${this.handleConfigChange}>
                    </curve-visualizer>
                `;
            
            case 'piano-keys':
                return html`
                    <piano-keys 
                        layout="${props.layout}" 
                        keys=${props.keys}>
                    </piano-keys>
                `;
            
            case 'stylus-buttons-config':
                const stylusConfig = settings.stylusButtons;
                return html`
                    <stylus-buttons-config
                        .config="${stylusConfig}"
                        @config-change=${this.handleConfigChange}>
                    </stylus-buttons-config>
                `;
            
            case 'tablet-buttons-config':
                const tabletButtonsConfig = settings.tabletButtons;
                return html`
                    <tablet-buttons-config
                        .config="${tabletButtonsConfig}"
                        @config-change=${this.handleConfigChange}>
                    </tablet-buttons-config>
                `;
            
            default:
                return html`<div>Unknown component: ${type}</div>`;
        }
    }

    /**
     * Renders a single panel based on schema
     */
    private renderPanel(panelId: string) {
        const schema = PANEL_SCHEMAS[panelId];
        if (!schema) return html``;
        
        // Check visibility
        if (!this.panelVisibility[panelId]) {
            return html``;
        }
        
        // Get config from the settings controller
        const config = schema.configKey ? (sharedSettings.state as any)[schema.configKey] : null;
        const hasActive = schema.hasActiveControl && config && typeof config === 'object' && 'active' in config;
        const isActive = hasActive ? (config as any).active : true;
        
        return html`
            <dashboard-panel 
                panelId="${schema.id}"
                title="${schema.title}"
                size="${schema.size}"
                hasActiveControl="${schema.hasActiveControl}"
                .active="${isActive}"
                closable
                @panel-drop=${this.handlePanelDrop}
                @panel-close=${this.handlePanelClose}
                @active-change="${hasActive ? (e: CustomEvent) => 
                    this.handleConfigChange(new CustomEvent('config-change', { 
                        detail: { [`${schema.configKey}.active`]: e.detail.active } 
                    })) : undefined}">
                
                ${schema.isCustom ? html`
                    <config-panel .isCustom="${true}">
                        ${this.renderCustomComponent(panelId)}
                    </config-panel>
                ` : html`
                    <config-panel
                        .controls="${schema.controls}"
                        .config="${config}"
                        configKey="${schema.configKey}"
                        ?disabled="${!isActive}"
                        @config-change=${this.handleConfigChange}>
                    </config-panel>
                `}
            </dashboard-panel>
        `;
    }

    /**
     * Data-driven panel rendering - all panels rendered from schema
     */
    getPanels() {
        const panels: Record<string, any> = {};
        
        // Generate all panels from schema - fully data-driven
        this.panelOrder.forEach(panelId => {
            panels[panelId] = this.renderPanel(panelId);
        });
        
        return panels;
    }

    /**
     * Renders the panel tray for managing panel visibility
     */
    private renderPanelTray() {
        return html`
            <div class="panel-tray">
                <div class="panel-tray-label">Panels:</div>
                <div class="panel-tray-items">
                    ${this.panelOrder.map(panelId => {
                        const schema = PANEL_SCHEMAS[panelId];
                        const isVisible = this.panelVisibility[panelId];
                        
                        return html`
                            <button 
                                class="panel-tray-item ${isVisible ? 'visible' : 'hidden'}"
                                @click=${() => this.togglePanelVisibility(panelId)}
                                title="${isVisible ? 'Hide' : 'Show'} ${schema.title}">
                                ${schema.title}
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    render() {
        console.log('🎨 Render called - socketMode:', this.socketMode, 'connectionStatus:', this.connectionStatus);
        
        // In socket mode, show connection UI if not connected
        if (this.socketMode && this.connectionStatus !== 'connected') {
            console.log('🔌 Showing connection UI');
            return html`<sp-theme system="spectrum" color="dark" scale="medium">
                <h1>MIDI Strummer</h1>
                <websocket-connection
                    .status="${this.connectionStatus}"
                    .errorMessage="${this.connectionError}"
                    @connect="${this.handleConnect}"
                    @disconnect="${this.handleDisconnect}">
                </websocket-connection>
            </sp-theme>`;
        }

        // Normal mode or connected - show the dashboard
        console.log('📊 Showing dashboard');
        const panels = this.getPanels();
        
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>

            ${this.renderPanelTray()}

            <div class="dashboard-grid">
                ${this.panelOrder.map(panelId => panels[panelId])}
            </div>
        </sp-theme>`
    }

}
