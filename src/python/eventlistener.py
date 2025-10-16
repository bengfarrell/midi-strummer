from typing import List, Callable, Any
from dataclasses import dataclass


@dataclass
class EventListener:
    type: str
    callback: Callable


class EventEmitter:
    def __init__(self):
        self.listeners: List[EventListener] = []

    def add_event_listener(self, event_type: str, callback: Callable) -> EventListener:
        """Add event listener."""
        listener = EventListener(type=event_type, callback=callback)
        self.listeners.append(listener)
        return listener

    def remove_event_listener(self, listener: EventListener) -> None:
        """Remove event listener."""
        if listener in self.listeners:
            self.listeners.remove(listener)

    def remove_event_listeners(self, listeners: List[EventListener]) -> None:
        """Remove event listeners."""
        for listener in listeners:
            self.remove_event_listener(listener)

    def dispatch_event(self, event: Any) -> None:
        """Trigger event."""
        listeners = self.listeners.copy()
        for listener in listeners:
            if event.type == listener.type:
                listener.callback(event)

