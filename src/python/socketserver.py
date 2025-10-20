import asyncio
import websockets
from typing import Set, Callable, Optional, Dict, Any
import json


class SocketServer:
    def __init__(self, on_message: Optional[Callable[[Dict[str, Any]], None]] = None, config: Optional[Dict[str, Any]] = None):
        self.sockets: Set[websockets.WebSocketServerProtocol] = set()
        self.server = None
        self.loop = None
        self.on_message_callback = on_message
        self.config = config

    async def start(self, port: int = 8080):
        """Start the WebSocket server"""
        # Store the event loop for cross-thread access
        self.loop = asyncio.get_event_loop()
        print(f'WebSocket server is running on ws://localhost:{port}')
        
        async def handle_client(websocket):
            print('New client connected')
            self.sockets.add(websocket)
            
            # Send the current config to the new client
            if self.config is not None:
                try:
                    config_message = json.dumps({
                        'type': 'config',
                        'config': self.config
                    })
                    await websocket.send(config_message)
                    print('Sent config to new client')
                except Exception as e:
                    print(f'Error sending config to new client: {e}')
            
            try:
                # Listen for incoming messages
                async for message in websocket:
                    try:
                        # Parse incoming message as JSON
                        data = json.loads(message)
                        print(f'Received message from client: {data}')
                        
                        # Call the message callback if it exists
                        if self.on_message_callback:
                            self.on_message_callback(data)
                            
                    except json.JSONDecodeError as e:
                        print(f'Error parsing message as JSON: {e}')
                    except Exception as e:
                        print(f'Error processing message: {e}')
            except websockets.exceptions.ConnectionClosed:
                pass
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
        """Synchronous wrapper for send_message - thread-safe"""
        if self.sockets and self.loop:
            # Schedule the coroutine in the server's event loop (thread-safe)
            asyncio.run_coroutine_threadsafe(self.send_message(message), self.loop)

