import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './stylus-buttons-controls.css';

import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';

export interface StylusButtonsConfig {
    primaryButtonAction: string;
    secondaryButtonAction: string;
}

@customElement('stylus-buttons-controls')
export class StylusButtonsControls extends LitElement {
    static styles = styles;

    @property({ type: Object })
    config: StylusButtonsConfig = {
        primaryButtonAction: 'toggle-transpose',
        secondaryButtonAction: 'toggle-repeater'
    };

    private updateConfig(field: string, value: string) {
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { [`stylusButtons.${field}`]: value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="controls-grid">
                <div class="control-group">
                    <sp-field-label>Primary Button Action</sp-field-label>
                    <sp-picker 
                        value=${this.config.primaryButtonAction}
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('primaryButtonAction', (ev.target as HTMLInputElement).value);
                        }}>
                        <sp-menu-item value="toggle-transpose">Toggle Transpose</sp-menu-item>
                        <sp-menu-item value="toggle-repeater">Toggle Repeater</sp-menu-item>
                        <sp-menu-item value="none">None</sp-menu-item>
                    </sp-picker>
                </div>

                <div class="control-group">
                    <sp-field-label>Secondary Button Action</sp-field-label>
                    <sp-picker 
                        value=${this.config.secondaryButtonAction}
                        @change=${(ev: InputEvent) => {
                            this.updateConfig('secondaryButtonAction', (ev.target as HTMLInputElement).value);
                        }}>
                        <sp-menu-item value="toggle-transpose">Toggle Transpose</sp-menu-item>
                        <sp-menu-item value="toggle-repeater">Toggle Repeater</sp-menu-item>
                        <sp-menu-item value="none">None</sp-menu-item>
                    </sp-picker>
                </div>
            </div>
        `;
    }
}

