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
import { PANEL_SCHEMAS } from '../../panel-schemas.js';
import { sharedSettings } from '../../controllers/index.js';

@customElement('strummer-app')
export class StrummerApp extends LitElement {
    static styles = styles;

    @query('piano-keys')
    protected piano?: PianoElement;

    protected notes: NoteObject[] = [];

    protected webSocket?: WebSocket;

    // Settings are now managed by the shared controller
    protected settings = sharedSettings;

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
                    // Update settings through the shared controller
                    sharedSettings.loadSettings(data.config);
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
