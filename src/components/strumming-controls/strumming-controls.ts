import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './strumming-controls.css';

import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';

export interface StrummingConfig {
    pluckVelocityScale: number;
    pressureThreshold: number;
    midiChannel: number;
    initialNotes: string[];
    upperNoteSpread: number;
    lowerNoteSpread: number;
}

@customElement('strumming-controls')
export class StrummingControls extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config: StrummingConfig = {
        pluckVelocityScale: 4.0,
        pressureThreshold: 0.1,
        midiChannel: 10,
        initialNotes: ['C4', 'E4', 'G4'],
        upperNoteSpread: 3,
        lowerNoteSpread: 3
    };

    private updateConfig(field: string, value: number | string | undefined) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`strumming.${field}`]: value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="controls-grid">
                <div class="control-group">
                    <sp-field-label>Octave Spread Lower</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('lowerNoteSpread', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.lowerNoteSpread}
                        min="0"
                        max="24"
                        step="1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Octave Spread Higher</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('upperNoteSpread', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.upperNoteSpread}
                        min="0"
                        max="24"
                        step="1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Pluck Velocity Scale</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('pluckVelocityScale', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.pluckVelocityScale}
                        min="0.1"
                        max="10"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Pressure Threshold</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('pressureThreshold', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.pressureThreshold}
                        min="0"
                        max="1"
                        step="0.01"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Strum Channel</sp-field-label>
                    <sp-picker 
                        value=${this.config.midiChannel}
                        @change=${(ev: InputEvent) => {
                            const val = Number((ev.target as HTMLInputElement).value);
                            this.updateConfig('midiChannel', val === -1 ? undefined : val);
                        }}>
                        <sp-menu-item value="-1">Send on all channels</sp-menu-item>
                        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(channel => (
                            html`<sp-menu-item value=${channel}>MIDI Out Channel ${channel}</sp-menu-item>`
                        ))}
                    </sp-picker>
                </div>
            </div>
        `;
    }
}

