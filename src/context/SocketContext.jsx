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
        // Tomar token según estrategia si existe
        const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

        if (AUTH_STRATEGY === 'cookie' || token) {
            // Iniciar conexión de socket
            // Conectar socket
            const newSocket = socketService.connect(token || undefined);

            // Guardar referencia inmediatamente para que los consumidores reciban el objeto
            setSocket(newSocket);

            // Configurar listeners
            newSocket.on('connect', () => {
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                logger.error('Error de conexión Socket:', error.message);
                setIsConnected(false);
            });

            // Si ya está conectado inmediatamente, setear el socket
            if (newSocket.connected) {
                setSocket(newSocket);
                setIsConnected(true);
            }

            return () => {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                // Solo desconectar si el usuario se desloguea (token ausente en modo token)
                const currentToken = AUTH_STRATEGY === 'cookie' ? 'cookie' : getToken();
                if (!currentToken) {
                    socketService.disconnect();
                    setSocket(null);
                    setIsConnected(false);
                }
            };
        } else {
            // Si no hay usuario, desconectar
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
