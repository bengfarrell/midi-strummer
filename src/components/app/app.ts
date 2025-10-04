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

import 'piano-keys-webcomponent-v0';
import { PianoElement } from 'piano-keys-webcomponent-v0/dist/piano';
import { Midi } from '../../utils/midi.js';
import { MidiEvent } from '../../utils/midievent.js';
import { padinput, PadInputEvent } from '../../utils/padinput.js';
import { strummer } from '../../utils/strummer.js';
import { Note, NoteObject } from '../../utils/note.js';

@customElement('strummer-app')
export class StrummerApp extends LitElement {
    static styles = styles;

    @query('piano-keys')
    protected piano?: PianoElement;

    @state()
    protected activated = false;

    protected notes: NoteObject[] = [];

    protected lowerNoteSpread = 2;
    protected upperNoteSpread = 2;

    protected midi: Midi = new Midi();

    constructor() {
        super();
        this.midi.addEventListener(MidiEvent.CONNECTION_EVENT, () => this.requestUpdate());
        this.midi.addEventListener(MidiEvent.NOTE_EVENT, () => {
            this.updateNotes(this.midi.notes.map(note => Note.parseNotation(note)));
        });

        padinput.connect('pointerevents', this.getBoundingClientRect().width, this.getBoundingClientRect().height);
        padinput.addEventListener(PadInputEvent.PAD_INPUT_EVENT, (ev: PadInputEvent) => {
            if (ev.data.state === 'none') {
                strummer.clearStrum();
                return;
            }

            const result = strummer.strum(ev.data.x, ev.data.y, ev.data.pressure, ev.data.tiltX, ev.data.tiltY);
            if (result) this.midi.sendNote(result.note, result.velocity);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        /*this.midi.addListener((evt: { type: 'up' | 'down', note: string, octave: number }) => {
            if (evt.type === 'down') {
                this.piano?.setNoteDown(evt.note, evt.octave);
            }
            if (evt.type === 'up') {
                this.piano?.setNoteUp(evt.note, evt.octave);
            }
            this.updateNotes(this.midi.notes);
            strummer.notes = this.midi.notes;
        });*/
        //padinput.connect('websocket');
    }

    updateNotes(notes: NoteObject[]) {
        this.notes.forEach(note => {
            this.piano?.setNoteUp(note.notation, note.octave);
        });

        this.notes = Note.fillNoteSpread(notes, this.lowerNoteSpread, this.upperNoteSpread);
        this.notes.forEach(note => {
            this.piano?.setNoteDown(note.notation, note.octave);
        });
        strummer.notes = this.notes;
    }

    render() {
        return html`<sp-theme system="spectrum" color="dark" scale="medium">
            <h1>MIDI Strummer</h1>
            <sp-action-button 
                @click=${() => {this.activated = !this.activated}}
                ?selected=${this.activated}>${this.activated ? 'Strumming' : 'Turn on'}
            </sp-action-button>

            <sp-action-button
                @click=${() => {
                    this.updateNotes([{ notation: 'C', octave: 5 }, { notation: 'E', octave: 5 }, { notation: 'G', octave: 5 }]);
                }}>
                C major
            </sp-action-button>

            <sp-field-label>Octave Spread Lower</sp-field-label>
            <sp-number-field 
                @input=${(ev: InputEvent) => {
                    this.lowerNoteSpread = Number((ev.target as HTMLInputElement).value);
                    this.updateNotes(this.notes);
                }}
                label="Octave Spread Lower"
                value=${this.lowerNoteSpread} 
                min="0" max="24" 
                step="1" size="m"></sp-number-field>
            <sp-field-label>Octave Spread Higher</sp-field-label>
            <sp-number-field
                @input=${(ev: InputEvent) => {
                    this.upperNoteSpread = Number((ev.target as HTMLInputElement).value);
                    this.updateNotes(this.notes);
                }}
                label="Octave Spread Higher" 
                value=${this.upperNoteSpread} 
                min="0" max="24" 
                step="1" size="m"></sp-number-field>

            <piano-keys layout="C" keys=20></piano-keys>
            
            <sp-button @click=${() => {
                this.midi.refreshConnection();
            }}>Refresh MIDI Device List
            </sp-button>

            <sp-picker value=${this.midi.currentInput?.id} @change=${(ev: Event) => { this.midi.chooseInput((ev.target as HTMLInputElement).value)}}>
                ${this.midi.inputs.map((input: MIDIInput) => html`<sp-menu-item value=${input.id}>${input.name}</sp-menu-item>`)}
            </sp-picker>
        </sp-theme>`
    }

}