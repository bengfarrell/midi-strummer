import time
from midi import Midi


class NodeMidi(Midi):
    """Node.js-style MIDI implementation for Python"""
    
    def __init__(self):
        super().__init__()
        # In the original, this used performance.now() - we'll use time.time()
        self.performance = time
        # Navigator was used for web MIDI API - not needed in Python implementation

