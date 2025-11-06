import { API_BASE_URL, AUTH_STRATEGY } from '../components/config/constants';
import { getToken } from '../utils/tokenStorage';

export const searchUsers = async (searchTerm) => {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

    const response = await fetch(
        `${API_BASE_URL}/users/search?search=${encodeURIComponent(searchTerm)}`,
        {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {})
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al buscar usuarios');
    }

    return response.json();
};

export const getUserById = async (userId) => {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

    const response = await fetch(
        `${API_BASE_URL}/users/${userId}`,
        {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {})
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener usuario');
    }

    return response.json();
};
