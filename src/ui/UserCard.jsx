import React, { useState } from 'react';
import styles from './UserCard.module.css';
import PushPinIcon from '@mui/icons-material/PushPin';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import ContextMenu from './ContextMenu';
import ConfirmDialog from './ConfirmDialog';
import { useAppContext } from '../context/AppContext';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const UserCard = ({ user, onClick, isChat = false, disableContextMenu = false }) => {
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const [showSubmenu, setShowSubmenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null });
  const [touchTimer, setTouchTimer] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  
  const {
    handleMuteConversation,
    handleUnmuteConversation,
    handlePinConversation,
    handleUnpinConversation,
    handleArchiveConversation,
    handleDeleteConversation,
    handleClearConversation,
    markAsUnread,
    markAsRead,
  } = useAppContext();

  const handleContextMenu = (e) => {
    if (!isChat || disableContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleTouchStart = (e) => {
    if (!isChat || disableContextMenu) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    const timer = setTimeout(() => {
      // Mostrar menú contextual después de 500ms
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        x: touch.clientX,
        y: touch.clientY,
      });
    }, 500);
    
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleTouchMove = (e) => {
    if (touchTimer) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.x);
      const dy = Math.abs(touch.clientY - touchStartPos.y);
      
      // Si se mueve más de 10px, cancelar el menú contextual
      if (dx > 10 || dy > 10) {
        clearTimeout(touchTimer);
        setTouchTimer(null);
      }
    }
  };

  const isMuted = user?.muteUntil !== undefined;
  const isPinned = user?.isPinned;

  const getMuteText = () => {
    if (!isMuted) return null;
    if (user.muteUntil === null) return 'Silenciado siempre';
    const muteTime = new Date(user.muteUntil).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `Silenciado hasta las ${muteTime}`;
  };

  const handleOpenInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      `/chat/${user.id}`, 
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const contextMenuOptions = [
    {
      label: user.isUnread ? 'Marcar como leído' : 'Marcar como no leído',
      icon: <MarkEmailUnreadIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        if (user.isUnread) {
          markAsRead(user.id);
        } else {
          markAsUnread(user.id);
        }
      },
    },
    {
      label: isPinned ? 'Desfijar' : 'Fijar arriba',
      icon: <PushPinIcon sx={{ fontSize: 18 }} />,
      onClick: () => {
        if (isPinned) {
          handleUnpinConversation(user.id);
        } else {
          handlePinConversation(user.id);
        }
      },
    },
    {
      label: isMuted ? getMuteText() : 'Silenciar',
      icon: <NotificationsOffIcon sx={{ fontSize: 18 }} />,
      submenu: !isMuted ? [
        {
          label: 'Por 8 horas',
          onClick: () => handleMuteConversation(user.id, '8h'),
        },
        {
          label: 'Por una semana',
          onClick: () => handleMuteConversation(user.id, '1w'),
        },
        {
          label: 'Siempre',
          onClick: () => handleMuteConversation(user.id, 'always'),
        },
      ] : undefined,
      onClick: () => {
        if (isMuted) {
          handleUnmuteConversation(user.id);
        } else {
          setShowSubmenu('Silenciar');
        }
      },
    },
    ...(isMuted ? [{
      label: 'Desactivar silencio',
      icon: <NotificationsOffIcon sx={{ fontSize: 18 }} />,
      onClick: () => handleUnmuteConversation(user.id),
    }] : []),
    {
      label: 'Archivar',
      icon: <ArchiveIcon sx={{ fontSize: 18 }} />,
      onClick: () => handleArchiveConversation(user.id),
    },
    { divider: true },
    {
      label: 'Eliminar mensajes',
      icon: <DeleteIcon sx={{ fontSize: 18 }} />,
      danger: true,
      onClick: () => {
        setConfirmDialog({ isOpen: true, type: 'clear' });
      },
    },
    {
      label: 'Eliminar el chat',
      icon: <DeleteIcon sx={{ fontSize: 18 }} />,
      danger: true,
      onClick: () => {
        setConfirmDialog({ isOpen: true, type: 'delete' });
      },
    },
    { divider: true },
    {
      label: 'Abrir el chat en una ventana nueva',
      icon: <OpenInNewIcon sx={{ fontSize: 18 }} />,
      onClick: handleOpenInNewWindow,
    },
  ];

  const handleConfirmDelete = () => {
    if (confirmDialog.type === 'delete') {
      handleDeleteConversation(user.id);
    } else if (confirmDialog.type === 'clear') {
      handleClearConversation(user.id);
    }
    setConfirmDialog({ isOpen: false, type: null });
  };

  const renderUnreadBadge = () => {
    if (isChat && user.isUnread) {
      return <div className={styles.unreadBadge}></div>;
    }
    return null;
  };

  const handleCardClick = () => {
    if (user.isUnread) {
      markAsRead(user.id);
    }
    onClick();
  };

  return (
    <>
      <div 
        className={styles.userCard} 
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className={styles.avatar}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className={styles.avatarImage} loading="lazy" />
          ) : (
            getInitials(user?.name) || 'U'
          )}
          {/* Indicador de estado online */}
          {isChat && user?.isOnline && (
            <div className={styles.onlineIndicator} title="En línea"></div>
          )}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.topRow}>
            <h4>{user?.name || 'Unknown User'}</h4>
            <div className={styles.iconContainer}>
              {isChat && isPinned && (
                <span className={styles.pinnedIcon}>
                  <PushPinIcon sx={{ fontSize: 18, color: '#54656f' }} />
                </span>
              )}
              {isChat && (
                <span className={styles.time}>
                  {user?.time ? new Date(user.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              )}
            </div>
          </div>
          <div className={styles.bottomRow}>
            <p className={styles.lastMessage}>
              {isChat ? (
                <>
                  {user?.lastMessageIsOwn && <span className={styles.checkmarks}>✓✓ </span>}
                  {user?.lastMessage}
                </>
              ) : (
                user?.status || 'en línea'
              )}
            </p>
            <div className={styles.badgeContainer}>
              {isChat && isMuted && (
                <span className={styles.mutedIcon}>
                  <NotificationsOffIcon sx={{ fontSize: 18, color: '#54656f' }} />
                </span>
              )}
              {renderUnreadBadge()}
            </div>
          </div>
        </div>
      </div>

      {isChat && (
        <>
          <ContextMenu
            isOpen={contextMenu.isOpen}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            options={contextMenuOptions}
            onClose={() => {
              setContextMenu({ isOpen: false, x: 0, y: 0 });
              setShowSubmenu(null);
            }}
            showSubmenu={showSubmenu}
          />

          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.type === 'delete' ? '¿Deseas eliminar el chat con ' + user?.name + '?' : '¿Deseas vaciar el chat con ' + user?.name + '?'}
            message="Se eliminarán los mensajes de todos tus dispositivos."
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
            confirmText={confirmDialog.type === 'delete' ? 'Eliminar' : 'Vaciar'}
            cancelText="Cancelar"
            confirmStyle="danger"
          />
        </>
      )}
    </>
  );
};

function getInitials(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default UserCard;
