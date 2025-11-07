import { io } from 'socket.io-client';
import { SOCKET_URL, AUTH_STRATEGY } from '../components/config/constants';
import logger from '../utils/logger';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket?.connected) {
            logger.debug('Socket already connected');
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: token && AUTH_STRATEGY !== 'cookie' ? { token } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transportOptions: {
                polling: {
                    withCredentials: true,
                },
            },
        });

        this.socket.on('connect', () => {
            logger.debug('Conectado a Socket.IO:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            logger.debug('Desconectado de Socket.IO');
        });

        this.socket.on('connect_error', (error) => {
            logger.error('Error de conexión Socket.IO:', error.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();