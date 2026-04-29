import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
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

                const {data} = await authService.refresh(refreshToken);

                localStorage.setItem('access_token', data.accessToken);
                localStorage.setItem('refresh_token', data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    // @PostMapping("/register") -> RegisterRequest
    register: (userData) => api.post('/api/auth/register', userData),

    // @PostMapping("/login") -> LoginRequest
    login: (credentials) => api.post('/api/auth/login', credentials),

    // @PostMapping("/refresh") -> RefreshTokenRequest
    refresh: (refreshToken) => api.post('/api/auth/refresh', {refreshToken}),

    // @PostMapping("/logout") -> LogoutRequest
    logout: (refreshToken) => api.post('/api/auth/logout', {refreshToken}),

    // @PostMapping("/forgot-password") -> ForgotPasswordRequest
    forgotPassword: (email) => api.post('/api/auth/forgot-password', {email}),

    // @PostMapping("/reset-password") -> ResetPasswordRequest
    resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

export const profileService = {
    // @GetMapping -> Retorna ProfileResponse
    getProfile: () => api.get('/profile'),

    // @PutMapping -> UpdateProfileRequest
    updateProfile: (data) => api.put('/profile', data),

    // @PutMapping("/password") -> ChangePasswordRequest
    changePassword: (data) => api.put('/profile/password', data),
};

export default api;