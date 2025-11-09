import React, { useState, useEffect, useRef } from 'react';
import styles from './MessageComposer.module.css';
import { Smile, Paperclip, Send, Mic, ClipboardPaste, Type } from 'lucide-react';
import ContextMenu from './ContextMenu';

const MessageComposer = ({ onSendMessage, conversationId, onTypingChange }) => {
  const [message, setMessage] = useState('');
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Limpiar el input cuando cambie la conversación
  useEffect(() => {
    setMessage('');
  }, [conversationId]);

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Notificar que el usuario está escribiendo
    if (onTypingChange) {
      onTypingChange(newMessage.length > 0);
      
      // Después de 3 segundos sin escribir, enviar que dejó de escribir
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange(false);
      }, 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Notificar que dejó de escribir
      if (onTypingChange) {
        onTypingChange(false);
      }
      
      // Limpiar timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleIconClick = () => {
    // TODO: Implementar funcionalidad de iconos adicionales
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMessage(prev => prev + text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch {
      // Silencio si falla la lectura
    }
  };

  const inputContextMenuOptions = [
    {
      label: 'Pegar',
      icon: <ClipboardPaste size={18} />,
      onClick: handlePaste,
    },
    {
      label: 'Formato de texto',
      icon: <Type size={18} />,
      onClick: () => {
        // TODO: Implementar formato de texto
      },
    },
  ];

  return (
    <div className={styles.messageComposer}>
      <div className={styles.leftButtons}>
        <button type="button" className={styles.emojiButton} title="Emoji" onClick={handleIconClick}>
          <Smile size={24} />
        </button>
        <button type="button" className={styles.attachButton} title="Adjuntar" onClick={handleIconClick}>
          <Paperclip size={24} />
        </button>
      </div>
      
      <form className={styles.messageForm} onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            placeholder="Escribe un mensaje"
            className={styles.messageInput}
          />
        </div>
      </form>
        
      <button 
        type="button" 
        className={styles.sendButton}
        onClick={message.trim() ? handleSubmit : handleIconClick}
        title={message.trim() ? "Enviar" : "Grabar audio"}
      >
        {message.trim() ? (
          <Send size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {/* Menú contextual para el input */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        options={inputContextMenuOptions}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
      />
    </div>
  );
};

export default MessageComposer;
