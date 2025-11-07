import React, { useCallback, useEffect, useMemo } from 'react';
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

    // Manejar tecla ESC para deseleccionar chat
    const handleEscapePress = useCallback(() => {
        handleDeselectContact();
        navigate('/chats', { replace: true });
    }, [handleDeselectContact, navigate]);

    useEscapeKey(handleEscapePress);

    // Buscar conversación por ID (memorizado)
    const currentConversation = useMemo(() => {
        if (!id || conversations.length === 0) {
            console.log('No hay ID o conversaciones:', { id, count: conversations.length });
            return null;
        }

        // Comparar como strings
        const found = conversations.find(conv => {
            const convId = String(conv.id || conv._id || '');
            const paramId = String(id);
            return convId === paramId;
        });

        if (!found) {
            console.error('No se encontró conversación con ID:', id);
            console.log('Conversaciones disponibles:', conversations.map(c => ({ id: c.id, name: c.name })));
        } else {
            console.log('Conversación encontrada:', { id: found.id, name: found.name });
        }

        return found || null;
    }, [id, conversations]);

    // Encontrar la conversación por ID cuando se carga la página o cambia el ID
    useEffect(() => {
        if (currentConversation) {
            // Solo actualizar si la conversación cambió o no hay conversación activa
            if (!activeConversation || activeConversation.id !== currentConversation.id) {
                handleSelectContact(currentConversation);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation]);

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
                {!showChatList && !activeConversation && (
                    <div className={styles.emptyState}>
                        <h3>WhatsApp para Windows</h3>
                        <p>Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
                        <p>Usa Whatsapp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
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
            {activeConversation ? (
                <ConversationPanel
                    activeConversation={activeConversation}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                />
            ) : (
                <div className={styles.emptyState}>
                    <h3>WhatsApp para Windows</h3>
                    <p>Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
                    <p>Usa Whatsapp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
                </div>
            )}
        </div>
    );
};

export default ConversationPage;
