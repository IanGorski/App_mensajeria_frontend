import React, { useEffect, useRef, useState } from 'react';
import styles from './MessageList.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import ContextMenu from './ContextMenu';
import ConfirmDialog from './ConfirmDialog';
import ReplyIcon from '@mui/icons-material/Reply';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForwardIcon from '@mui/icons-material/Forward';
import StarIcon from '@mui/icons-material/Star';
import PushPinIcon from '@mui/icons-material/PushPin';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AddIcon from '@mui/icons-material/Add';

const MessageList = ({ messages = [], searchTerm = '', currentMatchIndex = 0, onDeleteMessage, activeConversation }) => {
  const messageRefs = useRef({});
  const containerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, message: null });
  const [showReactionBar, setShowReactionBar] = useState({ isOpen: false, x: 0, y: 0, messageId: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, messageId: null });
  const [touchTimer, setTouchTimer] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  
  // Función para resaltar texto solo en el mensaje activo
  const highlightText = (text, search, isActiveMatch) => {
    if (!search || !text || !isActiveMatch) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={styles.highlight}>{part}</mark>
      ) : part
    );
  };

  // Verificación si un mensaje coincide con la búsqueda
  const messageMatches = (message, search) => {
    if (!search) return false;
    return message.content && message.content.toLowerCase().includes(search.toLowerCase());
  };

  // Manejar eliminación de mensaje
  const handleDeleteMessage = (messageId) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
    setConfirmDialog({ isOpen: false, messageId: null });
  };

  // Manejar menú contextual
  const handleContextMenu = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  // Manejar eventos táctiles para soporte móvil
  const handleTouchStart = (e, message) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    const timer = setTimeout(() => {
      handleContextMenu({ 
        preventDefault: () => {}, 
        stopPropagation: () => {},
        clientX: touch.clientX, 
        clientY: touch.clientY 
      }, message);
    }, 500);
    
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    setTouchStartPos(null);
  };

  const handleTouchMove = (e) => {
    if (touchStartPos) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);
      
      if (deltaX > 10 || deltaY > 10) {
        if (touchTimer) {
          clearTimeout(touchTimer);
          setTouchTimer(null);
        }
        setTouchStartPos(null);
      }
    }
  };

  // Opciones del menú contextual para mensajes propios
  const getOwnMessageOptions = (message) => [
    {
      label: 'Responder',
      icon: <ReplyIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar responder mensaje
      },
    },
    {
      label: 'Copiar',
      icon: <ContentCopyIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        navigator.clipboard.writeText(message.content);
      },
    },
    {
      label: 'Reenviar',
      icon: <ForwardIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar reenviar mensaje
      },
    },
    {
      label: 'Destacar',
      icon: <StarIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar destacar mensaje
      },
    },
    {
      label: 'Fijar',
      icon: <PushPinIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar fijar mensaje
      },
    },
    { divider: true },
    {
      label: 'Eliminar',
      icon: <DeleteIcon sx={{ fontSize: 18 }} />,
      danger: true,
      onClick: () => {
        setConfirmDialog({ isOpen: true, messageId: message.id });
      },
    },
    {
      label: 'Seleccionar',
      icon: <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar seleccionar mensaje
      },
    },
    {
      label: 'Compartir',
      icon: <ShareIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar compartir mensaje
      },
    },
    {
      label: 'Info.',
      icon: <InfoIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar info del mensaje
      },
    },
  ];

  // Opciones del menú contextual para mensajes recibidos
  const getReceivedMessageOptions = (message) => [
    {
      label: 'Responder',
      icon: <ReplyIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar responder mensaje
      },
    },
    {
      label: 'Copiar',
      icon: <ContentCopyIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        navigator.clipboard.writeText(message.content);
      },
    },
    {
      label: 'Reenviar',
      icon: <ForwardIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar reenviar mensaje
      },
    },
    {
      label: 'Destacar',
      icon: <StarIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar destacar mensaje
      },
    },
    {
      label: 'Fijar',
      icon: <PushPinIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar fijar mensaje
      },
    },
    { divider: true },
    {
      label: 'Eliminar para mí',
      icon: <DeleteIcon sx={{ fontSize: 18 }} />,
      danger: true,
      onClick: () => {
        setConfirmDialog({ isOpen: true, messageId: message.id });
      },
    },
    {
      label: 'Seleccionar',
      icon: <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar seleccionar mensaje
      },
    },
    {
      label: 'Compartir',
      icon: <ShareIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar compartir mensaje
      },
    },
    {
      label: 'Info.',
      icon: <InfoIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        // TODO: Implementar info del mensaje
      },
    },
  ];

  // Reacciones rápidas
  const reactions = [
    { icon: <ThumbUpIcon sx={{ fontSize: 18 }} />, label: 'Me gusta' },
    { icon: <FavoriteIcon sx={{ fontSize: 18 }} />, label: 'Amor' },
    { icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 18 }} />, label: 'Risa' },
    { icon: <EmojiEmotionsIcon sx={{ fontSize: 18 }} />, label: 'Sorpresa' },
    { icon: <InsertEmoticonIcon sx={{ fontSize: 18 }} />, label: 'Triste' },
    { icon: <AddIcon sx={{ fontSize: 18 }} />, label: 'Más' },
  ];

  // Scroll al mensaje activo cuando cambie la selección
  useEffect(() => {
    if (searchTerm && currentMatchIndex > 0) {
      const matchingMessages = messages.filter(message => messageMatches(message, searchTerm));
      if (currentMatchIndex <= matchingMessages.length) {
        const activeMessage = matchingMessages[currentMatchIndex - 1];
        const activeIndex = messages.findIndex(msg => msg.id === activeMessage.id);
        
        if (activeIndex !== -1 && messageRefs.current[activeIndex]) {
          messageRefs.current[activeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [searchTerm, currentMatchIndex, messages]);

  // Cleanup para el timer táctil cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
      }
    };
  }, [touchTimer]);

  // Auto-scroll al final cuando llegan nuevos mensajes o cambia la conversación (solucioné el error de scroll que tenia antes)
  useEffect(() => {
    if (!containerRef.current) return;
    // Usar requestAnimationFrame para esperar al render
    requestAnimationFrame(() => {
      if (!containerRef.current) return; // El componente pudo desmontarse correctamente en jsdom
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    });
  }, [messages?.length, activeConversation?.id]);

  return (
    <div className={styles.messageList} ref={containerRef}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay mensajes aún</p>
        </div>
      ) : (
        messages.map((message, index) => {
          // Determinar si este es el mensaje actualmente seleccionado
          const matchingMessages = messages.filter(msg => messageMatches(msg, searchTerm));
          const isActiveMessage = searchTerm && currentMatchIndex > 0 && 
            matchingMessages[currentMatchIndex - 1]?.id === message.id;
          
          return (
            <div 
              key={message.id} 
              ref={el => messageRefs.current[index] = el}
              className={`${styles.messageContainer} ${message.isOwn ? styles.ownMessage : styles.otherMessage}`}
              onContextMenu={(e) => handleContextMenu(e, message)}
              onTouchStart={(e) => handleTouchStart(e, message)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              {/* Avatar para mensajes recibidos */}
              {!message.isOwn && activeConversation && (
                <div className={styles.messageAvatar}>
                  {activeConversation.avatar ? (
                    <img src={activeConversation.avatar} alt={activeConversation.name} className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {activeConversation.name[0]}
                    </div>
                  )}
                </div>
              )}
              
              {/* Barra de reacciones rápidas */}
              {showReactionBar.isOpen && showReactionBar.messageId === message.id && (
                <div 
                  className={styles.reactionBar}
                  style={{ 
                    top: showReactionBar.y - 50,
                    left: showReactionBar.x - 150,
                  }}
                >
                  {reactions.map((reaction, idx) => (
                    <button 
                      key={idx}
                      className={styles.reactionButton}
                      onClick={() => {
                        // TODO: Implementar reacciones a mensajes
                        setShowReactionBar({ isOpen: false, x: 0, y: 0, messageId: null });
                      }}
                      title={reaction.label}
                    >
                      {reaction.icon}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.messageBubble}>
                <div className={styles.messageContent}>
                  {highlightText(message.content, searchTerm, isActiveMessage)}
                </div>
                <div className={styles.messageTime}>
                  {message.timestamp}
                  {message.isOwn && (
                    message.pending ? (
                      // Indicador de envío pendiente
                      <span className={styles.pendingCheck}>✓</span>
                    ) : (
                      <span className={styles.checkmarks}>✓✓</span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Menú contextual */}
      {contextMenu.isOpen && contextMenu.message && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          options={
            contextMenu.message.isOwn 
              ? getOwnMessageOptions(contextMenu.message)
              : getReceivedMessageOptions(contextMenu.message)
          }
          onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0, message: null })}
        />
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="¿Deseas eliminar este mensaje?"
        message="Este mensaje se eliminará para ti. Los demás participantes de la conversación aún podrán verlo."
        onConfirm={() => handleDeleteMessage(confirmDialog.messageId)}
        onCancel={() => setConfirmDialog({ isOpen: false, messageId: null })}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmStyle="danger"
      />
    </div>
  );
};

export default MessageList;
