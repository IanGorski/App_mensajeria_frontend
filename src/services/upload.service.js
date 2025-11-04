import { API_BASE_URL } from '../components/config/constants';

class UploadService {
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir archivo');
        }

        return response.json();
    }
}

export default new UploadService();