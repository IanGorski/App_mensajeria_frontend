import { API_BASE_URL, AUTH_STRATEGY } from '../components/config/constants';
import { getToken } from '../utils/tokenStorage';

class UploadService {
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = AUTH_STRATEGY === 'cookie' ? null : getToken();

        if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');

        const response = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}/api/upload`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(AUTH_STRATEGY === 'cookie' ? { credentials: 'include' } : {}),
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir archivo');
        }

        return response.json();
    }
}

export default new UploadService();