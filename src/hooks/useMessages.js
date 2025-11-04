import { useState } from 'react';
import apiService from '../services/api.service';

export const useMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await apiService.request(`/messages/${chatId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    return { messages, loading, fetchMessages };
};