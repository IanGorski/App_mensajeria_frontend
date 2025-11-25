import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './ForgotPasswordPage.module.css';
import axios from 'axios';
import ENV from '../config/env';

const ForgotPasswordPage = () => {
  //tema claro en páginas de autenticación
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    return () => {
      //Restaurar el tema guardado al salir
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    };
  }, []);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
  await axios.post(`${ENV.API_URL}/api/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Error al enviar el correo. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.forgotPasswordPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>¡Correo enviado exitosamente!</h2>
          <p>
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada (incluye la carpeta de spam).
          </p>
          <p className={styles.hint}>
            El enlace expirará en 30 minutos por tu seguridad.
          </p>
          <Link to="/login" className={styles.backLink}>
            <Button variant="primary" size="lg" fullWidth>
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backButton}>
          <ArrowLeft size={20} />
          Atrás
        </Link>

        <div className={styles.header}>
          <Mail size={48} className={styles.icon} />
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>
            Ingresa tu correo y te enviaremos un enlace para recuperar tu acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={20} />}
            placeholder="nombre@ejemplo.com"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Enviar enlace de recuperación
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.loginLink}>
            Recuerdo mi contraseña
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
