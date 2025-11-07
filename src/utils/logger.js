// Logger utilitario: eliminar emojis
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

// Remover emojis para consola limpia
const stripEmojis = (value) => {
	if (typeof value !== 'string') return value;
	try {
		// Elimino emojis usando Unicode
		return value
			.replace(/\p{Extended_Pictographic}/gu, '')
			// Fallback rápido para algunos rangos comunes si el motor no soporta lo anterior
			.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
		} catch {
		// En caso de que el runtime no soporte Unicode property escapes
		return value.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
	}
};

const sanitizeArgs = (args) => args.map((a) => (typeof a === 'string' ? stripEmojis(a) : a));

export const log = (...args) => { if (isDev) console.log(...sanitizeArgs(args)); };
export const debug = (...args) => { if (isDev) console.debug(...sanitizeArgs(args)); };
export const warn = (...args) => { if (isDev) console.warn(...sanitizeArgs(args)); };
export const error = (...args) => { console.error(...sanitizeArgs(args)); };

export default { log, debug, warn, error };
