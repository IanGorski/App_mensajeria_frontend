import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './ResetPasswordPage.module.css';
import axios from 'axios';
import ENV from '../config/env';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [tokenValid, setTokenValid] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        await axios.get(`${ENV.API_URL}/api/auth/reset-password/validate/${token}`);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
      } finally {
        setChecking(false);
      }
    };
    validate();
  }, [token]);

  const handleResend = () => {
    navigate('/forgot-password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${ENV.API_URL}/api/auth/reset-password`, { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={styles.resetPasswordPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Lock size={48} className={styles.icon} />
            <h1>Verificando tu enlace...</h1>
            <p>Por favor espera un momento.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.resetPasswordPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Lock size={48} />
          </div>
          <h2>Enlace expirado</h2>
          <p>El enlace para restablecer tu contraseña ya no es válido.</p>
          <p>Solicita uno nuevo para continuar.</p>
          <Button variant="primary" size="lg" fullWidth onClick={handleResend}>
            Solicitar nuevo enlace
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/login')} style={{marginTop:'0.75rem'}}>
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.resetPasswordPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>¡Contraseña actualizada!</h2>
          <p>Tu contraseña se ha actualizado correctamente. Ahora puedes acceder con tu nueva contraseña.</p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetPasswordPage}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backButton}>
          <ArrowLeft size={20} />
          Atrás
        </Link>

        <div className={styles.header}>
          <Lock size={48} className={styles.icon} />
          <h1>Restablecer contraseña</h1>
          <p>Ingresa tu nueva contraseña y confírmala para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            type="password"
            label="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock size={20} />}
            placeholder="••••••••"
          />

          <Input
            type="password"
            label="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            leftIcon={<Lock size={20} />}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Actualizar mi contraseña
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
