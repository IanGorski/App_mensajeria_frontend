import React, { useState } from 'react';
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

const ConversationPanel = ({ activeConversation, onSendMessage, onDeleteMessage }) => {
  const navigate = useNavigate();
  const { isMobile, handleDeselectContact } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  const handleBackClick = () => {
    handleDeselectContact();
    navigate('/chats');
  };

  const handleSendMessage = (messageContent) => {
    const newMessage = {
      id: Date.now(),
      sender: "You",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    
    if (onSendMessage) {
      onSendMessage(newMessage);
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

  // Función simple para filtrar mensajes
  const getMessagesToShow = () => {
    return activeConversation?.messages || [];
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
            <p className={styles.status}>{activeConversation.status || 'en línea'}</p>
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
      />
      {/* Mostrar último mensaje si no hay mensajes */}
      {getMessagesToShow().length === 0 && (
        <div className={styles.emptyState}>
          <p>{activeConversation?.lastMessage || "No hay mensajes aún"}</p>
        </div>
      )}
      <MessageComposer 
        onSendMessage={handleSendMessage} 
        conversationId={activeConversation?.id}
      />
      </div>
      {!isMobile && <div className={styles.rightFranja}></div>}
    </div>
  );
};

export default ConversationPanel;
