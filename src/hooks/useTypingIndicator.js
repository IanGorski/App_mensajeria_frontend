import { useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import socketService from '../services/socket.service';
import logger from '../utils/logger';

export const useTypingIndicator = (chatId) => {
    const { socket, isConnected } = useSocketContext();
    const [typingUsers, setTypingUsers] = useState([]);

    useEffect(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;

        const handleUserTyping = ({ user_id, user_name, chat_id }) => {
            logger.debug('Usuario escribiendo:', { user_id, user_name, chat_id });
            if (chat_id === chatId || String(chat_id) === String(chatId)) {
                setTypingUsers(prev => {
                    // Evitar duplicados
                    if (prev.some(u => u.user_id === user_id)) return prev;
                    return [...prev, { user_id, user_name }];
                });
            }
        };

        const handleUserStoppedTyping = ({ user_id, chat_id }) => {
            logger.debug('Usuario dejó de escribir:', { user_id, chat_id });
            if (chat_id === chatId || String(chat_id) === String(chatId)) {
                setTypingUsers(prev => prev.filter(u => u.user_id !== user_id));
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
