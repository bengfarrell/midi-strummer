import { NoteObject } from '../utils/note.js';

export class Strummer {
    protected _width: number = 1;
    protected _height: number = 1;
    protected _notes: NoteObject[] = [];

    protected lastX: number = -1;
    protected lastStrummedIndex = -1;

    set notes(notes: NoteObject[]) {
        this._notes = notes;
        this.updateBounds(this._width, this._height);
    }

    strum(x: number, _y: number, pressure: number, _tiltX: number, _tiltY: number) {
        if (this._notes.length > 0) {
            const stringWidth = this._width / this._notes.length;
            const index = Math.min( Math.floor(x / stringWidth), this._notes.length-1);
            this.lastX = x;
            if (this.lastStrummedIndex !== index) {
                this.lastStrummedIndex = index;
                return {
                    note: this._notes[index],
                    velocity: Math.floor(pressure * 127)
                }
            }
        }
        return undefined;
    }

    clearStrum() {
        this.lastStrummedIndex = -1;
    }

    public updateBounds(width: number, height: number) {
        this._width = width;
        this._height = height;
    }
}

export const strummer = new Strummer();