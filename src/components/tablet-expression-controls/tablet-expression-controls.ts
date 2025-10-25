import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './tablet-expression-controls.css';

import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';

export interface TabletExpressionConfig {
    min: number;
    max: number;
    default: number;
    multiplier: number;
    curve: number;
    spread: string;
    control: string;
}

@customElement('tablet-expression-controls')
export class TabletExpressionControls extends LitElement {
    static styles = styles;

    @property({ type: String })
    parameterKey = '';

    @property({ type: Object })
    config: TabletExpressionConfig = {
        min: 0,
        max: 1,
        default: 0,
        multiplier: 1.0,
        curve: 1.0,
        spread: 'direct',
        control: 'pressure'
    };

    @property({ type: String })
    minLabel = 'Min';

    @property({ type: String })
    maxLabel = 'Max';

    @property({ type: Number })
    minRange = -10;

    @property({ type: Number })
    maxRange = 10;

    @property({ type: Number })
    minStep = 0.01;

    @property({ type: Number })
    maxStep = 0.01;

    private updateConfig(field: string, value: number | string) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`${this.parameterKey}.${field}`]: value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="controls-grid">
                <div class="control-group">
                    <sp-field-label>${this.minLabel}</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('min', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.min}
                        min=${this.minRange}
                        max=${this.maxRange}
                        step=${this.minStep}
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>${this.maxLabel}</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('max', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.max}
                        min=${this.minRange}
                        max=${this.maxRange}
                        step=${this.maxStep}
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Multiplier</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('multiplier', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.multiplier}
                        min="0.1"
                        max="10"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Curve</sp-field-label>
                    <sp-number-field
                        @input=${(ev: InputEvent) => {
                            this.updateConfig('curve', Number((ev.target as HTMLInputElement).value));
                        }}
                        value=${this.config.curve}
                        min="0.1"
                        max="10"
                        step="0.1"
                        size="m">
                    </sp-number-field>
                </div>

                <div class="control-group">
                    <sp-field-label>Spread Mode</sp-field-label>
                    <sp-picker 
                        value=${this.config.spread}
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('spread', (ev.target as HTMLInputElement).value);
                        }}>
                        <sp-menu-item value="direct">Direct</sp-menu-item>
                        <sp-menu-item value="central">Central</sp-menu-item>
                        <sp-menu-item value="inverse">Inverse</sp-menu-item>
                    </sp-picker>
                </div>

                <div class="control-group">
                    <sp-field-label>Control Source</sp-field-label>
                    <sp-picker 
                        value=${this.config.control}
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('control', (ev.target as HTMLInputElement).value);
                        }}>
                        <sp-menu-item value="yaxis">Y Axis</sp-menu-item>
                        <sp-menu-item value="xaxis">X Axis</sp-menu-item>
                        <sp-menu-item value="pressure">Pressure</sp-menu-item>
                        <sp-menu-item value="tiltXY">Tilt XY</sp-menu-item>
                    </sp-picker>
                </div>
            </div>
        `;
    }
}

