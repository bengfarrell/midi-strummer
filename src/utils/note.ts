export type NoteObject = { notation: string, octave: number, secondary?: boolean };

/**
 * Note static class
 */
export const Note = {
    /** cached keysignature lookup table */
    keys: {},

    commonNotations: ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],

    /**
     * incremental tones as sharp notation
     * @const
     * @static
     * @type {Array.<string>}
     **/
    sharpNotations: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

    /**
     * incremental tones as flat notation
     * @const
     * @static
     * @type {Array.<string>}
     **/
    flatNotations: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],

    /**
     * get notation index when notation is either flat or sharp
     * @param notation
     */
    indexOfNotation(notation: string) {
        let index = this.sharpNotations.indexOf(notation);
        if (index === -1) {
            index = this.flatNotations.indexOf(notation);
        }
        return index;
    },

    /**
     * get notation given an index
     */
    notationAtIndex(index: number, preferFlat?: boolean) {
        if (index >= this.sharpNotations.length) {
            index = index % this.sharpNotations.length;
        }

        if (preferFlat) {
            return this.flatNotations[index];
        } else {
            return this.sharpNotations[index];
        }
    },

    /**
     * odd notations
     * @const
     * @static
     * @type {Array.<string>}
     **/
    oddNotations: ["B#", "Cb", "E#", "Fb"],

    /**
     * corrected notations
     * @const
     * @static
     * @type {Array.<string>}
     **/
    correctedNotations: ["C", "C", "F", "F"],

    /**
     * translate index from MIDI to notation
     * @param index
     * @constructor
     */
    MIDItoNotation(index: number) {
        var position = index % this.sharpNotations.length;
        return this.sharpNotations[position];
    },

    /**
     * translate notation and octave to MIDI index
     * @param notation
     */
    notationToMIDI(notation: string) {
        const ntObj = this.parseNotation(notation);
        var ntindx = this.sharpNotations.indexOf(ntObj.notation);
        if (ntindx === -1) {
            ntindx = this.flatNotations.indexOf(ntObj.notation);
        }
        return Number(ntObj.octave) * this.sharpNotations.length + ntindx;
    },

    sort(notes: string[]) {
        return notes.sort((noteA, noteB) => {
            const octaveA = noteA.charAt(noteA.length - 1);
            const octaveB = noteB.charAt(noteB.length - 1);
            if (octaveA !== octaveB) {
                return Number(noteA.charAt(noteA.length - 1)) - Number(noteB.charAt(noteB.length - 1));
            }
            return Note.sharpNotations.indexOf(noteA.substr(0, noteA.length -1)) - Note.sharpNotations.indexOf(noteB.substr(0, noteB.length -1));
        });
    },

    /**
     * parse notation to notation and octave
     * @param notation
     */
    parseNotation(notation: string) {
        const note: { notation?: string, octave?: number} = {};
        // only supports one digit octaves (if thats even a real issue)
        const octave = notation.charAt(notation.length-1);
        // @ts-ignore
        if (parseInt(octave) == octave) {
            note.octave = Number(octave);
            if (notation.length === 3) {
                note.notation = notation.charAt(0) + notation.charAt(1)
            } else {
                note.notation = notation.charAt(0);
            }

        } else {
            note.octave = 4; // default
            note.notation = notation;
        }

        return note as NoteObject;
    },

    /**
     * turn a notation into a frequency
     */
    getFrequencyForNotation(nt: string) {
        var octave = 4;

        // does notation include the octave?
        if ( !isNaN( parseInt(nt.charAt(nt.length -1)) )) {
            octave = parseInt(nt.charAt(nt.length -1));
            nt = nt.substr(0, nt.length-1);
        }

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(nt) != -1) {
            nt = this.correctedNotations[this.oddNotations.indexOf(nt)];
        }

        let freq;
        let indx = this.sharpNotations.indexOf(nt);

        if (indx == -1) {
            indx = this.flatNotations.indexOf(nt);
        }

        if (indx != -1) {
            indx += (octave-4) * this.sharpNotations.length;
            freq = 440 * (Math.pow(2, indx/12));
        }
        return freq;
    },

    /**
     * get notes in a specific key signature
     */
    notesInKeySignature(key: string, major: boolean, octave?: number) {
        let notesToIndex;
        let notesInKey = [];
        let startPos;
        key = key.toUpperCase();

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(key) != -1) {
            key = this.correctedNotations[this.oddNotations.indexOf(key)];
        }

        // find the correct note and notation
        if (this.sharpNotations.indexOf(key) != -1) {
            notesToIndex = this.sharpNotations.slice();
            startPos = this.sharpNotations.indexOf(key);
        } else {
            notesToIndex = this.flatNotations.slice();
            startPos = this.flatNotations.indexOf(key);
        }

        // double the array length
        var len = notesToIndex.length;
        for (let c = 0; c < len; c++ ) {
            if (octave) {
                notesToIndex.push(notesToIndex[c] + (octave+1));
            } else {
                notesToIndex.push(notesToIndex[c]);
            }
        }

        // add octave notation to the first half of the array
        if (octave) {
            for (let c = 0; c < this.flatNotations.length; c++) {
                notesToIndex[c] += octave;
            }
        }
        // chop off the front of the array to start at the root key in the key signature
        notesToIndex.splice(0, startPos);

        // build the key signature
        if (major) {
            // MAJOR From root: whole step, whole step, half step, whole step, whole step, whole step, half step
            notesInKey.push( notesToIndex[0] );
            notesInKey.push( notesToIndex[2] );
            notesInKey.push( notesToIndex[4] );
            notesInKey.push( notesToIndex[5] );
            notesInKey.push( notesToIndex[7] );
            notesInKey.push( notesToIndex[9] );
            notesInKey.push( notesToIndex[11] );
        } else {
            // MINOR From root: whole step, half step, whole step, whole step, half step, whole step, whole step
            notesInKey.push( notesToIndex[0] );
            notesInKey.push( notesToIndex[2] );
            notesInKey.push( notesToIndex[3] );
            notesInKey.push( notesToIndex[5] );
            notesInKey.push( notesToIndex[7] );
            notesInKey.push( notesToIndex[8] );
            notesInKey.push( notesToIndex[10] );
        }
        return notesInKey;
    },

    /**
     * pregenerate a key signature lookup table for every note
     */
    generateKeySignatureLookup() {
        const kys = this.sharpNotations;
        for (var c = 0; c < kys.length; c++) {

            // @ts-ignore
            this.keys[kys[c]] = this.notesInKeySignature(kys[c], true);

            // @ts-ignore
            this.keys[kys[c] + 'm'] = this.notesInKeySignature(kys[c], false);
        }
    },

    fillNoteSpread(notes: NoteObject[], lowerSpread: number = 0, upperSpread: number = 0) {
        const upper = [];
        for (let c = 0; c < upperSpread; c++) {
            const noteIndex = Math.floor(c % notes.length);
            const octaveIncrease = Math.floor(c / notes.length);
            upper.push({ notation: notes[noteIndex].notation, octave: notes[noteIndex].octave + octaveIncrease + 1 });
        }

        const lower = [];
        for (let c = 0; c < lowerSpread; c++) {
            const noteIndex = Math.floor(c % notes.length);
            const octaveDecrease = Math.floor(c / notes.length);
            lower.push({ notation: notes[notes.length - 1 - noteIndex].notation, octave: notes[notes.length - 1 - noteIndex].octave - octaveDecrease - 1 });
        }

        return [ ...lower, ...notes, ...upper ];
    }
};
