import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import socketService from '../services/socket.service';
import logger from '../utils/logger';

export const useUserStatus = () => {
    const { socket, isConnected } = useSocketContext();
    const [userStatuses, setUserStatuses] = useState({});
    const lastLoggedStatusRef = useRef({});

    useEffect(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !connected) return;

        const handleStatusChanged = ({ user_id, online, last_connection }) => {
            // Solo registrar log si el estado realmente cambió
            const lastStatus = lastLoggedStatusRef.current[user_id];
            const statusChanged = !lastStatus || lastStatus.online !== online;
            
            if (statusChanged) {
                logger.debug('Estado de usuario cambió:', { user_id, online, last_connection });
                lastLoggedStatusRef.current[user_id] = { online, last_connection };
            }
            
            setUserStatuses(prev => ({
                ...prev,
                [user_id]: { online, last_connection }
            }));
        };

        s.on('userStatusChanged', handleStatusChanged);
        // Recibir sync inicial masivo
        const handleStatusSync = (statusMap) => {
            setUserStatuses(prev => ({ ...prev, ...statusMap }));
        };
        s.on('statusSync', handleStatusSync);

        return () => {
            s.off('userStatusChanged', handleStatusChanged);
            s.off('statusSync', handleStatusSync);
        };
    }, [socket, isConnected]);

    // Solicitar sync de estados al conectar/reconectar
    useEffect(() => {
        const s = socket || socketService.getSocket();
        if (!s) return;

        const request = () => {
            s.emit('requestStatusSync');
        };

        if (isConnected || socketService.isConnected()) {
            request();
        } else {
            s.once('connect', request);
        }

        return () => {
            s.off('connect', request);
        };
    }, [socket, isConnected]);

    const getUserStatus = useCallback((userId) => {
        return userStatuses[userId] || { online: false, last_connection: null };
    }, [userStatuses]);

    const isUserOnline = useCallback((userId) => {
        return userStatuses[userId]?.online || false;
    }, [userStatuses]);

    // Permitir pedir sync explícito desde componentes/contexts
    const requestStatusSync = useCallback(() => {
        const s = socket || socketService.getSocket();
        if (s) s.emit('requestStatusSync');
    }, [socket]);

    return { userStatuses, getUserStatus, isUserOnline, requestStatusSync };
};
