const ENV = {
    // URL del backend HTTP (Express)
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

    // URL del servidor WebSocket (Socket.io)
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',

    // Modo de ejecución
    NODE_ENV: import.meta.env.MODE || 'development',

    // Flag para producción
    IS_PRODUCTION: import.meta.env.PROD || false,

    // Flag para desarrollo
    IS_DEVELOPMENT: import.meta.env.DEV || true
};

export default ENV;
