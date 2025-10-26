import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './expression-mappings.css';

import '@spectrum-web-components/tabs/sp-tabs.js';
import '@spectrum-web-components/tabs/sp-tab.js';
import '@spectrum-web-components/tabs/sp-tab-panel.js';

import { TabletExpressionConfig } from '../../types/config-types.js';

@customElement('expression-mappings')
export class ExpressionMappings extends LitElement {
    static styles = styles;

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    noteDuration: TabletExpressionConfig = {
        min: 0.15,
        max: 1.5,
        default: 1,
        multiplier: 1.0,
        curve: 1.0,
        spread: 'central',
        control: 'yaxis'
    };

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    pitchBend: TabletExpressionConfig = {
        min: -1.0,
        max: 1.0,
        default: 0,
        spread: 'direct',
        multiplier: 1.0,
        curve: 4.0,
        control: 'tiltXY'
    };

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    noteVelocity: TabletExpressionConfig = {
        min: 0,
        max: 127,
        spread: 'direct',
        multiplier: 1.0,
        curve: 4.0,
        control: 'pressure',
        default: 64
    };

    @state()
    private selectedTab = 'duration';

    private handleConfigChange(event: CustomEvent) {
        // Bubble the event up to the parent
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: event.detail,
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="expression-mappings">
                <sp-tabs selected=${this.selectedTab} @change=${(e: Event) => {
                    const target = e.target as any;
                    if (target && target.selected) {
                        this.selectedTab = target.selected;
                    }
                }}>
                    <sp-tab label="Note Duration" value="duration"></sp-tab>
                    <sp-tab label="Pitch Bend" value="pitch"></sp-tab>
                    <sp-tab label="Note Velocity" value="velocity"></sp-tab>
                    
                    <sp-tab-panel value="duration">
                        <tablet-expression-controls 
                            parameterKey="noteDuration"
                            .config=${this.noteDuration}
                            minLabel="Min Duration (seconds)"
                            maxLabel="Max Duration (seconds)"
                            minRange="0.01"
                            maxRange="10"
                            minStep="0.01"
                            maxStep="0.01"
                            @config-change=${this.handleConfigChange}>
                        </tablet-expression-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="pitch">
                        <tablet-expression-controls 
                            parameterKey="pitchBend"
                            .config=${this.pitchBend}
                            minLabel="Min Bend"
                            maxLabel="Max Bend"
                            minRange="-8192"
                            maxRange="8191"
                            minStep="0.1"
                            maxStep="0.1"
                            @config-change=${this.handleConfigChange}>
                        </tablet-expression-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="velocity">
                        <tablet-expression-controls 
                            parameterKey="noteVelocity"
                            .config=${this.noteVelocity}
                            minLabel="Min Velocity"
                            maxLabel="Max Velocity"
                            minRange="0"
                            maxRange="127"
                            minStep="1"
                            maxStep="1"
                            @config-change=${this.handleConfigChange}>
                        </tablet-expression-controls>
                    </sp-tab-panel>
                </sp-tabs>
            </div>
        `;
    }
}

