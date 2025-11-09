import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

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
  const isFloating = isFocused || hasValue;

  const inputClasses = [
    'input-field',
    leftIcon && 'input-with-left-icon',
    rightIcon && 'input-with-right-icon',
    error && 'input-error',
    disabled && 'input-disabled',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'input-container',
    isFloating && 'input-floating',
    error && 'input-has-error',
    disabled && 'input-is-disabled'
  ].filter(Boolean).join(' ');

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={containerClasses}>
      <div className="input-wrapper">
        {leftIcon && (
          <span className="input-icon input-icon-left">
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
          placeholder={isFloating ? placeholder : ''}
          {...props}
        />

        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        {type === 'password' && (
          <button
            type="button"
            className="input-icon input-icon-right input-password-toggle"
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
          <span className="input-icon input-icon-right">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <div className="input-message">
          {error ? (
            <span className="input-error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </span>
          ) : (
            <span className="input-helper-text">{helperText}</span>
          )}
        </div>
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
