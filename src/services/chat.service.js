import { API_BASE_URL, AUTH_STRATEGY } from '../components/config/constants';
import { getToken } from '../utils/tokenStorage';

export const createPrivateChat = async (userId) => {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

    const response = await fetch(
        `${API_BASE_URL}/chats/private`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {}),
            body: JSON.stringify({ user_id: userId })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear chat');
    }

    return response.json();
};

export const getAllChats = async () => {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

    const response = await fetch(
        `${API_BASE_URL}/chats`,
        {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {})
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener chats');
    }

    return response.json();
};

export const getChatById = async (chatId) => {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

    const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}`,
        {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {})
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener chat');
    }

    return response.json();
};
