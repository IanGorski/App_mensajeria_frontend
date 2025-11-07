import { useState } from 'react';
import apiService from '../services/api.service';
import logger from '../services/logger.service';

export const useMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await apiService.request(`/messages/${chatId}`);
            setMessages(response.data);
        } catch (error) {
            logger.error('Error al cargar mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    return { messages, loading, fetchMessages };
};