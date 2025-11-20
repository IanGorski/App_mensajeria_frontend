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
            logger.debug('Chat cambió, limpiando mensajes:', { from: chatIdRef.current, to: chatId });
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
            logger.debug(`Uniendo al chat: ${chatId}`);
            s.emit('joinChat', chatId);
        };

        // Si ya está conectado, unirse de inmediato; si no, esperar al evento 
        if (connected) join();
        else s.once('connect', join);

        // Escuchar mensajes nuevos
        const handleReceiveMessage = (message) => {
            const messageChatId = message.chat_id || message.chat?._id || message.chat;

            if (messageChatId === chatId || String(messageChatId) === String(chatId)) {
                // Log cuando se recibe un mensaje exitosamente
                logger.debug('Mensaje recibido del servidor:', {
                    chatId: messageChatId,
                    messageId: message._id || message.id,
                    content: message.content.substring(0, 30) + (message.content.length > 30 ? '...' : ''),
                    sender: message.sender?.name || message.sender_id?.name,
                    client_id: message.client_id
                });

                setMessages(prev => {
                    const messageId = message._id || message.id;
                    
                    // Verificar si el mensaje ya existe para evitar duplicados
                    const existsById = prev.some(m => {
                        const mId = m._id || m.id;
                        return mId === messageId && !m.pending;
                    });

                    if (existsById) {
                        return prev;
                    }

                    let newList = [...prev];
                    
                    // Si el mensaje tiene client_id, reemplazar el mensaje optimista
                    if (message.client_id) {
                        const optimisticIdx = newList.findIndex(m => {
                            const mId = m._id || m.id;
                            return mId === message.client_id && m.pending === true;
                        });
                        
                        if (optimisticIdx !== -1) {
                            newList.splice(optimisticIdx, 1);
                        }
                    }

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

                    // Verificación de duplicados final antes de agregar el mensaje
                    const finalCheck = newList.some(m => {
                        const mId = m._id || m.id;
                        const tId = transformedMessage._id || transformedMessage.id;
                        return mId === tId;
                    });
                    
                    if (!finalCheck) {
                        newList.push(transformedMessage);
                    }

                    return newList;
                });
            }
        };

        // Limpiar handler anterior si existe
        if (handlerRef.current) {
            s.off('receiveMessage', handlerRef.current);
        }
        
        // Guardar referencia al nuevo handler
        handlerRef.current = handleReceiveMessage;
        s.on('receiveMessage', handleReceiveMessage);

        return () => {
            logger.debug(`Limpiando listeners del chat: ${chatId}`);
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
            logger.error('No se puede enviar mensaje:', {
                socket: !!s,
                chatId,
                isConnected: connected
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

        logger.debug('Enviando mensaje al servidor:', { chatId, content: content.substring(0, 30) + (content.length > 30 ? '...' : ''), type, clientId });
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
