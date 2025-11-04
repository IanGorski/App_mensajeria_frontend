import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";
import socketService from "../services/socket.service";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Solo verificar si hay un token en localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await authService.verifyToken();
                // El backend devuelve el usuario dentro de data
                if (response.data?.user) {
                    setUser(response.data.user);
                    socketService.connect(token);
                }
            } catch (error) {
                console.error('Error verificando sesión:', error);
                // Si el token es inválido, limpiarlo
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            // El backend devuelve auth_token dentro de body
            const token = response.body?.auth_token;
            if (token) {
                localStorage.setItem('token', token);
                // Verificar el token para obtener los datos del usuario
                const verifyResponse = await authService.verifyToken();
                setUser(verifyResponse.data?.user);
                socketService.connect(token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            // El backend no devuelve token en el registro, requiere verificación de email
            // No se guarda token ni se conecta socket
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        socketService.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
