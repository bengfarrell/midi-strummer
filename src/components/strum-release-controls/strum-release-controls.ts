import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './strum-release-controls.css';

import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';

export interface StrumReleaseConfig {
    active: boolean;
    maxDuration: number;
    velocityMultiplier: number;
    midiNote: number;
    midiChannel: number;
}

@customElement('strum-release-controls')
export class StrumReleaseControls extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config: StrumReleaseConfig = {
        active: false,
        maxDuration: 0.25,
        velocityMultiplier: 2,
        midiNote: 38,
        midiChannel: 11
    };

    private updateConfig(field: string, value: number) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`strumRelease.${field}`]: value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="controls-grid">
                <div class="control-group">
                    <sp-field-label>Max Duration (seconds)</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('maxDuration', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.maxDuration}
                        min="0.01"
                        max="5"
                        step="0.01"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Velocity Multiplier</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('velocityMultiplier', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.velocityMultiplier}
                        min="0.1"
                        max="10"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>MIDI Note</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('midiNote', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.midiNote}
                        min="0"
                        max="127"
                        step="1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>MIDI Channel</sp-field-label>
                    <sp-picker 
                        value=${this.config.midiChannel}
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('midiChannel', Number((ev.target as HTMLInputElement).value));
                        }}>
                        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(channel => (
                            html`<sp-menu-item value=${channel}>MIDI Out Channel ${channel}</sp-menu-item>`
                        ))}
                    </sp-picker>
                </div>
            </div>
        `;
    }
}

