import { useEffect } from 'react';

export const useEscapeKey = (callback) => {
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                callback();
            }
        };

        document.addEventListener('keydown', handleEscape, { once: false, capture: true });

        return () => {
            document.removeEventListener('keydown', handleEscape, { capture: true });
        };
    }, [callback]);
};
