// @ts-ignore
import WebSocket, { WebSocketServer } from 'ws';

export class SocketServer {
    sockets: WebSocket[] = [];

    start() {
        const wss = new WebSocketServer({ port: 8080 });
        console.log('WebSocket server is running on ws://localhost:8080');
        wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');
            this.sockets.push(ws);
            ws.on('close', () => console.log('Client disconnected'));
        });
    }

    stop() {
        console.log('Client disconnected');
    }

    sendMessage(message: string) {
        this.sockets.forEach(socket => socket.send(message));
    }
}