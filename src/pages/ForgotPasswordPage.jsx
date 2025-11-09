import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './ForgotPasswordPage.module.css';
import axios from 'axios';
import ENV from '../config/env';

const ForgotPasswordPage = () => {
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
          <h2>¡Correo Enviado!</h2>
          <p>
            Hemos enviado un correo a <strong>{email}</strong> con instrucciones
            para restablecer tu contraseña.
          </p>
          <p className={styles.hint}>
            Por favor, revisa tu bandeja de entrada y la carpeta de spam.
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
          Volver
        </Link>

        <div className={styles.header}>
          <Mail size={48} className={styles.icon} />
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña.
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
            label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={20} />}
            placeholder="tu@email.com"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Enviar instrucciones
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.loginLink}>
            Recordé mi contraseña
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
