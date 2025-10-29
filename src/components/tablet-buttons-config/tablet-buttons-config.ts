import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './tablet-buttons-config.css.js';
import type { ButtonAction, TabletButtonsConfig } from '../../types/config-types.js';

import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/textfield/sp-textfield.js';

/**
 * Action definition with parameter requirements
 */
interface ActionDef {
    value: string;
    label: string;
    params?: Array<{
        key: string;
        label: string;
        type: 'number' | 'text' | 'notes';
        min?: number;
        max?: number;
        step?: number;
        defaultValue?: any;
    }>;
}

interface ButtonState {
    actionName: string;
    params: any[];
}

@customElement('tablet-buttons-config')
export class TabletButtonsConfigComponent extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config?: TabletButtonsConfig;

    @state()
    private buttonStates: Record<string, ButtonState> = {
        '1': { actionName: 'none', params: [] },
        '2': { actionName: 'none', params: [] },
        '3': { actionName: 'none', params: [] },
        '4': { actionName: 'none', params: [] },
        '5': { actionName: 'none', params: [] },
        '6': { actionName: 'none', params: [] },
        '7': { actionName: 'none', params: [] },
        '8': { actionName: 'none', params: [] }
    };

    // Available actions with their parameter definitions
    private readonly actions: ActionDef[] = [
        { value: 'none', label: 'None' },
        { value: 'toggle-repeater', label: 'Toggle Note Repeater' },
        { 
            value: 'transpose', 
            label: 'Transpose',
            params: [{
                key: 'semitones',
                label: 'Semitones',
                type: 'number',
                min: -24,
                max: 24,
                step: 1,
                defaultValue: 12
            }]
        },
        { 
            value: 'set-strum-chord', 
            label: 'Set Strum Chord',
            params: [
                {
                    key: 'chord',
                    label: 'Chord',
                    type: 'text',
                    defaultValue: 'C'
                },
                {
                    key: 'octave',
                    label: 'Octave',
                    type: 'number',
                    min: 0,
                    max: 8,
                    step: 1,
                    defaultValue: 4
                }
            ]
        },
        {
            value: 'set-chord-in-progression',
            label: 'Set Chord in Progression',
            params: [
                {
                    key: 'progression',
                    label: 'Progression',
                    type: 'text',
                    defaultValue: 'c-major-pop'
                },
                {
                    key: 'index',
                    label: 'Index',
                    type: 'number',
                    min: 0,
                    max: 20,
                    step: 1,
                    defaultValue: 0
                },
                {
                    key: 'octave',
                    label: 'Octave',
                    type: 'number',
                    min: 0,
                    max: 8,
                    step: 1,
                    defaultValue: 4
                }
            ]
        },
        {
            value: 'increment-chord-in-progression',
            label: 'Increment Chord Progression',
            params: [
                {
                    key: 'progression',
                    label: 'Progression',
                    type: 'text',
                    defaultValue: 'c-major-pop'
                },
                {
                    key: 'increment',
                    label: 'Increment',
                    type: 'number',
                    min: -10,
                    max: 10,
                    step: 1,
                    defaultValue: 1
                },
                {
                    key: 'octave',
                    label: 'Octave',
                    type: 'number',
                    min: 0,
                    max: 8,
                    step: 1,
                    defaultValue: 4
                }
            ]
        }
    ];

    updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        
        if (changedProperties.has('config') && this.config) {
            // Parse all 8 button actions from config
            for (let i = 1; i <= 8; i++) {
                const buttonKey = String(i) as keyof TabletButtonsConfig;
                const action = this.config[buttonKey];
                this.parseActionFromConfig(action, buttonKey);
            }
        }
    }

    /**
     * Parse an action definition into action name and params
     */
    private parseActionFromConfig(action: ButtonAction, buttonNumber: string) {
        let actionName = 'none';
        let params: any[] = [];

        if (typeof action === 'string') {
            actionName = action;
        } else if (Array.isArray(action) && action.length > 0) {
            actionName = action[0] as string;
            params = action.slice(1);
        }

        this.buttonStates = {
            ...this.buttonStates,
            [buttonNumber]: { actionName, params }
        };
    }

    /**
     * Build action definition from action name and params
     */
    private buildActionDefinition(actionName: string, params: any[]): ButtonAction {
        if (actionName === 'none' || !actionName) {
            return 'none';
        }

        // If no params needed or provided, return just the string
        const actionDef = this.actions.find(a => a.value === actionName);
        if (!actionDef?.params || actionDef.params.length === 0) {
            return actionName;
        }

        // If params exist, return array format
        if (params.length > 0) {
            return [actionName, ...params];
        }

        // Use default params
        const defaultParams = actionDef.params.map(p => p.defaultValue);
        return [actionName, ...defaultParams];
    }

    private handleActionChange(buttonNumber: string, e: Event) {
        const picker = e.target as any;
        const actionName = picker.value;
        
        // Get action definition
        const actionDef = this.actions.find(a => a.value === actionName);
        
        // Initialize with default params if action has parameters
        let params: any[] = [];
        if (actionDef?.params) {
            params = actionDef.params.map(p => p.defaultValue);
        }
        
        this.buttonStates = {
            ...this.buttonStates,
            [buttonNumber]: { actionName, params }
        };
        
        // Emit change event
        this.emitChange(buttonNumber, this.buildActionDefinition(actionName, params));
    }

    private handleParamChange(buttonNumber: string, paramIndex: number, value: any) {
        const state = this.buttonStates[buttonNumber];
        const newParams = [...state.params];
        newParams[paramIndex] = value;
        
        this.buttonStates = {
            ...this.buttonStates,
            [buttonNumber]: { ...state, params: newParams }
        };
        
        // Emit change event
        this.emitChange(buttonNumber, this.buildActionDefinition(state.actionName, newParams));
    }

    private emitChange(buttonNumber: string, action: ButtonAction) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: {
                [`tabletButtons.${buttonNumber}`]: action
            },
            bubbles: true,
            composed: true
        }));
    }

    private renderParamControls(buttonNumber: string) {
        const state = this.buttonStates[buttonNumber];
        if (!state) return html``;
        
        const actionDef = this.actions.find(a => a.value === state.actionName);
        if (!actionDef?.params || actionDef.params.length === 0) {
            return html``;
        }

        return html`
            <div class="param-controls">
                ${actionDef.params.map((paramDef, index) => {
                    const value = state.params[index] ?? paramDef.defaultValue;
                    
                    if (paramDef.type === 'number') {
                        return html`
                            <div class="param-field">
                                <sp-field-label size="s">${paramDef.label}</sp-field-label>
                                <sp-number-field
                                    size="s"
                                    .value="${value}"
                                    min="${paramDef.min ?? ''}"
                                    max="${paramDef.max ?? ''}"
                                    step="${paramDef.step ?? 1}"
                                    @change="${(e: Event) => {
                                        const field = e.target as any;
                                        const val = parseFloat(field.value);
                                        this.handleParamChange(buttonNumber, index, val);
                                    }}">
                                </sp-number-field>
                            </div>
                        `;
                    } else if (paramDef.type === 'text') {
                        return html`
                            <div class="param-field">
                                <sp-field-label size="s">${paramDef.label}</sp-field-label>
                                <sp-textfield
                                    size="s"
                                    .value="${value}"
                                    @change="${(e: Event) => {
                                        const field = e.target as any;
                                        const val = field.value;
                                        this.handleParamChange(buttonNumber, index, val);
                                    }}">
                                </sp-textfield>
                            </div>
                        `;
                    }
                    return html``;
                })}
            </div>
        `;
    }

    private renderButton(buttonNumber: string) {
        const state = this.buttonStates[buttonNumber];
        if (!state) return html``;

        return html`
            <div class="button-config">
                <sp-field-label size="m">Button ${buttonNumber}</sp-field-label>
                <sp-picker
                    size="s"
                    .value="${state.actionName}"
                    @change="${(e: Event) => this.handleActionChange(buttonNumber, e)}">
                    ${this.actions.map(action => html`
                        <sp-menu-item value="${action.value}">${action.label}</sp-menu-item>
                    `)}
                </sp-picker>
                ${this.renderParamControls(buttonNumber)}
            </div>
        `;
    }

    render() {
        if (!this.config) return html``;

        return html`
            <div class="config-section">
                <div class="button-grid">
                    ${['1', '2', '3', '4', '5', '6', '7', '8'].map(num => 
                        this.renderButton(num)
                    )}
                </div>
            </div>
        `;
    }
}

