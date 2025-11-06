// Normalización de variables de entorno y configuración segura por entorno
// Admite VITE_API_URL con o sin sufijo "/api" y evita codificar valores en producción.

const normalizeApiBase = (value) => {
	if (!value) return undefined;
	const trimmed = String(value).replace(/\/?$/, '');
	return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiEnv = import.meta.env.VITE_API_URL;
const rawSocketEnv = import.meta.env.VITE_SOCKET_URL;

// En desarrollo, usar fallback localhost si no hay envs; en producción, requerir envs definidos
export const API_BASE_URL = normalizeApiBase(
	rawApiEnv ?? (import.meta.env.DEV ? 'http://localhost:3000' : undefined)
);

export const API_ORIGIN = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : undefined;

export const SOCKET_URL = rawSocketEnv ?? (import.meta.env.DEV ? 'http://localhost:3000' : undefined);

// Estrategia de autenticación: 'token' (Bearer) o 'cookie' (HttpOnly). Default: 'token'
export const AUTH_STRATEGY = (import.meta.env.VITE_AUTH_STRATEGY || 'token').toLowerCase();

// Almacenamiento de token cuando AUTH_STRATEGY === 'token': 'local' | 'session' | 'memory'
export const AUTH_STORAGE = (import.meta.env.VITE_AUTH_STORAGE || 'local').toLowerCase();

// Advertencias/errores en producción si faltan configuraciones críticas
if (import.meta.env.PROD) {
		if (!API_BASE_URL) {
			// No lanzar excepción para no romper el bundle, pero dejar traza clara
			console.error('[Config] API_BASE_URL no definido en producción. Configure VITE_API_URL.');
		}
		if (!SOCKET_URL) {
			console.error('[Config] SOCKET_URL no definido en producción. Configure VITE_SOCKET_URL.');
		}
}

// Utilidad: validar mezcla HTTP/HTTPS en producción
export const assertSecureTransport = () => {
		try {
		const isHttpsApp = typeof window !== 'undefined' && window.location?.protocol === 'https:';
		const apiIsHttp = API_BASE_URL?.startsWith('http://');
		const socketIsHttp = SOCKET_URL?.startsWith('http://');
		if (import.meta.env.PROD && isHttpsApp && (apiIsHttp || socketIsHttp)) {
			console.error('[Seguridad] La app corre sobre HTTPS pero API o Socket usan HTTP. Actualice VITE_API_URL/VITE_SOCKET_URL a HTTPS.');
		}
		} catch {
			// ignorar
		}
};

// Ejecutar validación en import
assertSecureTransport();