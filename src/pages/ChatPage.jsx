import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeftPanel from '../panels/LeftPanel';
import ConversationPanel from '../panels/ConversationPanel';
import { useAppContext } from '../context/AppContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import styles from './ChatPage.module.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const {
        conversations,
        activeConversation,
        isMobile,
        showChatList,
        handleDeleteMessage,
        handleDeselectContact,
        handleSelectContact
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [displayedConversation, setDisplayedConversation] = useState(null);
    const loadingTimeoutRef = useRef(null);
    const lastChatIdRef = useRef(null);
    const handleSelectContactRef = useRef(handleSelectContact);
    const handleDeselectContactRef = useRef(handleDeselectContact);

    // Mantener refs actualizadas
    useEffect(() => {
        handleSelectContactRef.current = handleSelectContact;
        handleDeselectContactRef.current = handleDeselectContact;
    });

    // Simular carga de contactos al montar el componente
    useEffect(() => {
        setIsLoadingContacts(true);
        const timeout = setTimeout(() => {
            setIsLoadingContacts(false);
        }, 500); // Simular un retraso de 500ms

        return () => clearTimeout(timeout);
    }, []);

    // Manejar tecla ESC para deseleccionar chat y volver a inicio
    const handleEscapePress = React.useCallback(() => {
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
        }
        setIsLoading(false);
        handleDeselectContact();
        navigate('/chats', { replace: true });
    }, [handleDeselectContact, navigate]);

    useEscapeKey(handleEscapePress);

    // Manejar selección de chat cuando cambia el chatId en la URL
    useEffect(() => {
        // Limpiar timeout previo
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
        }

        // Si no hay chatId, limpiar estado
        if (!chatId) {
            if (displayedConversation) {
                handleDeselectContactRef.current();
                setDisplayedConversation(null);
            }
            setIsLoading(false);
            lastChatIdRef.current = null;
            return;
        }

        // Si es el mismo chat que ya procesé, no hacer nada
        if (lastChatIdRef.current === chatId) {
            return;
        }

        // Buscar la conversación
        const conv = conversations?.find(c => String(c.id) === String(chatId));
        
        if (conv) {
            // Actualizar ref ANTES de cargar para evitar loops
            lastChatIdRef.current = chatId;

            // PASO 1: Mostrar loader y ocultar conversación anterior
            setIsLoading(true);
            setDisplayedConversation(null);
            
            // PASO 2: Cargar la nueva conversación en segundo plano
            handleSelectContactRef.current(conv);
        }
        
        // Cleanup
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [chatId, conversations, displayedConversation]);

    // Cuando activeConversation cambia (se cargó completamente), actualizar a displayedConversation
    useEffect(() => {
        if (isLoading && activeConversation && String(activeConversation.id) === String(chatId)) {
            // Esperar un momento mínimo para que el loader sea visible
            loadingTimeoutRef.current = setTimeout(() => {
                setDisplayedConversation(activeConversation);
                setIsLoading(false);
            }, 300);
        }
    }, [activeConversation, isLoading, chatId]);

    // Clase raíz adaptable
    const rootClassName = [
        styles.chatPage,
        isMobile && showChatList ? 'mobileShowList' : '',
        isMobile && !showChatList ? 'mobileShowConversation' : ''
    ].filter(Boolean).join(' ');

    // En móvil: mostrar lista o conversación/loader
    if (isMobile) {
        return (
            <div className={rootClassName}>
                {showChatList && (
                    <div className={styles.leftPanelWrapper}>
                        {isLoadingContacts ? (
                            <div className={styles.loadingState}>
                                <div className={styles.spinner}></div>
                                <p>Cargando contactos...</p>
                            </div>
                        ) : (
                            <LeftPanel conversations={conversations} />
                        )}
                    </div>
                )}
                {!showChatList && (
                    <div className={styles.rightPanelWrapper}>
                        {isLoading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.spinner}></div>
                                <p>Cargando chat...</p>
                            </div>
                        ) : displayedConversation ? (
                            <ConversationPanel
                                activeConversation={displayedConversation}
                                onDeleteMessage={handleDeleteMessage}
                            />
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>App Mensajería</h3>
                                <p>Selecciona un chat para comenzar</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Desktop: ambos paneles visibles siempre
    return (
        <div className={rootClassName}>
            <div className={styles.leftPanelWrapper}>
                {isLoadingContacts ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Cargando contactos...</p>
                    </div>
                ) : (
                    <LeftPanel conversations={conversations} />
                )}
            </div>
            <div className={styles.rightPanelWrapper}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Cargando chat...</p>
                    </div>
                ) : displayedConversation ? (
                    <ConversationPanel
                        activeConversation={displayedConversation}
                        onDeleteMessage={handleDeleteMessage}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        <h3>App Mensajería</h3>
                        <p>Envía y recibe mensajes de forma instantánea</p>
                        <p className={styles.escHint}>Selecciona un contacto para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
