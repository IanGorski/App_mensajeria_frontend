import apiService from './api.service';

class AuthService {
    async login(credentials) {
        return apiService.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        return apiService.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyToken() {
        return apiService.request('/auth/verify', {
            method: 'GET'
        });
    }
}

export default new AuthService();