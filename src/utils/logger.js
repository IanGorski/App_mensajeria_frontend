// Creo un logger utilitario que solo muestra mensajes en desarrollo
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export const log = (...args) => { if (isDev) console.log(...args); };
export const debug = (...args) => { if (isDev) console.debug(...args); };
export const warn = (...args) => { if (isDev) console.warn(...args); };
export const error = (...args) => { console.error(...args); };

export default { log, debug, warn, error };
