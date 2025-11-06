import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket.service';
import logger from '../utils/logger';

export const useRealtimeMessages = (chatId) => {
    const { socket, isConnected } = useSocketContext();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Usar fallback a la instancia del servicio si el Context aún no actualizó
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();

        if (!s || !chatId) {
            logger.debug('⚠️ No hay socket o chatId aún:', { socket: !!s, chatId });
            return;
        }

        const join = () => {
            logger.debug(`📩 Uniendo al chat: ${chatId}`);
            s.emit('joinChat', chatId);
        };

        // Si ya está conectado, unirse de inmediato; si no, esperar al evento 'connect'
        if (connected) join();
        else s.once('connect', join);

        // Escuchar mensajes nuevos
        const handleReceiveMessage = (message) => {
            logger.debug('📨 Mensaje recibido en hook:', message);
            
            // Verificar que el mensaje pertenece a este chat
            const messageChatId = message.chat_id || message.chat?._id || message.chat;
            
            if (messageChatId === chatId || String(messageChatId) === String(chatId)) {
                setMessages(prev => {
                    // Evitar duplicados por _id o id
                    const messageId = message._id || message.id;
                    const exists = prev.some(m => (m._id || m.id) === messageId);
                    
                    if (exists) {
                        logger.debug('⚠️ Mensaje duplicado, ignorando');
                        return prev;
                    }
                    
                    // Si viene un client_id, reemplazar el mensaje en la lista 
                    let newList = [...prev];
                    if (message.client_id) {
                        const idx = newList.findIndex(m => (m._id || m.id) === message.client_id);
                        if (idx !== -1) {
                            newList.splice(idx, 1);
                        }
                    }

                    // Transformar el mensaje para que tenga el formato correspondiente para ser mostrado en el frontend
                    const transformedMessage = {
                        id: message._id || message.id,
                        _id: message._id || message.id,
                        content: message.content,
                        timestamp: new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }),
                        created_at: message.created_at,
                        sender: message.sender?.name || message.sender_id?.name || 'Unknown',
                        sender_id: message.sender_id?._id || message.sender_id || message.sender?.id,
                        isOwn: user && (message.sender_id?._id === user.id || message.sender_id === user.id),
                        type: message.type || 'text',
                        fileUrl: message.fileUrl,
                        pending: false
                    };
                    
                    logger.debug('Agregando nuevo mensaje a la lista:', transformedMessage);
                    return [...newList, transformedMessage];
                });
            } else {
                logger.debug('Mensaje de otro chat, ignorando:', { messageChatId, expectedChatId: chatId });
            }
        };

        s.on('receiveMessage', handleReceiveMessage);

        return () => {
            logger.debug(`Limpiando listeners del chat: ${chatId}`);
            s.off('receiveMessage', handleReceiveMessage);
            s.off('connect', join);
        };
    }, [socket, chatId, isConnected, user]);

    const sendMessage = useCallback((content, type = 'text', fileUrl = null) => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) {
            console.error('No se puede enviar mensaje:', { 
                socket: !!s, 
                chatId, 
                isConnected: connected 
            });
            return;
        }

        // Crear mensaje optimista para reflejo instantáneo en UI
        const clientId = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        const now = new Date();
        const optimisticMessage = {
            id: clientId,
            _id: clientId,
            content,
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: now.toISOString(),
            sender: user?.name || 'Tú',
            sender_id: user?.id,
            isOwn: true,
            type,
            fileUrl,
            pending: true
        };
        setMessages(prev => [...prev, optimisticMessage]);

        logger.debug('Enviando mensaje:', { chatId, content, type, clientId });
        s.emit('sendMessage', {
            chat_id: chatId,
            content,
            type,
            fileUrl,
            client_id: clientId
        });
    }, [socket, chatId, isConnected, user]);

    const startTyping = useCallback(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;
        logger.debug('Emitiendo typing para chat:', chatId);
        s.emit('typing', { chat_id: chatId });
    }, [socket, chatId, isConnected]);

    const stopTyping = useCallback(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;
        logger.debug('Emitiendo stopTyping para chat:', chatId);
        s.emit('stopTyping', { chat_id: chatId });
    }, [socket, chatId, isConnected]);

    const markAsRead = useCallback(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;
        logger.debug('Marcando mensajes como leídos en chat:', chatId);
        s.emit('markAsRead', { chat_id: chatId });
    }, [socket, chatId, isConnected]);

    return {
        messages,
        setMessages,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead
    };
};
