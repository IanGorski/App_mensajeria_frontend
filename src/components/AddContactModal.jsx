import { useState } from 'react';
import { searchUsers } from '@services/user.service';
import { createPrivateChat } from '@services/chat.service';
import { X, Search, UserPlus, Mail } from 'lucide-react';
import styles from './AddContactModal.module.css';

const AddContactModal = ({ isOpen, onClose, onContactAdded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (searchTerm.length < 3) {
            setError('Ingresa al menos 3 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await searchUsers(searchTerm);
            setSearchResults(response.data || []);

            if (!response.data || response.data.length === 0) {
                setError('No se encontraron usuarios');
            }
        } catch (err) {
            setError(err.message || 'Error al buscar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async (userId) => {
        setLoading(true);
        setError('');

        try {
            const response = await createPrivateChat(userId);
            
            if (onContactAdded) {
                onContactAdded(response.data);
            }

            // Limpiar y cerrar modal
            setSearchTerm('');
            setSearchResults([]);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al agregar contacto');
        } finally {
            setLoading(false);
        }
    };

    const formatLastConnection = (date) => {
        if (!date) return 'Nunca';
        const now = new Date();
        const lastConn = new Date(date);
        const diffMinutes = Math.floor((now - lastConn) / (1000 * 60));

        if (diffMinutes < 1) return 'Hace un momento';
        if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} días`;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerIcon}>
                            <UserPlus size={24} />
                        </div>
                        <h2>Agregar Contacto</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className={styles.closeButton}
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.inputWrapper}>
                        <Mail size={20} className={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="Buscar por email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading} className={styles.searchButton}>
                        <Search size={20} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.results}>
                    {searchResults.map((user) => (
                        <div key={user.id} className={styles.userResult}>
                            <div className={styles.userInfo}>
                                <div className={styles.userAvatar}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.userDetails}>
                                    <h3>{user.name}</h3>
                                    <p className={styles.email}>{user.email}</p>
                                    <span className={user.online ? styles.online : styles.offline}>
                                        <span className={styles.statusDot}></span>
                                        {user.online 
                                            ? 'En línea' 
                                            : formatLastConnection(user.last_connection)
                                        }
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAddContact(user.id)}
                                disabled={loading}
                                className={styles.addButton}
                            >
                                <UserPlus size={18} />
                                Agregar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
