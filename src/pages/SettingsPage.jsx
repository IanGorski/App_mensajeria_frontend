import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import CloseIcon from '@mui/icons-material/Close';

const SettingsPage = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [settings, setSettings] = useState({
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        soundEnabled: true,
        cameraResolution: 'high',
        microphoneVolume: 50,
        colorScheme: 'default',
        fontStyle: 'default'
    });

    const handleOptionClick = (modalType) => {
        setActiveModal(modalType);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderModal = () => {
        if (!activeModal) return null;

        const modalContent = {
            general: (
                <div className={styles.modalContent}>
                    <h3>Configuración General</h3>
                    <div className={styles.settingGroup}>
                        <label>Tema</label>
                        <select 
                            value={settings.theme} 
                            onChange={(e) => updateSetting('theme', e.target.value)}
                            className={styles.select}
                        >
                            <option value="light">Claro</option>
                            <option value="dark">Oscuro</option>
                            <option value="auto">Automático</option>
                        </select>
                    </div>
                    <div className={styles.settingGroup}>
                        <label>Tamaño de fuente</label>
                        <select 
                            value={settings.fontSize} 
                            onChange={(e) => updateSetting('fontSize', e.target.value)}
                            className={styles.select}
                        >
                            <option value="small">Pequeño</option>
                            <option value="medium">Mediano</option>
                            <option value="large">Grande</option>
                        </select>
                    </div>
                </div>
            ),
            profile: (
                <div className={styles.modalContent}>
                    <h3>Perfil</h3>
                    <div className={styles.settingGroup}>
                        <label>Nombre</label>
                        <input type="text" placeholder="Tu nombre" className={styles.input} />
                    </div>
                    <div className={styles.settingGroup}>
                        <label>Información</label>
                        <textarea placeholder="Escribe algo sobre ti..." className={styles.textarea}></textarea>
                    </div>
                    <button className={styles.saveButton}>Guardar cambios</button>
                </div>
            ),
            backup: (
                <div className={styles.modalContent}>
                    <h3>Respaldo de Chats</h3>
                    <p>Última copia de seguridad: Nunca</p>
                    <button className={styles.primaryButton}>Hacer copia de seguridad ahora</button>
                    <div className={styles.settingGroup}>
                        <label>
                            <input type="checkbox" />
                            <span>Incluir videos</span>
                        </label>
                    </div>
                </div>
            ),
            camera: (
                <div className={styles.modalContent}>
                    <h3>Configuración de Cámara</h3>
                    <div className={styles.settingGroup}>
                        <label>Resolución</label>
                        <select 
                            value={settings.cameraResolution} 
                            onChange={(e) => updateSetting('cameraResolution', e.target.value)}
                            className={styles.select}
                        >
                            <option value="low">Baja (480p)</option>
                            <option value="medium">Media (720p)</option>
                            <option value="high">Alta (1080p)</option>
                        </select>
                    </div>
                </div>
            ),
            microphone: (
                <div className={styles.modalContent}>
                    <h3>Configuración de Micrófono</h3>
                    <div className={styles.settingGroup}>
                        <label>Volumen: {settings.microphoneVolume}%</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={settings.microphoneVolume}
                            onChange={(e) => updateSetting('microphoneVolume', e.target.value)}
                            className={styles.range}
                        />
                    </div>
                </div>
            ),
            notifications: (
                <div className={styles.modalContent}>
                    <h3>Notificaciones</h3>
                    <div className={styles.settingGroup}>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={settings.notifications}
                                onChange={(e) => updateSetting('notifications', e.target.checked)}
                            />
                            <span>Habilitar notificaciones</span>
                        </label>
                    </div>
                    <div className={styles.settingGroup}>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={settings.soundEnabled}
                                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                            />
                            <span>Sonido de notificaciones</span>
                        </label>
                    </div>
                </div>
            ),
            colors: (
                <div className={styles.modalContent}>
                    <h3>Personalizar Colores</h3>
                    <div className={styles.colorGrid}>
                        {['default', 'blue', 'purple', 'green', 'orange'].map(color => (
                            <button
                                key={color}
                                className={`${styles.colorOption} ${settings.colorScheme === color ? styles.active : ''}`}
                                onClick={() => updateSetting('colorScheme', color)}
                                style={{ backgroundColor: color === 'default' ? '#00a884' : color }}
                            >
                                {color === 'default' ? 'Por defecto' : color}
                            </button>
                        ))}
                    </div>
                </div>
            ),
            fonts: (
                <div className={styles.modalContent}>
                    <h3>Estilo de Fuente</h3>
                    <div className={styles.fontOptions}>
                        {['default', 'serif', 'monospace', 'cursive'].map(font => (
                            <button
                                key={font}
                                className={`${styles.fontOption} ${settings.fontStyle === font ? styles.active : ''}`}
                                onClick={() => updateSetting('fontStyle', font)}
                                style={{ fontFamily: font }}
                            >
                                Texto de ejemplo
                            </button>
                        ))}
                    </div>
                </div>
            ),
            storage: (
                <div className={styles.modalContent}>
                    <h3>Uso de Almacenamiento</h3>
                    <div className={styles.storageInfo}>
                        <p>Almacenamiento total: 256 MB</p>
                        <div className={styles.storageBar}>
                            <div className={styles.storageUsed} style={{ width: '45%' }}></div>
                        </div>
                        <p>115 MB usados de 256 MB</p>
                    </div>
                    <button className={styles.dangerButton}>Liberar espacio</button>
                </div>
            ),
            shortcuts: (
                <div className={styles.modalContent}>
                    <h3>Atajos de Teclado</h3>
                    <div className={styles.shortcutList}>
                        <div className={styles.shortcutItem}>
                            <span>Nueva conversación</span>
                            <kbd>Ctrl + N</kbd>
                        </div>
                        <div className={styles.shortcutItem}>
                            <span>Buscar</span>
                            <kbd>Ctrl + F</kbd>
                        </div>
                        <div className={styles.shortcutItem}>
                            <span>Cerrar chat</span>
                            <kbd>ESC</kbd>
                        </div>
                        <div className={styles.shortcutItem}>
                            <span>Ajustes</span>
                            <kbd>Ctrl + ,</kbd>
                        </div>
                    </div>
                </div>
            ),
            help: (
                <div className={styles.modalContent}>
                    <h3>Centro de Ayuda</h3>
                    <div className={styles.helpSection}>
                        <h4>Preguntas Frecuentes</h4>
                        <ul>
                            <li>¿Cómo cambiar mi foto de perfil?</li>
                            <li>¿Cómo hacer una copia de seguridad?</li>
                            <li>¿Cómo silenciar conversaciones?</li>
                            <li>¿Cómo archivar chats?</li>
                        </ul>
                    </div>
                    <button className={styles.primaryButton}>Contactar soporte</button>
                </div>
            )
        };

        return (
            <div className={styles.modalOverlay} onClick={closeModal}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeButton} onClick={closeModal}>
                        <CloseIcon />
                    </button>
                    {modalContent[activeModal]}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.settingsPage}>
            <div className={styles.settingsHeader}>
                <h2>⚙️ Ajustes</h2>
                <p>Personaliza tu experiencia de WhatsApp</p>
            </div>

            <div className={styles.settingsContent}>
                <div className={styles.settingsSection}>
                    <h3>General</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('general')}>
                        <span className={styles.settingsIcon}>💻</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Configuración general</span>
                            <span className={styles.settingsDesc}>Preferencias básicas</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Cuenta</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('profile')}>
                        <span className={styles.settingsIcon}>👤</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Perfil</span>
                            <span className={styles.settingsDesc}>Foto, nombre, información</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Chats</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('backup')}>
                        <span className={styles.settingsIcon}>💬</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Respaldo de chats</span>
                            <span className={styles.settingsDesc}>Historial, medios, ajustes</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Audio y video</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('camera')}>
                        <span className={styles.settingsIcon}>🎥</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Configuración de cámara</span>
                            <span className={styles.settingsDesc}>Resolución, permisos</span>
                        </div>
                    </div>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('microphone')}>
                        <span className={styles.settingsIcon}>🎙️</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Configuración de micrófono</span>
                            <span className={styles.settingsDesc}>Volumen, permisos</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Notificaciones</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('notifications')}>
                        <span className={styles.settingsIcon}>🔔</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Mensajes</span>
                            <span className={styles.settingsDesc}>Tono, vibración, notificaciones emergentes</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Personalización</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('colors')}>
                        <span className={styles.settingsIcon}>🖌️</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Colores</span>
                            <span className={styles.settingsDesc}>Personaliza los colores de la app</span>
                        </div>
                    </div>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('fonts')}>
                        <span className={styles.settingsIcon}>🔤</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Fuentes</span>
                            <span className={styles.settingsDesc}>Elige el estilo de fuente</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Almacenamiento</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('storage')}>
                        <span className={styles.settingsIcon}>💾</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Uso de almacenamiento</span>
                            <span className={styles.settingsDesc}>Espacio ocupado por archivos y mensajes</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Atajos</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('shortcuts')}>
                        <span className={styles.settingsIcon}>⌨️</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Teclas rápidas</span>
                            <span className={styles.settingsDesc}>Configura accesos rápidos</span>
                        </div>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3>Ayuda</h3>
                    <div className={styles.settingsItem} onClick={() => handleOptionClick('help')}>
                        <span className={styles.settingsIcon}>❓</span>
                        <div className={styles.settingsText}>
                            <span className={styles.settingsTitle}>Centro de ayuda</span>
                            <span className={styles.settingsDesc}>Preguntas frecuentes y soporte</span>
                        </div>
                    </div>
                </div>
            </div>
            {renderModal()}
        </div>
    );
};

export default SettingsPage;
