import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // URL Base
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Revisar estos endpoints

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    recoverPassword: (email) => api.post('/auth/recover', { email }),
};

export default api;