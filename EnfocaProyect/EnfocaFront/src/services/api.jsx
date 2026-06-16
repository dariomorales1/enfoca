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

export const pomodoroService = {
    iniciar:   (data)            => api.post('/pomodoro-sessions/start', data),
    comenzar:  (id)              => api.patch(`/pomodoro-sessions/${id}/begin`),
    completar: (id, status = 'COMPLETED') => api.patch(`/pomodoro-sessions/${id}/finish`, null, { params: { status } }),
    historial: ()                => api.get('/pomodoro-sessions'),
};

export const planService = {
    crear:      (data)    => api.post('/planes-estudio', data),
    listar:     ()        => api.get('/planes-estudio'),
    obtener:    (id)      => api.get(`/planes-estudio/${id}`),
    eliminar:   (id)      => api.delete(`/planes-estudio/${id}`),
    validar:    (id,data) => api.post(`/planes-estudio/${id}/validaciones`, data),
    catalogo:   ()        => api.get('/planes-estudio/catalogo'),
    toggleTema:          (temaId)        => api.patch(`/planes-estudio/temas/${temaId}/completado`),
    programar:           (temaId, fechas) => api.post(`/planes-estudio/temas/${temaId}/programar`, { fechas }),
    registrarSesion:         (temaId)         => api.post(`/planes-estudio/temas/${temaId}/sesion-hoy`),
    eliminarProgramacion:    (temaId, fecha)  => api.delete(`/planes-estudio/temas/${temaId}/programacion/${fecha}`),
    generarCuestionario: (moduloId)      => api.post(`/planes-estudio/modulos/${moduloId}/cuestionario`),
    clonar:              (id)            => api.post(`/planes-estudio/${id}/clonar`),
    enRevision:          ()              => api.get('/planes-estudio/en-revision'),
    feedback:            (id, data)      => api.post(`/planes-estudio/${id}/feedback`, data),
};

export const certService = {
    iniciar:      (data)           => api.post('/certificacion/examenes/iniciar', data),
    responder:    (id, data)       => api.post(`/certificacion/examenes/${id}/responder`, data),
    certificados: ()               => api.get('/certificacion/certificados'),
    verificar:    (codigo)         => api.get(`/certificacion/verificar/${codigo}`),
    descargarPdf: (id, nombre)     => api.get(`/certificacion/certificados/${id}/pdf`, { params: { nombre }, responseType: 'blob' }),
};

export const metricsService = {
    getSummary:      ()                        => api.get('/api/metrics/summary'),
    getLast7Days:    ()                        => api.get('/api/metrics/daily'),
    getLast4Weeks:   ()                        => api.get('/api/metrics/weekly'),
    getHeatmap:      (year, month)             => api.get('/api/metrics/heatmap', { params: { year, month } }),
    getInsight:      ()                        => api.get('/api/metrics/insight/latest'),
    registrarSesion: (focusedSeconds, cycles)  => api.post('/api/metrics/session', null, { params: { focusedSeconds, cycles } }),
};

export const gamificationService = {
    getPerfil: ()          => api.get('/gamification/perfil'),
};

export const calendarService = {
    semana: (fechaInicio, fechaFin) => api.get('/calendario/semana', { params: { fechaInicio, fechaFin } }),
};

export default api;