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
            console.log('[AuthContext] Verificando sesión...');
            try {
                // Estrategia cookie: verificar siempre, el servidor valida HttpOnly cookie
                // Estrategia token: verificar solo si hay token almacenado
                if (AUTH_STRATEGY !== 'cookie') {
                    const token = getToken();
                    console.log('[AuthContext] Token encontrado:', !!token);
                    if (!token) {
                        console.log('[AuthContext] No hay token, sesión no válida');
                        setLoading(false);
                        return;
                    }
                }

                console.log('[AuthContext] Verificando token con el backend...');
                const response = await authService.verifyToken();
                console.log('[AuthContext] Respuesta del backend:', response);
                
                // El backend devuelve el usuario dentro de data
                if (response.data?.user) {
                    console.log('[AuthContext] Usuario autenticado:', response.data.user);
                    setUser(response.data.user);
                } else {
                    console.log('[AuthContext] No se encontró usuario en la respuesta');
                }
            } catch (error) {
                // No exponer detalles en consola
                console.error('[AuthContext] Error al verificar sesión:', error);
                // Si usamos token, limpiarlo
                if (AUTH_STRATEGY !== 'cookie') {
                    removeToken();
                }
                setUser(null);
            } finally {
                console.log('[AuthContext] Verificación completada, loading = false');
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
