import fs from 'fs';
//import { SocketServer } from './socketserver.js';
import { getTabletDevice } from './finddevice.js';
import { parseCode, parseRangeData, parseWrappedRangeData } from './datahelpers.js';
import { strummer } from '../utils/strummer.js';
import { NodeMidi } from '../utils/nodemidi.js';
import { MidiEvent } from '../utils/midievent.js';
import { Note } from '../utils/note.js';

const cfg = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
if (cfg.initialNotes)
    strummer.notes = Note.fillNoteSpread(cfg.initialNotes.map((n: string) =>
        Note.parseNotation(n)), cfg.lowerNoteSpread, cfg.upperNoteSpread);
const midi = new NodeMidi();
midi.addEventListener(MidiEvent.NOTE_EVENT, () => {
    strummer.notes = Note.fillNoteSpread(midi.notes.map((n: string) =>
        Note.parseNotation(n)), cfg.lowerNoteSpread, cfg.upperNoteSpread);
});
midi.refreshConnection(cfg.midiInputId);

const device = getTabletDevice(cfg.device);
//const sockets = new SocketServer();
//sockets.start();

device?.on('data', data => {
    const result: { [key: string]: string | number } = {};
    Object.keys(cfg.mappings).forEach(key => {
        switch(cfg.mappings[key]['type']) {
            case 'range':
                result[key] = parseRangeData(data, cfg.mappings[key]['byteIndex'], cfg.mappings[key]['min'], cfg.mappings[key]['max'] );
                break;

            case 'wrapped-range':
                result[key] = parseWrappedRangeData(data, cfg.mappings[key]['byteIndex'], cfg.mappings[key]['positiveMin'], cfg.mappings[key]['positiveMax'], cfg.mappings[key]['negativeMin'], cfg.mappings[key]['negativeMax'] );
                break;

            case 'code':
                Object.assign(result, parseCode(data, cfg.mappings[key]['byteIndex'], cfg.mappings[key]['values']));
        }
    });
    const strum = strummer.strum(result.x as number, result.y as number, result.pressure as number, result.tiltX as number, result.tiltY as number);
    if (strum) midi.sendNote(strum.note, strum.velocity);
    console.log(strum?.note);
    //sockets.sendMessage(JSON.stringify(result));
});

device?.on('error', function(err) {
    console.log("error:",err);
});

process.on('exit', (code) => {
    console.log(`Process is about to exit with code: ${code}`);
    device?.close();
});
