import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConversationPanel.module.css';
import MessageList from '../ui/MessageList';
import MessageComposer from '../ui/MessageComposer';
import { Phone, Video, Search, X, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useUserStatus } from '../hooks/useUserStatus';
import logger from '../utils/logger';

const ConversationPanel = ({ activeConversation, onDeleteMessage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, handleDeselectContact } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  
  // Ref para rastrear el último ID de conversación sincronizado
  const lastSyncedIdRef = useRef(null);
  const initialSyncDoneRef = useRef(false);
  
  //Hooks para mensajería en tiempo real
  const {
    messages: realtimeMessages,
    setMessages,
    sendMessage: sendRealtimeMessage,
    startTyping,
    stopTyping,
    markAsRead
  } = useRealtimeMessages(activeConversation?.id);

  const { isTyping, typingText } = useTypingIndicator(activeConversation?.id);
  const { getUserStatus, isUserOnline } = useUserStatus();
  
  const typingTimeoutRef = useRef(null);

  // Sincronizar mensajes del contexto con mensajes en tiempo real
  useEffect(() => {
    if (!activeConversation) return;
    
    const currentId = activeConversation.id;
    const hasMessages = activeConversation.messages && activeConversation.messages.length > 0;
    
    // Reset cuando cambia la conversación
    if (currentId !== lastSyncedIdRef.current) {
      initialSyncDoneRef.current = false;
      lastSyncedIdRef.current = currentId;
    }
    
    // Solo sincronizar UNA VEZ cuando hay mensajes y no se ha hecho sync inicial
    if (currentId && hasMessages && !initialSyncDoneRef.current) {
      setMessages(activeConversation.messages);
      initialSyncDoneRef.current = true;
    }
  }, [activeConversation, setMessages]);

  // Marcar mensajes como leídos al abrir el chat
  useEffect(() => {
    if (activeConversation?.id) {
      markAsRead();
    }
  }, [activeConversation?.id, markAsRead]);

  // Obtener estado del usuario (online/offline)
  const userStatus = !activeConversation?.isGroup && activeConversation?.otherUserId
    ? getUserStatus(activeConversation.otherUserId)
    : null;

  const isOnline = !activeConversation?.isGroup && activeConversation?.otherUserId
    ? isUserOnline(activeConversation.otherUserId)
    : false;

  const formatLastConnection = (date) => {
    if (!date) return 'hace mucho tiempo';
    const now = new Date();
    const lastConn = new Date(date);
    const diffMinutes = Math.floor((now - lastConn) / (1000 * 60));

    if (diffMinutes < 1) return 'hace un momento';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
  };

  const handleBackClick = () => {
    handleDeselectContact();
    navigate('/chats');
  };

  const handleSendMessage = (messageContent) => {
    sendRealtimeMessage(messageContent);
  };

  const handleInputChange = (isTyping) => {
    if (isTyping) {
      // Solo iniciar typing si no hay timeout activo (primera vez que escribe)
      if (!typingTimeoutRef.current) {
        startTyping();
        logger.debug('[Typing] Usuario comenzó a escribir', { 
          chatId: activeConversation?.id, 
          userId: user?.id 
        });
      }
      
      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Después de 3 segundos sin escribir, enviar stopTyping
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
        typingTimeoutRef.current = null;
      }, 3000);
    } else {
      // Usuario dejó de escribir
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setSearchTerm('');
      setCurrentMatchIndex(0);
      setTotalMatches(0);
    }
  };

  // Manejar el cambio en el término de búsqueda
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const matches = activeConversation?.messages?.filter(message => 
        message.content && message.content.toLowerCase().includes(newSearchTerm.toLowerCase())
      ) || [];
      
      setTotalMatches(matches.length);
      setCurrentMatchIndex(matches.length > 0 ? 1 : 0);
    } else {
      setTotalMatches(0);
      setCurrentMatchIndex(0);
    }
  };

  // Navegar al siguiente resultado
  const goToNextMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatchIndex(currentMatchIndex < totalMatches ? currentMatchIndex + 1 : 1);
    }
  };

  // Navegar al resultado anterior
  const goToPreviousMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatchIndex(currentMatchIndex > 1 ? currentMatchIndex - 1 : totalMatches);
    }
  };

  // Función para obtener los mensajes a mostrar
  const getMessagesToShow = () => {
    // RealtimeMessages ya contiene todos los mensajes (cargados + nuevos)
    const messagesToShow = realtimeMessages.map(msg => ({
      ...msg,
      id: msg._id || msg.id,
      _id: msg._id || msg.id,
      timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: user && (msg.sender_id?._id === user.id || msg.sender_id === user.id || msg.isOwn),
      sender: msg.sender || msg.sender_id?.name || 'Unknown'
    }));
    
    // Ordenar por fecha
    return messagesToShow.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp);
      const dateB = new Date(b.created_at || b.timestamp);
      return dateA - dateB;
    });
  };

  const handleIconClick = () => {
    // Funcionalidad de llamada/videollamada que aun no la implementé
    logger.info('[Llamada] Funcionalidad en desarrollo');
  };

  if (!activeConversation) {
    return (
      <div className={styles.conversationPanel}>
        {!isMobile && <div className={styles.leftSidebar}></div>}
        <div className={styles.chatSection}>
          <div className={styles.emptyState}>
            <h3>Aplicación Mensajería</h3>
            <p>Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
          </div>
        </div>
        {!isMobile && <div className={styles.rightSidebar}></div>}
      </div>
    );
  }

  return (
    <div className={styles.conversationPanel}>
      {!isMobile && <div className={styles.leftSidebar}></div>}
      <div className={styles.chatSection}>
        <div className={styles.conversationHeader}>
        {isMobile && (
          <button 
            className={styles.backButton}
            onClick={handleBackClick}
            title="Volver a chats"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className={styles.contactInfo}>
          <div className={styles.avatar}>
            {activeConversation.avatar ? (
              <img src={activeConversation.avatar} alt={activeConversation.name} className={styles.avatarImage} />
            ) : (
              activeConversation.name[0]
            )}
          </div>
          <div className={styles.contactDetails}>
            <h3>{activeConversation.name}</h3>
            <p className={styles.status}>
              {isTyping && typingText 
                ? <em>{typingText}</em>
                : isOnline 
                  ? 'conectado' 
                  : userStatus?.last_connection 
                    ? `Última vez ${formatLastConnection(userStatus.last_connection)}`
                    : 'desconectado'
              }
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} onClick={handleIconClick} title="Llamada de voz">
            <Phone size={20} />
          </button>
          <button className={styles.actionButton} onClick={handleIconClick} title="Videollamada">
            <Video size={20} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={toggleSearch}
            title="Buscar en chat"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Barra de búsqueda desplegable, muestra barra de búsqueda si está expandida*/}
      {isSearchExpanded && (
        <div className={styles.searchDropdown}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar en el chat"
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.chatSearchInput}
              autoFocus
            />
            
            {/* Contador y navegación de resultados */}
            {searchTerm && (
              <div className={styles.searchNavigation}>
                <span className={styles.searchCounter}>
                  {totalMatches > 0 ? `${currentMatchIndex} de ${totalMatches}` : '0 de 0'}
                </span>
                <button 
                  className={styles.navButton}
                  onClick={goToPreviousMatch}
                  disabled={totalMatches === 0}
                  title="Resultado anterior"
                >
                  <ChevronUp size={16} />
                </button>
                <button 
                  className={styles.navButton}
                  onClick={goToNextMatch}
                  disabled={totalMatches === 0}
                  title="Siguiente resultado"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
            
            <button 
              className={styles.closeSearchButton}
              onClick={toggleSearch}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      <MessageList 
        messages={getMessagesToShow()} 
        searchTerm={searchTerm}
        currentMatchIndex={currentMatchIndex}
        onDeleteMessage={onDeleteMessage}
        activeConversation={activeConversation}
        emptyStateMessage="No hay mensajes aún"
      />
      <MessageComposer 
        onSendMessage={handleSendMessage} 
        conversationId={activeConversation?.id}
        onTypingChange={handleInputChange}
      />
      </div>
      {!isMobile && <div className={styles.rightSidebar}></div>}
    </div>
  );
};

export default ConversationPanel;
