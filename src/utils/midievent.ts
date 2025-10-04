export class MidiEvent extends Event {
    static readonly CONNECTION_EVENT = 'connect';
    static readonly NOTE_EVENT = 'note';

    constructor(eventType: string, initObj?: EventInit) {
        super(eventType, initObj);
    }
}