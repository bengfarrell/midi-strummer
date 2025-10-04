import { Note, NoteObject } from './note.js';
import { MidiEvent } from './midievent.js';
import { EventEmitter } from './eventlistener.js';

export class Midi extends EventEmitter {
    protected midi?: MIDIAccess;

    protected navigator = undefined;
    protected performance = undefined;

    protected outs: MIDIOutput[] = [];

    protected _inputs: MIDIInput[] = [];

    protected _currentInputID?: string;

    protected _notes: string[] = [];

    get currentInput() {
        return this._inputs.find((i) => i.id === this._currentInputID);
    }

    get notes() {
        return this._notes;
    }

    get inputs() {
        if (this.midi) {
            return this._inputs;
        }
        return [];
    }

    refreshConnection(midiInputID?: string) {
        (this.navigator ?? navigator).requestMIDIAccess().then( midi => {
            this.outs = [];

            for (const out of midi.outputs.values()) {
                this.outs.push(out as MIDIOutput);
            }
            this.midi = midi as MIDIAccess;
            this._inputs = [];
            this._inputs = Array.from(midi.inputs.values()) as MIDIInput[];
            if (this._inputs.length > 0) {
                this.chooseInput(midiInputID ?? this._inputs[0].id);
            }
            this.dispatchEvent(new MidiEvent(MidiEvent.CONNECTION_EVENT));
        }, (errmsg) => {
            console.warn('Failed to get MIDI access - ' + errmsg );
        } );
    }

    sendNote(note: NoteObject, velocity: number) {
        if (this.outs) {
            for (const output of this.outs) {
                const midiNote = Note.notationToMIDI(note.notation + note.octave);
                const noteOnMessage = [0x90, midiNote, velocity];
                const noteOffMessage = [0x80, midiNote, 0x40];
                output.send(noteOnMessage);
                output.send(noteOffMessage, (this.performance ?? performance).now() + 700);
            }
        }
    }

    onNoteDown(notation: string, octave: number) {
        const indx = this._notes.indexOf(notation + octave);
        if (indx === -1) {
            this._notes.push(notation + octave);
            this._notes = Note.sort(this._notes);
            this.dispatchEvent(new MidiEvent(MidiEvent.NOTE_EVENT));
        }
    }

    onNoteUp(notation: string, octave: number) {
        const indx = this._notes.indexOf(notation + octave);
        if (indx !== -1) {
            this._notes.splice(indx, 1);
            this._notes = Note.sort(this._notes);
            this.dispatchEvent(new MidiEvent(MidiEvent.NOTE_EVENT));
        }
    }

    chooseInput(id: string) {
        if (this.midi) {
            this.midi.inputs.forEach(item => {
                if (item.id === id) {
                    this._currentInputID = id;
                    this.dispatchEvent(new MidiEvent(MidiEvent.CONNECTION_EVENT));
                    item.onmidimessage = (event: Event) => {
                        //const data = (event as MIDIMessageEvent).data;
                        //const type = data[0] & 0xf0;
                        //const note = data[1];
                        const [command, note, velocity] = (event as MIDIMessageEvent).data;
                        const notation = [ ...Note.sharpNotations, ...Note.sharpNotations][(note % Note.sharpNotations.length)];
                        const octave = Math.floor(note / Note.sharpNotations.length) - 1;
                        // const velocity = data[2];
                        switch (command) {
                            case 144: // noteOn message
                                //data.type = 'on';
                                if (velocity > 0) {
                                    this.onNoteDown(notation, octave)
                                } else {
                                    this.onNoteUp(notation, octave)
                                }
                                break;
                            /*case 128: // noteOff message
                                //data.type = 'off';
                                this.onNoteUp(notation, octave)
                                break;*/
                        }
                    };
                }
            });
        }
    }
}
