import asyncio
import websockets
from typing import Set
import json


class SocketServer:
    def __init__(self):
        self.sockets: Set[websockets.WebSocketServerProtocol] = set()
        self.server = None

    async def start(self, port: int = 8080):
        """Start the WebSocket server"""
        print(f'WebSocket server is running on ws://localhost:{port}')
        
        async def handle_client(websocket, path):
            print('New client connected')
            self.sockets.add(websocket)
            try:
                await websocket.wait_closed()
            finally:
                print('Client disconnected')
                self.sockets.discard(websocket)
        
        self.server = await websockets.serve(handle_client, "localhost", port)
        return self.server

    def stop(self):
        """Stop the WebSocket server"""
        print('Server stopping')
        if self.server:
            self.server.close()

    async def send_message(self, message: str):
        """Send message to all connected clients"""
        if self.sockets:
            # Create a copy of the set to avoid modification during iteration
            sockets_copy = self.sockets.copy()
            for socket in sockets_copy:
                try:
                    await socket.send(message)
                except websockets.exceptions.ConnectionClosed:
                    # Remove disconnected socket
                    self.sockets.discard(socket)
                except Exception as e:
                    print(f"Error sending message: {e}")
                    self.sockets.discard(socket)

    def send_message_sync(self, message: str):
        """Synchronous wrapper for send_message"""
        if self.sockets:
            # Get the current event loop or create a new one
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If loop is already running, schedule the coroutine
                    asyncio.create_task(self.send_message(message))
                else:
                    # If no loop is running, run the coroutine
                    loop.run_until_complete(self.send_message(message))
            except RuntimeError:
                # No event loop in current thread, create a new one
                asyncio.run(self.send_message(message))

