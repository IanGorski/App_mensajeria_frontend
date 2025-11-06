import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";
import { AUTH_STRATEGY } from "../components/config/constants";
import { getToken, setToken, removeToken } from "../utils/tokenStorage";

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
                // Estrategia cookie: verificar siempre, el servidor valida HttpOnly cookie
                // Estrategia token: verificar solo si hay token almacenado
                if (AUTH_STRATEGY !== 'cookie') {
                    const token = getToken();
                    if (!token) {
                        setLoading(false);
                        return;
                    }
                }

                const response = await authService.verifyToken();
                // El backend devuelve el usuario dentro de data
                if (response.data?.user) {
                    setUser(response.data.user);
                }
            } catch {
                // No exponer detalles en consola
                console.warn('Sesión no válida o expirada');
                // Si usamos token, limpiarlo
                if (AUTH_STRATEGY !== 'cookie') {
                    removeToken();
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        // El backend devuelve auth_token dentro de body
        const token = response.body?.auth_token;
        // Si la estrategia es token, guardar; si es cookie, se espera seteo HttpOnly por el servidor
        if (AUTH_STRATEGY !== 'cookie' && token) {
            setToken(token);
        }
        // Verificar sesión para obtener usuario
        const verifyResponse = await authService.verifyToken();
        setUser(verifyResponse.data?.user);
        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        // El backend no devuelve token en el registro, requiere verificación de email
        // No se guarda token ni se conecta socket
        return response;
    };

    const logout = () => {
        if (AUTH_STRATEGY !== 'cookie') {
            removeToken();
        }
        setUser(null);
        // SocketProvider observará que no hay token y desconectará
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
