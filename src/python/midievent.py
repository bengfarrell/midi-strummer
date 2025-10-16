class MidiEvent:
    CONNECTION_EVENT = 'connect'
    NOTE_EVENT = 'note'

    def __init__(self, event_type: str):
        self.type = event_type

