import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const { data } = await api.post('/auth/refresh', { refreshToken });
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login:          (c)    => api.post('/auth/login', c),
    logout:         (rt)   => api.post('/auth/logout', { refreshToken: rt }),
    register:       (d)    => api.post('/auth/register', d),
    refresh:        (rt)   => api.post('/auth/refresh', { refreshToken: rt }),
    forgotPassword: (e)    => api.post('/auth/forgot-password', { email: e }),
    resetPassword:  (d)    => api.post('/auth/reset-password', d),
};

export const profileService = {
    getProfile:     ()     => api.get('/profile'),
    updateProfile:  (d)    => api.put('/profile', d),
    changePassword: (d)    => api.put('/profile/password', d),
};

export const planService = {
    crear:    (d)          => api.post('/planes-estudio', d),
    listar:   ()           => api.get('/planes-estudio'),
    obtener:  (id)         => api.get(`/planes-estudio/${id}`),
    eliminar: (id)         => api.delete(`/planes-estudio/${id}`),
    validar:  (id, d)      => api.post(`/planes-estudio/${id}/validaciones`, d),
    catalogo: ()           => api.get('/planes-estudio/catalogo'),
};

export const metricsService = {
    getSummary:    ()      => api.get('/api/metrics/summary'),
    getLast7Days:  ()      => api.get('/api/metrics/daily'),
    getLast4Weeks: ()      => api.get('/api/metrics/weekly'),
    getHeatmap:    (y, m)  => api.get('/api/metrics/heatmap', { params: { year: y, month: m } }),
    getInsight:    ()      => api.get('/api/metrics/insight/latest'),
};

export const gamificationService = {
    getPerfil: ()          => api.get('/gamification/perfil'),
};

export default api;