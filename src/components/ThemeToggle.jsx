import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
            title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
            <div className={styles.iconContainer}>
                {theme === 'light' ? (
                    <Moon size={20} className={styles.icon} />
                ) : (
                    <Sun size={20} className={styles.icon} />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
