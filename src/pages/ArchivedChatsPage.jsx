import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ArchivedChatsPage.module.css';
import { useAppContext } from '../context/AppContext';
import UserCard from '../ui/UserCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const ArchivedChatsPage = () => {
  const navigate = useNavigate();
  const { conversations, handleUnarchiveConversation, handleToggleRead, handleClearConversation, handleDeleteConversation, markAsRead, markAsUnread } = useAppContext();
  const [contextMenu, setContextMenu] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);

  // Filtrar solo chats archivados
  const archivedChats = conversations.filter(conv => conv.isArchived);

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chat: chat
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleMenuAction = (action, chatId) => {
    switch (action) {
      case 'toggleRead':
        handleToggleRead(chatId);
        break;
      case 'unarchive':
        handleUnarchiveConversation(chatId);
        break;
      case 'clearMessages':
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los mensajes de este chat?')) {
          handleClearConversation(chatId);
        }
        break;
      case 'deleteChat':
        if (window.confirm('¿Estás seguro de que quieres eliminar este chat?')) {
          handleDeleteConversation(chatId);
        }
        break;
      case 'openInNewWindow':
        window.open(`/chat/${chatId}`, '_blank');
        break;
      default:
        break;
    }
    closeContextMenu();
  };

  const handleTouchStart = (e, chat) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    const timer = setTimeout(() => {
      handleContextMenu({ 
        preventDefault: () => {}, 
        clientX: touch.clientX, 
        clientY: touch.clientY 
      }, chat);
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

  React.useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => {
        document.removeEventListener('click', closeContextMenu);
      };
    }
  }, [contextMenu]);

  // Cleanup para el timer táctil cuando el componente se desmonta
  React.useEffect(() => {
    return () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
      }
    };
  }, [touchTimer]);

  return (
    <div className={styles.archivedChatsPage}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/chats')}
          title="Volver a chats"
        >
          <ArrowBackIcon sx={{ fontSize: 24 }} />
        </button>
        <h2>Chats archivados</h2>
      </div>

      <div className={styles.chatsList}>
        {archivedChats.length === 0 ? (
          <div className={styles.emptyState}>
            <UnarchiveIcon sx={{ fontSize: 64, color: '#8696a0' }} />
            <h3>No hay chats archivados</h3>
            <p>Los chats que archives aparecerán aquí</p>
          </div>
        ) : (
          archivedChats.map((chat) => (
            <div 
              key={chat.id} 
              className={styles.chatItem}
              onContextMenu={(e) => handleContextMenu(e, chat)}
              onTouchStart={(e) => handleTouchStart(e, chat)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              <UserCard
                user={chat}
                onClick={() => navigate(`/chat/${chat.id}`)}
                isChat={true}
                disableContextMenu={true}
              />
            </div>
          ))
        )}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 1000
          }}
        >
          <div 
            className={styles.menuItem}
            onClick={() => {
              if (contextMenu.chat.isUnread) {
                markAsRead(contextMenu.chat.id);
              } else {
                markAsUnread(contextMenu.chat.id);
              }
            }}
          >
            {contextMenu.chat.isUnread ? (
              <>
                <DraftsIcon sx={{ fontSize: 18 }} />
                <span>Marcar como leído</span>
              </>
            ) : (
              <>
                <MarkAsUnreadIcon sx={{ fontSize: 18 }} />
                <span>Marcar como no leído</span>
              </>
            )}
          </div>
          <div 
            className={styles.menuItem}
            onClick={() => handleMenuAction('unarchive', contextMenu.chat.id)}
          >
            <UnarchiveIcon sx={{ fontSize: 18 }} />
            <span>Desarchivar</span>
          </div>
          <div 
            className={styles.menuItem}
            onClick={() => handleMenuAction('clearMessages', contextMenu.chat.id)}
          >
            <DeleteSweepIcon sx={{ fontSize: 18 }} />
            <span>Eliminar mensajes</span>
          </div>
          <div 
            className={styles.menuItem}
            onClick={() => handleMenuAction('deleteChat', contextMenu.chat.id)}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
            <span>Eliminar chat</span>
          </div>
          <div 
            className={styles.menuItem}
            onClick={() => handleMenuAction('openInNewWindow', contextMenu.chat.id)}
          >
            <OpenInNewIcon sx={{ fontSize: 18 }} />
            <span>Abrir en otra ventana</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedChatsPage;
