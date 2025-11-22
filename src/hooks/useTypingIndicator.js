import { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import socketService from '../services/socket.service';
import logger from '../utils/logger';

export const useTypingIndicator = (chatId) => {
    const { socket, isConnected } = useSocketContext();
    const [typingUsers, setTypingUsers] = useState([]);
    const typingLogTimerRef = useRef(null);
    const lastTypingLogRef = useRef(null);

    useEffect(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;

        const handleUserTyping = ({ user_id, user_name, chat_id }) => {
            if (chat_id === chatId || String(chat_id) === String(chatId)) {
                setTypingUsers(prev => {
                    const isAlreadyTyping = prev.some(u => u.user_id === user_id);
                    
                    // Solo registrar log cuando es un nuevo usuario escribiendo (no por cada carácter)
                    if (!isAlreadyTyping) {
                        logger.debug('Usuario escribiendo:', { user_id, user_name, chat_id });
                    }
                    
                    if (isAlreadyTyping) return prev;
                    return [...prev, { user_id, user_name }];
                });
            }
        };

        const handleUserStoppedTyping = ({ user_id, chat_id }) => {
            if (chat_id === chatId || String(chat_id) === String(chatId)) {
                setTypingUsers(prev => {
                    const filtered = prev.filter(u => u.user_id !== user_id);
                    // Solo registrar si realmente hay alguien escribiendo
                    if (prev.length > filtered.length) {
                        logger.debug('Usuario dejó de escribir:', { user_id, chat_id });
                    }
                    return filtered;
                });
            }
        };

        s.on('userTyping', handleUserTyping);
        s.on('userStoppedTyping', handleUserStoppedTyping);

        return () => {
            s.off('userTyping', handleUserTyping);
            s.off('userStoppedTyping', handleUserStoppedTyping);
        };
    }, [socket, chatId, isConnected]);

    const getTypingText = () => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) return `${typingUsers[0].user_name} está escribiendo...`;
        if (typingUsers.length === 2) return `${typingUsers[0].user_name} y ${typingUsers[1].user_name} están escribiendo...`;
        return `${typingUsers.length} personas están escribiendo...`;
    };

    return {
        typingUsers,
        isTyping: typingUsers.length > 0,
        typingText: getTypingText()
    };
};
