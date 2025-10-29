import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './stylus-buttons-config.css.js';
import type { ButtonAction, StylusButtonsConfig } from '../../types/config-types.js';

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

@customElement('stylus-buttons-config')
export class StylusButtonsConfigComponent extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config?: StylusButtonsConfig;

    @state()
    private primaryActionName: string = 'none';

    @state()
    private primaryActionParams: any[] = [];

    @state()
    private secondaryActionName: string = 'none';

    @state()
    private secondaryActionParams: any[] = [];

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
                    label: 'Chord (e.g., C, Gm, Am7)',
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
                    label: 'Progression Name',
                    type: 'text',
                    defaultValue: 'c-major-pop'
                },
                {
                    key: 'index',
                    label: 'Chord Index',
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
            label: 'Increment Chord in Progression',
            params: [
                {
                    key: 'progression',
                    label: 'Progression Name',
                    type: 'text',
                    defaultValue: 'c-major-pop'
                },
                {
                    key: 'increment',
                    label: 'Increment Amount',
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
            this.parseActionFromConfig(this.config.primaryButtonAction, 'primary');
            this.parseActionFromConfig(this.config.secondaryButtonAction, 'secondary');
        }
    }

    /**
     * Parse an action definition into action name and params
     */
    private parseActionFromConfig(action: ButtonAction, button: 'primary' | 'secondary') {
        let actionName = 'none';
        let params: any[] = [];

        if (typeof action === 'string') {
            actionName = action;
        } else if (Array.isArray(action) && action.length > 0) {
            actionName = action[0] as string;
            params = action.slice(1);
        }

        if (button === 'primary') {
            this.primaryActionName = actionName;
            this.primaryActionParams = params;
        } else {
            this.secondaryActionName = actionName;
            this.secondaryActionParams = params;
        }
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

    private handlePrimaryActionChange(e: Event) {
        const picker = e.target as any;
        const actionName = picker.value;
        
        // Get action definition
        const actionDef = this.actions.find(a => a.value === actionName);
        
        // Initialize with default params if action has parameters
        let params: any[] = [];
        if (actionDef?.params) {
            params = actionDef.params.map(p => p.defaultValue);
        }
        
        this.primaryActionName = actionName;
        this.primaryActionParams = params;
        
        // Emit change event
        this.emitChange('primaryButtonAction', this.buildActionDefinition(actionName, params));
    }

    private handleSecondaryActionChange(e: Event) {
        const picker = e.target as any;
        const actionName = picker.value;
        
        // Get action definition
        const actionDef = this.actions.find(a => a.value === actionName);
        
        // Initialize with default params if action has parameters
        let params: any[] = [];
        if (actionDef?.params) {
            params = actionDef.params.map(p => p.defaultValue);
        }
        
        this.secondaryActionName = actionName;
        this.secondaryActionParams = params;
        
        // Emit change event
        this.emitChange('secondaryButtonAction', this.buildActionDefinition(actionName, params));
    }

    private handlePrimaryParamChange(paramIndex: number, value: any) {
        const newParams = [...this.primaryActionParams];
        newParams[paramIndex] = value;
        this.primaryActionParams = newParams;
        
        // Emit change event
        this.emitChange('primaryButtonAction', this.buildActionDefinition(this.primaryActionName, newParams));
    }

    private handleSecondaryParamChange(paramIndex: number, value: any) {
        const newParams = [...this.secondaryActionParams];
        newParams[paramIndex] = value;
        this.secondaryActionParams = newParams;
        
        // Emit change event
        this.emitChange('secondaryButtonAction', this.buildActionDefinition(this.secondaryActionName, newParams));
    }

    private emitChange(field: string, value: any) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: {
                [`stylusButtons.${field}`]: value
            },
            bubbles: true,
            composed: true
        }));
    }

    private renderParamControls(button: 'primary' | 'secondary') {
        const actionName = button === 'primary' ? this.primaryActionName : this.secondaryActionName;
        const params = button === 'primary' ? this.primaryActionParams : this.secondaryActionParams;
        
        const actionDef = this.actions.find(a => a.value === actionName);
        if (!actionDef?.params || actionDef.params.length === 0) {
            return html``;
        }

        return html`
            <div class="param-controls">
                ${actionDef.params.map((paramDef, index) => {
                    const value = params[index] ?? paramDef.defaultValue;
                    
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
                                        if (button === 'primary') {
                                            this.handlePrimaryParamChange(index, val);
                                        } else {
                                            this.handleSecondaryParamChange(index, val);
                                        }
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
                                        if (button === 'primary') {
                                            this.handlePrimaryParamChange(index, val);
                                        } else {
                                            this.handleSecondaryParamChange(index, val);
                                        }
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

    render() {
        if (!this.config) return html``;

        return html`
            <div class="config-section">
                <div class="button-config">
                    <sp-field-label size="m">Primary Button Action</sp-field-label>
                    <sp-picker
                        size="m"
                        .value="${this.primaryActionName}"
                        @change="${this.handlePrimaryActionChange}">
                        ${this.actions.map(action => html`
                            <sp-menu-item value="${action.value}">${action.label}</sp-menu-item>
                        `)}
                    </sp-picker>
                    ${this.renderParamControls('primary')}
                </div>

                <div class="button-config">
                    <sp-field-label size="m">Secondary Button Action</sp-field-label>
                    <sp-picker
                        size="m"
                        .value="${this.secondaryActionName}"
                        @change="${this.handleSecondaryActionChange}">
                        ${this.actions.map(action => html`
                            <sp-menu-item value="${action.value}">${action.label}</sp-menu-item>
                        `)}
                    </sp-picker>
                    ${this.renderParamControls('secondary')}
                </div>
            </div>
        `;
    }
}

