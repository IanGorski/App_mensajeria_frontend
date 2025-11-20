import styles from './TypingIndicator.module.css';

const TypingIndicator = ({ userName = 'Usuario' }) => {
    return (
        <div className={styles.typingContainer}>
            <span className={styles.typingText}>{userName} está escribiendo</span>
            <div className={styles.dotsContainer}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
            </div>
        </div>
    );
};

export default TypingIndicator;
