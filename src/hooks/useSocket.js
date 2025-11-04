import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket debe usarse dentro de SocketProvider');
    }
    return socket;
};