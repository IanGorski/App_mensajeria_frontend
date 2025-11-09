import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeftPanel from '../panels/LeftPanel';
import ConversationPanel from '../panels/ConversationPanel';
import { useAppContext } from '../context/AppContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import styles from './ConversationPage.module.css';

const ConversationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        conversations,
        activeConversation,
        isMobile,
        showChatList,
        handleSelectContact,
        handleSendMessage,
        handleDeleteMessage,
        handleDeselectContact
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false); // Estado para el loader

    // Manejar tecla ESC para deseleccionar chat
    const handleEscapePress = useCallback(() => {
        handleDeselectContact();
        navigate('/chats', { replace: true });
    }, [handleDeselectContact, navigate]);

    useEscapeKey(handleEscapePress);

    // Buscar conversación por ID (memorizado)
    const currentConversation = useMemo(() => {
        if (!id || conversations.length === 0) {
            return null;
        }

        // Comparar como strings
        const found = conversations.find(conv => {
            const convId = String(conv.id || conv._id || '');
            const paramId = String(id);
            return convId === paramId;
        });

        return found || null;
    }, [id, conversations]);

    // Encontrar la conversación por ID cuando se carga la página o cambia el ID
    useEffect(() => {
        if (currentConversation) {
            // Solo actualizar si la conversación cambió o no hay conversación activa
            if (!activeConversation || activeConversation.id !== currentConversation.id) {
                setIsLoading(true); // Activar loader al seleccionar un contacto
                handleSelectContact(currentConversation);
                setTimeout(() => setIsLoading(false), 500); // Simular tiempo de carga
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation, activeConversation, handleSelectContact]);

    // En móvil mantener el comportamiento original
    if (isMobile) {
        return (
            <div className={styles.conversationPage}>
                {showChatList && (
                    <LeftPanel
                        conversations={conversations}
                    />
                )}
                {!showChatList && activeConversation && (
                    <ConversationPanel
                        activeConversation={activeConversation}
                        onSendMessage={handleSendMessage}
                        onDeleteMessage={handleDeleteMessage}
                    />
                )}
                {!showChatList && isLoading && (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Cargando chat...</p>
                    </div>
                )}
            </div>
        );
    }

    // En desktop SIEMPRE mostrar ambos paneles
    return (
        <div className={styles.conversationPage}>
            <LeftPanel
                conversations={conversations}
            />
            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Cargando chat...</p>
                </div>
            ) : (
                <ConversationPanel
                    activeConversation={activeConversation}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                />
            )}
        </div>
    );
};

export default ConversationPage;
