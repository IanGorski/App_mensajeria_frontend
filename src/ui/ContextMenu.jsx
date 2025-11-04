import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ isOpen, position, options, onClose, showSubmenu }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ajustar posición si el menú se sale de la pantalla
  const adjustedPosition = { ...position };
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    const margin = 10;
    
    // Ajustar en el eje X
    if (rect.right > window.innerWidth) {
      adjustedPosition.x = Math.max(margin, window.innerWidth - rect.width - margin);
    }
    if (adjustedPosition.x < margin) {
      adjustedPosition.x = margin;
    }
    
    // Ajustar en el eje Y
    if (rect.bottom > window.innerHeight) {
      adjustedPosition.y = Math.max(margin, window.innerHeight - rect.height - margin);
    }
    if (adjustedPosition.y < margin) {
      adjustedPosition.y = margin;
    }
  }

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{ top: `${adjustedPosition.y}px`, left: `${adjustedPosition.x}px` }}
    >
      {options.map((option, index) => (
        <div key={index}>
          {option.divider ? (
            <div className={styles.divider} />
          ) : (
            <button
              className={`${styles.menuItem} ${option.danger ? styles.danger : ''}`}
              onClick={() => {
                option.onClick();
                if (!option.submenu) {
                  onClose();
                }
              }}
              disabled={option.disabled}
            >
              {option.icon && <span className={styles.icon}>{option.icon}</span>}
              <span className={styles.label}>{option.label}</span>
              {option.submenu && <span className={styles.arrow}>›</span>}
            </button>
          )}
          {option.submenu && showSubmenu === option.label && (
            <div className={styles.submenu}>
              {option.submenu.map((subOption, subIndex) => (
                <button
                  key={subIndex}
                  className={styles.menuItem}
                  onClick={() => {
                    subOption.onClick();
                    onClose();
                  }}
                >
                  <span className={styles.label}>{subOption.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
