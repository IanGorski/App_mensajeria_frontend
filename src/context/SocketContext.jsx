import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import socketService from "../services/socket.service";
import { AUTH_STRATEGY } from "../components/config/constants";
import { getToken } from "../utils/tokenStorage";
import logger from "../utils/logger";

export const SocketContext = createContext();

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext debe ser usado dentro de SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Capturar token al inicio del effect para evitar problemas en cleanup
        const initialToken = AUTH_STRATEGY === 'cookie' ? 'cookie' : getToken();

        if (AUTH_STRATEGY === 'cookie' || initialToken) {
            // Iniciar conexión de socket
            const newSocket = socketService.connect(initialToken === 'cookie' ? undefined : initialToken);

            // Limpieza detodos los eventos antes de registrar nuevos
            newSocket.removeAllListeners();

            // Configurar listeners después de limpiar
            newSocket.on('connect', () => {
                logger.debug('Socket conectado exitosamente');
                setIsConnected(true);
                setSocket(newSocket);
            });

            newSocket.on('disconnect', () => {
                logger.debug('Socket desconectado');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                logger.error('Error de conexión Socket:', error.message);
                setIsConnected(false);
            });

            // Si ya está conectado inmediatamente (reconexión), setear el socket
            if (newSocket.connected) {
                setSocket(newSocket);
                setIsConnected(true);
            }

            return () => {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                // Usar el token capturado al inicio, no el actual
                if (!initialToken || initialToken === 'cookie') {
                    // Solo desconectar si no había token al inicio
                    const currentToken = AUTH_STRATEGY === 'cookie' ? 'cookie' : getToken();
                    if (!currentToken) {
                        socketService.disconnect();
                        setSocket(null);
                        setIsConnected(false);
                    }
                }
            };
        } else {
            // Si no hay usuario/token, desconectar
            if (socket) {
                socketService.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
