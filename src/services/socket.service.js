import { io } from 'socket.io-client';
import { SOCKET_URL } from '../components/config/constants';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => console.log(`Socket connected: ${this.socket.id}`));
        this.socket.on('disconnect', () => console.log('Socket disconnected'));
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService();