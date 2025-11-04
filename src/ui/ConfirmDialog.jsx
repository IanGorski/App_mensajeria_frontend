import React from 'react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, confirmStyle = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2>{title}</h2>
        </div>
        <div className={styles.dialogBody}>
          <p>{message}</p>
        </div>
        <div className={styles.dialogFooter}>
          <button 
            className={`${styles.button} ${styles[confirmStyle]}`}
            onClick={onConfirm}
          >
            {confirmText || 'Confirmar'}
          </button>
          <button 
            className={`${styles.button} ${styles.cancel}`}
            onClick={onCancel}
          >
            {cancelText || 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
