import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './features.css';

import '@spectrum-web-components/tabs/sp-tabs.js';
import '@spectrum-web-components/tabs/sp-tab.js';
import '@spectrum-web-components/tabs/sp-tab-panel.js';

import '../strumming-controls/strumming-controls.js';
import '../note-repeater-controls/note-repeater-controls.js';
import '../transpose-controls/transpose-controls.js';
import '../stylus-buttons-controls/stylus-buttons-controls.js';
import '../strum-release-controls/strum-release-controls.js';

import { StrummingConfig } from '../strumming-controls/strumming-controls.js';
import { NoteRepeaterConfig } from '../note-repeater-controls/note-repeater-controls.js';
import { TransposeConfig } from '../transpose-controls/transpose-controls.js';
import { StylusButtonsConfig } from '../stylus-buttons-controls/stylus-buttons-controls.js';
import { StrumReleaseConfig } from '../strum-release-controls/strum-release-controls.js';

@customElement('features-panel')
export class FeaturesPanel extends LitElement {
    static styles = styles;

    @property({ type: Object })
    strumming: StrummingConfig = {
        pluckVelocityScale: 4.0,
        pressureThreshold: 0.1,
        midiChannel: 10,
        initialNotes: ['C4', 'E4', 'G4'],
        upperNoteSpread: 3,
        lowerNoteSpread: 3
    };

    @property({ type: Object })
    noteRepeater: NoteRepeaterConfig = {
        active: false,
        pressureMultiplier: 1.0,
        frequencyMultiplier: 5.0
    };

    @property({ type: Object })
    transpose: TransposeConfig = {
        active: false,
        semitones: 12
    };

    @property({ type: Object })
    stylusButtons: StylusButtonsConfig = {
        primaryButtonAction: 'toggle-transpose',
        secondaryButtonAction: 'toggle-repeater'
    };

    @property({ type: Object })
    strumRelease: StrumReleaseConfig = {
        maxDuration: 0.25,
        velocityMultiplier: 2,
        midiNote: 38,
        midiChannel: 11
    };

    @state()
    private selectedTab = 'strumming';

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
            <div class="features">
                <sp-tabs selected=${this.selectedTab} @change=${(e: Event) => {
                    const target = e.target as any;
                    if (target && target.selected) {
                        this.selectedTab = target.selected;
                    }
                }}>
                    <sp-tab label="Strumming" value="strumming"></sp-tab>
                    <sp-tab label="Note Repeater" value="repeater"></sp-tab>
                    <sp-tab label="Transpose" value="transpose"></sp-tab>
                    <sp-tab label="Stylus Buttons" value="buttons"></sp-tab>
                    <sp-tab label="Strum Release" value="release"></sp-tab>
                    
                    <sp-tab-panel value="strumming">
                        <strumming-controls 
                            .config=${this.strumming}
                            @config-change=${this.handleConfigChange}>
                        </strumming-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="repeater">
                        <note-repeater-controls 
                            .config=${this.noteRepeater}
                            @config-change=${this.handleConfigChange}>
                        </note-repeater-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="transpose">
                        <transpose-controls 
                            .config=${this.transpose}
                            @config-change=${this.handleConfigChange}>
                        </transpose-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="buttons">
                        <stylus-buttons-controls 
                            .config=${this.stylusButtons}
                            @config-change=${this.handleConfigChange}>
                        </stylus-buttons-controls>
                    </sp-tab-panel>
                    
                    <sp-tab-panel value="release">
                        <strum-release-controls 
                            .config=${this.strumRelease}
                            @config-change=${this.handleConfigChange}>
                        </strum-release-controls>
                    </sp-tab-panel>
                </sp-tabs>
            </div>
        `;
    }
}

