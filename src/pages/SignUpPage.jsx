import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './SignUpPage.module.css';

function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        setNameError('');
        if (value && value.length < 2) {
            setNameError('El nombre debe tener al menos 2 caracteres');
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError('');
        if (value && !validateEmail(value)) {
            setEmailError('Ingresa un email válido');
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError('');
        if (value && !validatePassword(value)) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres');
        }
        if (confirmPassword && value !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError('');
        if (value && value !== password) {
            setConfirmPasswordError('Las contraseñas no coinciden');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validaciones
        if (name.length < 2) {
            setNameError('El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Ingresa un email válido');
            return;
        }

        if (!validatePassword(password)) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const response = await register({ name, email, password });
            setSuccess(response.message || 'Registro exitoso. Por favor, verifica tu email.');
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Error al registrarse. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signupPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <MessageCircle size={120} strokeWidth={1.5} />
                    </div>
                    <h1>Únete a nuestra comunidad</h1>
                    <p>Conéctate con personas de todo el mundo al instante</p>
                </div>
                <div className={styles.benefitsSection}>
                    <div className={styles.benefitItem}>
                        <CheckCircle size={24} />
                        <span>100% Gratis</span>
                    </div>
                    <div className={styles.benefitItem}>
                        <CheckCircle size={24} />
                        <span>Mensajes ilimitados</span>
                    </div>
                    <div className={styles.benefitItem}>
                        <CheckCircle size={24} />
                        <span>Disponible en todo</span>
                    </div>
                    <div className={styles.benefitItem}>
                        <CheckCircle size={24} />
                        <span>Privacidad garantizada</span>
                    </div>
                </div>
                <div className={styles.formSection}>
                    <div className={styles.formHeader}>
                        <div className={styles.logoWrapper}>
                            <MessageCircle size={40} />
                        </div>
                        <h2>Crear tu cuenta</h2>
                        <p>Rápido, fácil y seguro</p>
                    </div>
                    {error && (
                        <div className={styles.error}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className={styles.success}>
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            type="text"
                            label="Nombre completo"
                            placeholder="Juan Pérez García"
                            value={name}
                            onChange={handleNameChange}
                            error={nameError}
                            required
                            leftIcon={<User size={20} />}
                            autoComplete="name"
                        />
                        <Input
                            type="email"
                            label="Correo Electrónico"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={handleEmailChange}
                            error={emailError}
                            required
                            leftIcon={<Mail size={20} />}
                            autoComplete="email"
                        />
                        <Input
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePasswordChange}
                            error={passwordError}
                            helperText="Mínimo 6 caracteres recomendado"
                            required
                            leftIcon={<Lock size={20} />}
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            label="Confirmar Contraseña"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            error={confirmPasswordError}
                            required
                            leftIcon={<Lock size={20} />}
                            autoComplete="new-password"
                        />
                        <div className={styles.termsSection}>
                            <label className={styles.checkboxWrapper}>
                                <input type="checkbox" required />
                                <span>
                                    Acepto los <a href="/terms">Términos de Uso</a> y la <a href="/privacy">Política de Privacidad</a>
                                </span>
                            </label>
                        </div>
                        <Button 
                            type="submit" 
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            rightIcon={<ArrowRight size={20} />}
                        >
                            Crear mi cuenta
                        </Button>
                    </form>
                    <div className={styles.dividerSection}>
                        <span>O regístrate con</span>
                    </div>
                    <div className={styles.socialButtonsSection}>
                        <button className={styles.socialButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </button>
                        <button className={styles.socialButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </button>
                    </div>
                    <p className={styles.footerLink}>
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;