import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeftPanel from '../panels/LeftPanel';
import ConversationPanel from '../panels/ConversationPanel';
import { useAppContext } from '../context/AppContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import styles from './ChatPage.module.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const {
        conversations,
        activeConversation,
        isMobile,
        showChatList,
        handleSendMessage,
        handleDeleteMessage,
        handleDeselectContact
    } = useAppContext();

    // Manejar tecla ESC para deseleccionar chat
    const handleEscapePress = React.useCallback(() => {
        handleDeselectContact();
        navigate('/chats', { replace: true });
    }, [handleDeselectContact, navigate]);

    useEscapeKey(handleEscapePress);

    // En móvil mantener el comportamiento original
    if (isMobile) {
        return (
            <div className={styles.chatPage}>
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
            </div>
        );
    }

    // En desktop SIEMPRE mostrar ambos paneles
    return (
        <div className={styles.chatPage}>
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
                    <p className={styles.escHint}>💡 Presiona ESC para volver a esta vista</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
