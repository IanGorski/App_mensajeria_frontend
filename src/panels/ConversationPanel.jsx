import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConversationPanel.module.css';
import MessageList from '../ui/MessageList';
import MessageComposer from '../ui/MessageComposer';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useUserStatus } from '../hooks/useUserStatus';

const ConversationPanel = ({ activeConversation, onDeleteMessage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, handleDeselectContact } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  
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
    if (activeConversation?.messages) {
      setMessages(activeConversation.messages);
    }
  }, [activeConversation?.id, activeConversation?.messages, setMessages]);

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
    // debug solo en dev
    // logger.debug('Enviando mensaje desde ConversationPanel:', { chatId: activeConversation?.id, content: messageContent });
    
    // Enviar mensaje por Socket.IO en tiempo real
    sendRealtimeMessage(messageContent);
  };

  const handleInputChange = (isTyping) => {
    if (isTyping) {
      // Usuario está escribiendo
      startTyping();
      
      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Después de 3 segundos sin escribir, enviar stopTyping
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    } else {
      // Usuario dejó de escribir
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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

  // Función para resaltar texto en los mensajes, lupa.
  
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

  // Función para obtener los mensajes a mostrar (mezclando tiempo real con existentes)
  const getMessagesToShow = () => {
    // Combinar mensajes existentes con mensajes en tiempo real
    const existingMessages = (activeConversation?.messages || []).map(msg => ({
      ...msg,
      id: msg._id || msg.id,
      _id: msg._id || msg.id,
      timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: user && (msg.sender_id?._id === user.id || msg.sender_id === user.id),
      sender: msg.sender_id?.name || msg.sender || 'Unknown'
    }));
    
    const allMessages = [...existingMessages, ...realtimeMessages];
    
    // Eliminar duplicados por _id o id
    const uniqueMessages = allMessages.reduce((acc, msg) => {
      const msgId = msg._id || msg.id;
      if (!acc.some(m => (m._id || m.id) === msgId)) {
        acc.push(msg);
      }
      return acc;
    }, []);
    
    // Ordenar por fecha
    return uniqueMessages.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp);
      const dateB = new Date(b.created_at || b.timestamp);
      return dateA - dateB;
    });
  };

  // STUB: Funcionalidad pendiente de implementación
  const handleIconClick = () => {
    // TODO: Implementar funcionalidad de llamada/videollamada
  };

  if (!activeConversation) {
    return (
      <div className={styles.conversationPanel}>
        {!isMobile && <div className={styles.leftFranja}></div>}
        <div className={styles.chatSection}>
          <div className={styles.emptyState}>
            <h3>WhatsApp para Windows</h3>
            <p>Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
            <p>Usa Whatsapp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
          </div>
        </div>
        {!isMobile && <div className={styles.rightFranja}></div>}
      </div>
    );
  }

  return (
    <div className={styles.conversationPanel}>
      {!isMobile && <div className={styles.leftFranja}></div>}
      <div className={styles.chatSection}>
        <div className={styles.conversationHeader}>
        {isMobile && (
          <button 
            className={styles.backButton}
            onClick={handleBackClick}
            title="Volver a chats"
          >
            <ArrowBackIcon sx={{ fontSize: 24 }} />
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
          <button className={styles.actionButton} onClick={handleIconClick}>
            <CallIcon sx={{ fontSize: 20 }} />
          </button>
          <button className={styles.actionButton} onClick={handleIconClick}>
            <VideocamIcon sx={{ fontSize: 20 }} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={toggleSearch}
            title="Buscar en chat"
          >
            <SearchIcon sx={{ fontSize: 20 }} />
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
                  <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                </button>
                <button 
                  className={styles.navButton}
                  onClick={goToNextMatch}
                  disabled={totalMatches === 0}
                  title="Siguiente resultado"
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            )}
            
            <button 
              className={styles.closeSearchButton}
              onClick={toggleSearch}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
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
      {!isMobile && <div className={styles.rightFranja}></div>}
    </div>
  );
};

export default ConversationPanel;
