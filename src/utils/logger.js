// Logger utilitario: eliminar emojis
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
// Permitir logs en producción siempre (para ver en consola del navegador)
const enableLogs = true;

// Remover emojis para consola limpia
const stripEmojis = (value) => {
	if (typeof value !== 'string') return value;
	try {
		// Elimino emojis usando Unicode
		return value
			.replace(/\p{Extended_Pictographic}/gu, '')
			.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
		} catch {
		// En caso de que el runtime no soporte Unicode property escapes
		return value.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
	}
};

const sanitizeArgs = (args) => args.map((a) => (typeof a === 'string' ? stripEmojis(a) : a));

// Función para sanitizar datos sensibles
const sanitizeSensitiveData = (data) => {
	if (!data) return data;
	
	if (typeof data === 'string') {
		return stripEmojis(data);
	}
	
	if (Array.isArray(data)) {
		return data.map(item => sanitizeSensitiveData(item));
	}
	
	if (typeof data === 'object' && data !== null) {
		const sanitized = {};
		
		for (const key in data) {
			const value = data[key];
			
			// Campos sensibles a ocultar
			const sensitiveIdFields = ['_id', 'id', 'chat_id', 'chatId', 'sender_id', 'client_id', 'clientId', 'userId', 'user_id'];
			
			if (sensitiveIdFields.includes(key) && typeof value === 'string') {
				// Mostrar solo primeros 4 y últimos 4 caracteres
				if (value.length > 8) {
					sanitized[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
				} else {
					sanitized[key] = '****';
				}
			} else if (key === 'content' && typeof value === 'string') {
				sanitized[key] = `[${value.length} chars]`;
			} else if (key === 'password' || key === 'token' || key === 'accessToken' || key === 'refreshToken') {
				// Ocultar credenciales
				sanitized[key] = '[PROTECTED]';
			} else if (typeof value === 'object' && value !== null) {
				//sanitizar objetos anidados
				sanitized[key] = sanitizeSensitiveData(value);
			} else {
				sanitized[key] = value;
			}
		}
		
		return sanitized;
	}
	
	return data;
};

const noop = () => {};

const processArgs = (args) => {
	return args.map(arg => sanitizeSensitiveData(sanitizeArgs([arg])[0]));
};

export const log = enableLogs ? (...args) => console.log(...processArgs(args)) : noop;
export const debug = enableLogs ? (...args) => console.debug(...processArgs(args)) : noop;
export const warn = enableLogs ? (...args) => console.warn(...processArgs(args)) : noop;
export const error = (...args) => console.error(...sanitizeArgs(args)); // Los errores siempre se van a registrar

const logger = { log, debug, warn, error };

export default logger;

