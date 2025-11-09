import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText, 
  cancelText, 
  confirmStyle = 'danger',
  icon
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {icon && (
          <div className={`${styles.iconWrapper} ${styles[`icon-${confirmStyle}`]}`}>
            {icon}
          </div>
        )}

        <div className={styles.dialogHeader}>
          <h2>{title}</h2>
        </div>
        
        <div className={styles.dialogBody}>
          <p>{message}</p>
        </div>
        
        <div className={styles.dialogFooter}>
          <button 
            className={`${styles.button} ${styles.secondary}`}
            onClick={onCancel}
          >
            {cancelText || 'Cancelar'}
          </button>
          <button 
            className={`${styles.button} ${styles[confirmStyle]}`}
            onClick={onConfirm}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
