import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './note-repeater-controls.css';

import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';

export interface NoteRepeaterConfig {
    active: boolean;
    pressureMultiplier: number;
    frequencyMultiplier: number;
}

@customElement('note-repeater-controls')
export class NoteRepeaterControls extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config: NoteRepeaterConfig = {
        active: false,
        pressureMultiplier: 1.0,
        frequencyMultiplier: 5.0
    };

    private updateConfig(field: string, value: number | boolean) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`noteRepeater.${field}`]: value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="controls-grid">
                <div class="control-group">
                    <sp-checkbox
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('active', Boolean((ev.target as HTMLInputElement).checked));
                        }}
                        ?checked=${this.config.active}>
                        Enable Note Repeater
                    </sp-checkbox>
                </div>

                <div class="control-group">
                    <sp-field-label>Pressure Multiplier</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('pressureMultiplier', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.pressureMultiplier}
                        min="0.1"
                        max="10"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Frequency Multiplier</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('frequencyMultiplier', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.frequencyMultiplier}
                        min="0.1"
                        max="20"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>
            </div>
        `;
    }
}

