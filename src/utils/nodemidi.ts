import navigator from 'jzz';
import { performance } from "perf_hooks";
import { Midi } from './midi.js';

export class NodeMidi extends Midi {
    // @ts-ignore
    protected performance = performance;
    // @ts-ignore
    protected navigator = navigator;
}
