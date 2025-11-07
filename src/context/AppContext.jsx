import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiService from "../services/api.service";
import { useAuth } from "./AuthContext";
import { useSocketContext } from "./SocketContext";
import { useUserStatus } from "../hooks/useUserStatus";
import logger from "../utils/logger";
import { normalizeConversations, normalizeConversation } from "../utils/conversationNormalizer";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocketContext();
    const { requestStatusSync } = useUserStatus();
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [showChatList, setShowChatList] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Definir primero para evitar usarla antes de que se inicie la app
    const fetchConversations = useCallback(async () => {
        try {
            const response = await apiService.request("/chats");
            const data = response.data || [];
            setConversations(normalizeConversations(user, data));
            // Tras cargar chats, solicitar sync de estados si hay socket
            if (socket && (isConnected || socket.connected)) {
                requestStatusSync();
            }
        } catch (error) {
            console.error("Error al cargar chats:", error);
        }
    }, [socket, isConnected, requestStatusSync, user]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchMessages = async (chatId) => {
        try {
            logger.debug(`📥 Cargando mensajes del chat: ${chatId}`);
            const response = await apiService.request(`/messages/${chatId}`);
            return response.data || [];
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
            return [];
        }
    };

    const handleSelectContact = async (contact) => {
        if (!contact) {
            console.error('Contacto es null o undefined');
            return;
        }

        if (!contact.id) {
            console.error('Contacto sin ID:', contact);
            return;
        }

        logger.debug('📱 Seleccionando contacto:', { id: contact?.id, name: contact?.name, otherUserId: contact?.otherUserId });

        // Re-normalizar por si el objeto viene parcial o con nombres inconsistentes
        const normalized = normalizeConversation(contact, (user?._id ?? user?.id)?.toString?.());

        setSelectedContact(normalized);

        // Cargar los mensajes del chat
        const messages = await fetchMessages(normalized.id);

        setActiveConversation({
            ...normalized,
            messages,
        });
        if (isMobile) {
            setShowChatList(false);
        }
    };

    const handleDeselectContact = () => {
        setSelectedContact(null);
        setActiveConversation(null);
        if (isMobile) {
            setShowChatList(true);
        }
    };

    // Funciones de gestión de conversaciones
    const handleMuteConversation = (chatId, duration) => {
        setConversations(prevConvs =>
            prevConvs.map(conv => {
                if (conv.id === chatId) {
                    let muteUntil;
                    if (duration === 'always') {
                        muteUntil = null;
                    } else if (duration === '8h') {
                        muteUntil = new Date(Date.now() + 8 * 60 * 60 * 1000);
                    } else if (duration === '1w') {
                        muteUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    }
                    return { ...conv, muteUntil };
                }
                return conv;
            })
        );
    };

    const handleUnmuteConversation = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, muteUntil: undefined } : conv
            )
        );
    };

    const handlePinConversation = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, isPinned: true } : conv
            )
        );
    };

    const handleUnpinConversation = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, isPinned: false } : conv
            )
        );
    };

    const handleArchiveConversation = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, isArchived: true } : conv
            )
        );
    };

    const handleDeleteConversation = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.filter(conv => conv.id !== chatId)
        );
    };

    const handleClearConversation = (chatId) => {
        // Limpiar mensajes pero mantener el chat
        logger.debug(`Clearing conversation ${chatId}`);
    };

    const markAsUnread = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, isUnread: true } : conv
            )
        );
    };

    const markAsRead = (chatId) => {
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.id === chatId ? { ...conv, isUnread: false } : conv
            )
        );
    };

    const addNewConversation = (newConv) => {
        setConversations(prevConvs => [newConv, ...prevConvs]);
    };

    const handleDeleteMessage = async (messageId) => {
        // Esta función será manejada por el backend
        logger.debug('Eliminando mensaje:', messageId);
    };

    // Actualizar preview de conversación al recibir mensajes vía socket
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (message) => {
            const chatId = message.chat_id || message.chat?._id || message.chat;
            const createdAt = message.created_at || new Date().toISOString();
            const isOwn = (message.sender_id?._id === user?.id) || (message.sender_id === user?.id);
            const content = message.content || '';

            setConversations(prev => {
                const idx = prev.findIndex(c => (c.id || c._id) === chatId);
                if (idx === -1) return prev;
                const updated = [...prev];
                const conv = { ...updated[idx] };
                conv.lastMessage = content;
                conv.lastMessageIsOwn = !!isOwn;
                conv.lastMessageTimestamp = new Date(createdAt).getTime();
                conv.time = new Date(createdAt).toISOString();
                // Marcar como no leído si no es propio y el chat no está abierto
                if (!isOwn && (!selectedContact || selectedContact.id !== chatId)) {
                    conv.isUnread = true;
                }
                updated[idx] = conv;
                return updated;
            });
        };

        socket.on('receiveMessage', handleReceive);
        return () => socket.off('receiveMessage', handleReceive);
    }, [socket, user?.id, selectedContact]);

    return (
        <AppContext.Provider value={{ 
            conversations, 
            selectedContact,
            activeConversation,
            showChatList,
            isMobile,
            handleSelectContact,
            handleDeselectContact,
            handleMuteConversation,
            handleUnmuteConversation,
            handlePinConversation,
            handleUnpinConversation,
            handleArchiveConversation,
            handleDeleteConversation,
            handleClearConversation,
            markAsUnread,
            markAsRead,
            addNewConversation,
            fetchConversations,
            handleDeleteMessage
        }}>
            {children}
        </AppContext.Provider>
    );
};
