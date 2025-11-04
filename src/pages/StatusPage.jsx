import React from 'react';
import styles from './StatusPage.module.css';

const StatusPage = () => {
    const handleCreateStatus = () => {
        alert('Crear estado - Función no implementada');
    };

    const sampleStatuses = [
        {
            id: 1,
            name: "Tu estado",
            time: "Añadir estado",
            isOwn: true
        },
        {
            id: 2,
            name: "John Goldberg",
            time: "hace 2 horas",
            isOwn: false,
            viewed: false
        },
        {
            id: 3,
            name: "Messi",
            time: "hace 5 horas",
            isOwn: false,
            viewed: true
        }
    ];

    return (
        <div className={styles.statusPage}>
            <div className={styles.statusHeader}>
                <h2>📊 Estados</h2>
                <p>Comparte actualizaciones con tus contactos</p>
            </div>

            <div className={styles.statusContent}>
                <div className={styles.statusSection}>
                    <h3>Recientes</h3>
                    <div className={styles.statusList}>
                        {sampleStatuses.map((status) => (
                            <div
                                key={status.id}
                                className={styles.statusItem}
                                onClick={status.isOwn ? handleCreateStatus : () => alert('Sin funcionalidad :(')}
                            >
                                <div className={`${styles.statusAvatar} ${status.isOwn ? styles.ownStatus : ''} ${status.viewed ? styles.viewedStatus : ''}`}>
                                    {status.name[0]}
                                    {status.isOwn && <span className={styles.addIcon}>+</span>}
                                </div>
                                <div className={styles.statusInfo}>
                                    <span className={styles.statusName}>{status.name}</span>
                                    <span className={styles.statusTime}>{status.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.statusActions}>
                    <button className={styles.createButton} onClick={handleCreateStatus}>
                        <span>➕</span>
                        Crear estado
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
