import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './transpose-controls.css';

import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';

export interface TransposeConfig {
    active: boolean;
    semitones: number;
}

@customElement('transpose-controls')
export class TransposeControls extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config: TransposeConfig = {
        active: false,
        semitones: 12
    };

    private updateConfig(field: string, value: number | boolean) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`transpose.${field}`]: value },
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
                        Enable Transpose
                    </sp-checkbox>
                </div>

                <div class="control-group">
                    <sp-field-label>Semitones</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('semitones', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.semitones}
                        min="-24"
                        max="24"
                        step="1"
                        size="m">
                    </sp-number-field>
                </div>
            </div>
        `;
    }
}

