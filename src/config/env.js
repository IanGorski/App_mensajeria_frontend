const ENV = {
    // URL del backend HTTP (Express)
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

    // URL del servidor WebSocket (Socket.io)
    // En producción debe usar wss://
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',

    // Modo de ejecución
    NODE_ENV: import.meta.env.MODE || 'development',

    // Flag para producción
    IS_PRODUCTION: import.meta.env.PROD || false,

    // Flag para desarrollo
    IS_DEVELOPMENT: import.meta.env.DEV || true,

    // Configuración de logs
    ENABLE_LOGS: import.meta.env.VITE_ENABLE_LOGS === 'true' || import.meta.env.DEV || false
};

// Validar configuración en producción
if (ENV.IS_PRODUCTION) {
    if (!ENV.API_URL || ENV.API_URL === 'http://localhost:3000') {
        console.error('[ENV] ERROR: API_URL no configurado para producción');
    }
    if (!ENV.SOCKET_URL || ENV.SOCKET_URL === 'http://localhost:3000') {
        console.error('[ENV] ERROR: SOCKET_URL no configurado para producción');
    }
    
    // Verificar que se use HTTPS en producción
    if (ENV.API_URL && !ENV.API_URL.startsWith('https://')) {
        console.warn('[ENV] ADVERTENCIA: API_URL debería usar HTTPS en producción');
    }
    if (ENV.SOCKET_URL && !ENV.SOCKET_URL.startsWith('https://') && !ENV.SOCKET_URL.startsWith('wss://')) {
        console.warn('[ENV] ADVERTENCIA: SOCKET_URL debería usar HTTPS o WSS en producción');
    }
}

export default ENV;
