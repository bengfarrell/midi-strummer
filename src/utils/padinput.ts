import { EventEmitter } from './eventlistener.js';

export class PadInputEvent extends Event {
    static PAD_INPUT_EVENT = 'padinput';
    constructor(public data: any, initObj?: EventInit) {
        super(PadInputEvent.PAD_INPUT_EVENT, initObj);
    }
}

class PadInput extends EventEmitter {
    connect(method: 'websocket' | 'pointerevents', width: number = 1, height: number = 1) {
        if (method === 'pointerevents') {
            document.body.addEventListener('pointermove', (event: PointerEvent) => {
                this.dispatchEvent(new PadInputEvent({ x: event.clientX / width, y: event.clientY / height, pressure: event.pressure }));
            });

            document.body.addEventListener('pointerdown', (event: PointerEvent) => {
                this.dispatchEvent(new PadInputEvent({ x: event.clientX / width, y: event.clientY / height, pressure: event.pressure }));
            });

            document.body.addEventListener('pointerup', () => {
                this.dispatchEvent(new PadInputEvent({ pressure: 0, state: "none" }));
            });
        } else if (method === 'websocket') {
            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                console.log('Connected to server');
            };
            ws.onmessage = (event) => {
                const json = JSON.parse(event.data);
                this.dispatchEvent(new PadInputEvent({
                    x: json.x, y: json.y,
                    pressure: json.pressure,
                    tiltX: json.tiltX, tiltY: json.tiltY }));
            };

        }
    }
}

export const padinput = new PadInput();