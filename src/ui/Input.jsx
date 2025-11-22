import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

/**
 * Componente Input 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo 
 * @param {string} props.label - Etiqueta
 * @param {string} props.placeholder - Placeholder 
 * @param {string} props.value - Valor 
 * @param {string} props.error - Mensaje de error
 * @param {string} props.helperText 
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {boolean} props.required - Campo requerido
 * @param {React.ReactNode} props.leftIcon 
 * @param {React.ReactNode} props.rightIcon 
 * @param {string} props.className 
 * @param {Function} props.onChange 
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  error,
  helperText,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value && value.length > 0;

  const inputClasses = [
    styles.input,
    leftIcon && styles.withLeftIcon,
    rightIcon && styles.withRightIcon,
    error && styles.error,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    styles.container
  ].filter(Boolean).join(' ');

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={containerClasses}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      
      <div className={styles.wrapper}>
        {leftIcon && (
          <span className={styles.iconLeft}>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            className={`${styles.iconRight} ${styles.passwordToggle}`}
            onClick={handleTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

        {rightIcon && type !== 'password' && (
          <span className={styles.iconRight}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {!error && helperText && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  onChange: PropTypes.func
};

export default Input;
