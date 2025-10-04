export interface Eventlistener {
    type: string;
    callback: Function;
}

export class EventEmitter {
    protected listeners: Eventlistener[] = [];

    /**
     * Add event listener.
     */
    public addEventListener(type: string, callback: Function): Eventlistener {
        const listener: Eventlistener = { type, callback };
        this.listeners.push(listener);
        return listener;
    }

    /**
     * Remove event listener.
     * @param listener - Event listener to remove.
     */
    public removeEventListener(listener: unknown) {
        for (let c = 0; c < this.listeners.length; c++) {
            if (listener === this.listeners[c]) {
                this.listeners.splice(c, 1);
                return;
            }
        }
    }

    /**
     * Remove event listeners.
     * @param listeners - List of event listeners to remove.
     */
    public removeEventListeners(listeners: Eventlistener[]) {
        listeners.forEach((listener: Eventlistener) => {
            this.removeEventListener(listener);
        });
    }

    /**
     * Trigger event.
     * @param ce - Custom event to dispatch.
     */
    public dispatchEvent(ce: Event) {
        const listeners = this.listeners.slice();
        listeners.forEach(function (l) {
            if (ce.type === l.type) {
                //@ts-ignore
                l.callback.apply(this, [ce]);
            }
        });
    }
}
