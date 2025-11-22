import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket.service';
import logger from '../utils/logger';

export const useRealtimeMessages = (chatId) => {
    const { socket, isConnected } = useSocketContext();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const chatIdRef = useRef(null);
    const handlerRef = useRef(null);

    // Limpiar mensajes cuando cambia el chatId
    useEffect(() => {
        if (chatId !== chatIdRef.current) {
            logger.debug('[Chat] Cambiando de conversación', { 
                previousChatId: chatIdRef.current, 
                newChatId: chatId,
                action: 'limpiar_mensajes'
            });
            setMessages([]);
            chatIdRef.current = chatId;
        }
    }, [chatId]);

    useEffect(() => {
        // Usar fallback a la instancia del servicio si el Context aún no actualizó
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();

        if (!s || !chatId) {
            return;
        }

        const join = () => {
            logger.debug('[Chat] Uniéndose a conversación', { chatId, socketId: s.id });
            s.emit('joinChat', chatId);
        };

        // Si ya está conectado, unirse de inmediato; si no, esperar al evento 
        if (connected) join();
        else s.once('connect', join);

        // Escuchar mensajes nuevos - Optimizado para mejor rendimiento
        const handleReceiveMessage = (message) => {
            const messageChatId = message.chat_id || message.chat?._id || message.chat;

            // Validación temprana para evitar procesamiento innecesario
            if (messageChatId !== chatId && String(messageChatId) !== String(chatId)) {
                return;
            }

            // Log cuando se recibe un mensaje exitosamente
            logger.debug('[Mensaje] Recibido del servidor', {
                chatId: messageChatId,
                messageId: message._id || message.id,
                sender: message.sender?.name || message.sender_id?.name,
                type: message.type || 'text',
                hasClientId: !!message.client_id,
                timestamp: message.created_at
            });

            // Crear transformedMessage fuera del setState para optimizar
            const messageId = message._id || message.id;
            const transformedMessage = {
                id: messageId,
                _id: messageId,
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

            setMessages(prev => {
                // Verificar si el mensaje ya existe para evitar duplicados (optimizado)
                const existsById = prev.some(m => {
                    const mId = m._id || m.id;
                    return mId === messageId && !m.pending;
                });

                if (existsById) {
                    return prev; // No hacer cambios si ya existe
                }

                // Si el mensaje tiene client_id, reemplazar el mensaje optimista
                if (message.client_id) {
                    const optimisticIdx = prev.findIndex(m => {
                        const mId = m._id || m.id;
                        return mId === message.client_id && m.pending === true;
                    });
                    
                    if (optimisticIdx !== -1) {
                        // Reemplazar mensaje optimista por el real
                        const newList = [...prev];
                        newList[optimisticIdx] = transformedMessage;
                        return newList;
                    }
                }

                // Agregar nuevo mensaje al final
                return [...prev, transformedMessage];
            });
        };

        // Limpiar handler anterior si existe
        if (handlerRef.current) {
            s.off('receiveMessage', handlerRef.current);
        }
        
        // Guardar referencia al nuevo handler
        handlerRef.current = handleReceiveMessage;
        s.on('receiveMessage', handleReceiveMessage);

        return () => {
            logger.debug('[Chat] Limpiando listeners', { chatId, hasHandler: !!handlerRef.current });
            if (handlerRef.current) {
                s.off('receiveMessage', handlerRef.current);
            }
            s.off('connect', join);
        };
    }, [socket, chatId, isConnected, user]);

    const sendMessage = useCallback((content, type = 'text', fileUrl = null) => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) {
            logger.error('[Mensaje] No se puede enviar', {
                hasSocket: !!s,
                hasChatId: !!chatId,
                isConnected: connected,
                reason: !s ? 'socket_no_disponible' : !chatId ? 'chatId_faltante' : 'desconectado'
            });
            return;
        }

        // Crear mensaje para reflejo instantáneo en UI
        const clientId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

        logger.debug('[Mensaje] Enviando al servidor', { 
            chatId, 
            type, 
            clientId,
            contentLength: content.length,
            hasFileUrl: !!fileUrl 
        });
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
        s.emit('typing', { chat_id: chatId });
    }, [socket, chatId, isConnected, user]);

    const stopTyping = useCallback(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;
        s.emit('stopTyping', { chat_id: chatId });
    }, [socket, chatId, isConnected, user]);

    const markAsRead = useCallback(() => {
        const s = socket || socketService.getSocket();
        const connected = isConnected || socketService.isConnected();
        if (!s || !chatId || !connected) return;
        logger.debug('[Mensaje] Marcando como leídos', { chatId, userId: user?.id });
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
