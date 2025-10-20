import { html, LitElement } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { styles } from './app.css';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/theme-dark.js';

import '../piano/piano.js';
import { PianoElement } from '../piano/piano.js';
import { NoteObject } from '../../utils/note.js';

@customElement('strummer-app')
export class StrummerApp extends LitElement {
    static styles = styles;

    @query('piano-keys')
    protected piano?: PianoElement;

    protected notes: NoteObject[] = [];

    protected webSocket?: WebSocket;

    @state()
    protected lowerNoteSpread = 2;

    @state()
    protected upperNoteSpread = 2;

    @state()
    protected midiStrumChannel = -1;

    @state()
    protected noteUpOnRelease:boolean = false;

    @state()
    protected allowPitchBend:boolean = false;

    connectedCallback() {
        super.connectedCallback();
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) return;
        this.webSocket = new WebSocket('ws://localhost:8080');
        this.webSocket.onopen = () => {
            //updateStatus(true);
            console.log('WebSocket opened');
        };

        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'notes':
                    this.updateNotes(data.notes);
                    break;

                case 'config':
                    const config = data.config;
                    if (config.upperNoteSpread) {
                        this.upperNoteSpread = config.upperNoteSpread;
                    }
                    if (config.lowerNoteSpread) {
                        this.lowerNoteSpread = config.lowerNoteSpread;
                    }
                    if (config.noteUpOnRelease) {
                        this.noteUpOnRelease = Boolean(config.noteUpOnRelease);
                    }
                    if (config.midiStrumChannel) {
                        this.midiStrumChannel = config.midiStrumChannel;
                    }
                    if (config.allowPitchBend) {
                        this.allowPitchBend = config.allowPitchBend;
                    }
                    break;
            }
        };

        this.webSocket.onerror = (error) => {
            console.log(`❌ WebSocket error: ${error}`);
        };

        this.webSocket.onclose = () => {
            console.log('WebSocket closed');
        };
    }

    updateServerConfig(data: any) {
        const json = JSON.stringify(data);
        this.webSocket?.send(json);
    }

    updateNotes(notes: NoteObject[]) {
        this.notes.forEach(note => {
            this.piano?.setNoteUp(note.notation, note.octave);
        });

        this.notes = notes;
        this.notes.forEach(note => {
            this.piano?.setNoteDown(note.notation, note.octave, note.secondary);
        });
    }

    render() {
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>

            <piano-keys layout="C" keys=20></piano-keys>
            
            <div class="controls">
                <sp-field-label>Octave Spread Lower</sp-field-label>
                <sp-number-field 
                    @input=${(ev: InputEvent) => {
                        this.updateServerConfig( { lowerNoteSpread: Number((ev.target as HTMLInputElement).value) });
                    }}
                    label="Octave Spread Lower"
                    value=${this.lowerNoteSpread} 
                    min="0" max="24" 
                    step="1" size="m"></sp-number-field>
                <sp-field-label>Octave Spread Higher</sp-field-label>
                <sp-number-field
                    @input=${(ev: InputEvent) => {
                        this.updateServerConfig( { upperNoteSpread: Number((ev.target as HTMLInputElement).value) });
                    }}
                    label="Octave Spread Higher" 
                    value=${this.upperNoteSpread} 
                    min="0" max="24" 
                    step="1" size="m"></sp-number-field>
    
                <sp-field-label>Strum Channel</sp-field-label>
                <sp-picker value=${this.midiStrumChannel} @change=${(ev: InputEvent) => {
                    const val = Number((ev.target as HTMLInputElement).value);
                            this.updateServerConfig( { midiStrumChannel: val === -1 ? undefined : val });
                        }}>
                        <sp-menu-item value=-1>Send on all channels</sp-menu-item>
                        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(channel => (
                    html`<sp-menu-item value=${channel}>MIDI Out Channel ${channel}</sp-menu-item>`
                ))}
                </sp-picker>
                
                <sp-checkbox @change=${(ev: InputEvent) => {
                    this.updateServerConfig( { noteUpOnRelease: Boolean((ev.target as HTMLInputElement).value) });
                }} ?checked=${this.noteUpOnRelease}>Release note on pen up</sp-checkbox>
    
                <sp-checkbox @change=${(ev: InputEvent) => {
                    this.updateServerConfig( { allowPitchBend: Boolean((ev.target as HTMLInputElement).value) });
                }} ?checked=${this.allowPitchBend}>Allow pitch bending</sp-checkbox>
            </div>
        </sp-theme>`
    }

}