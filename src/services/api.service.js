import { API_BASE_URL, AUTH_STRATEGY } from '../components/config/constants';
import { getToken } from '../utils/tokenStorage';
import logger from '../utils/logger';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthHeaders() {
        if (AUTH_STRATEGY === 'cookie') {
            return { 'Content-Type': 'application/json' };
        }
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async request(endpoint, options = {}) {
        if (!this.baseURL) {
            throw new Error('API_BASE_URL no configurado. Defina VITE_API_URL.');
        }
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
            // Para cookies HttpOnly
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {}),
        };

        try {
            const response = await fetch(url, config);
            // Si no hay contenido
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                const message = (isJson ? data?.message : data) || 'Error en la petición';
                throw new Error(message);
            }

            return data;
        } catch (error) {
            logger.error('API request error');
            throw error;
        }
    }
}

export default new ApiService();