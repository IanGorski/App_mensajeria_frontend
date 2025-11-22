import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * @param {Object} props
 * @param {string} props.variant - Variante 
 * @param {string} props.size - Tamaño 
 * @param {boolean} props.fullWidth - Si el botón debe ocupar todo el ancho
 * @param {boolean} props.loading - Estado
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {React.ReactNode} props.leftIcon 
 * @param {React.ReactNode} props.rightIcon 
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.className 
 * @param {Function} props.onClick 
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg className={styles.spinnerSvg} viewBox="0 0 50 50">
            <circle
              className={styles.spinnerPath}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </span>
      )}
      
      {!loading && leftIcon && (
        <span className={styles.iconLeft}>
          {leftIcon}
        </span>
      )}
      
      {children && <span className={styles.text}>{children}</span>}
      
      {!loading && rightIcon && (
        <span className={styles.iconRight}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func
};

export default Button;
