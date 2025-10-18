import { html, LitElement } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { styles } from './app.css';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
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
            if (data.type === 'notes') this.updateNotes(data.notes);
        };

        this.webSocket.onerror = (_error) => {
            //log(`❌ WebSocket error: ${error}`);
        };

        this.webSocket.onclose = () => {
            //log('🔌 Connection closed');
            //updateStatus(false);
            //updateNotes([]);
        };
    }

    updateNotes(notes: NoteObject[]) {
        this.notes.forEach(note => {
            this.piano?.setNoteUp(note.notation, note.octave);
        });

        this.notes = notes;
        this.notes.forEach(note => {
            console.log('down', note.notation, note.octave);
            this.piano?.setNoteDown(note.notation, note.octave, note.secondary);
        });
    }

    render() {
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>

            <sp-action-button
                @click=${() => {
                    this.updateNotes([{ notation: 'C', octave: 5 }, { notation: 'E', octave: 5 }, { notation: 'G', octave: 5 }]);
                }}>
                C major
            </sp-action-button>

            <sp-field-label>Octave Spread Lower</sp-field-label>
            <sp-number-field 
                @input=${(_ev: InputEvent) => {
                    //this.lowerNoteSpread = Number((ev.target as HTMLInputElement).value);
                    //this.updateNotes(this.notes);
                }}
                label="Octave Spread Lower"
                value=${this.lowerNoteSpread} 
                min="0" max="24" 
                step="1" size="m"></sp-number-field>
            <sp-field-label>Octave Spread Higher</sp-field-label>
            <sp-number-field
                @input=${(_ev: InputEvent) => {
                    //this.upperNoteSpread = Number((ev.target as HTMLInputElement).value);
                    //this.updateNotes(this.notes);
                }}
                label="Octave Spread Higher" 
                value=${this.upperNoteSpread} 
                min="0" max="24" 
                step="1" size="m"></sp-number-field>

            <piano-keys layout="C" keys=20></piano-keys>
            
            <sp-button @click=${() => {
                //this.midi.refreshConnection();
            }}>Refresh MIDI Device List
            </sp-button>
        </sp-theme>`
    }

}