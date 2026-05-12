import React, {useState, useEffect, useCallback} from 'react';
import {AuthContext} from './AuthContext';
import {profileService, authService} from '../services/api';

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user_data');
        return saved ? JSON.parse(saved) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    const cargarPerfil = useCallback(async () => {
        try {
            const {data} = await profileService.getProfile();
            setUser(data);
            localStorage.setItem('user_data', JSON.stringify(data));
        } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !user) {
            cargarPerfil();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, cargarPerfil]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const {data} = await authService.login(credentials);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            try {
                const {data: perfil} = await profileService.getProfile();
                setUser(perfil);
                localStorage.setItem('user_data', JSON.stringify(perfil));
            } catch {
                // Sin perfil por ahora, el dashboard lo cargará después
            }

            setIsAuthenticated(true);
            return {success: true};
        } catch (error) {
            return {success: false, error: error.response?.data?.message || 'Credenciales incorrectas'};
        } finally {
            setLoading(false);
        }
    };

    const logout = (callback) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setIsAuthenticated(false);
        if (callback) callback();
    };

    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, logout, loading}}>
            {loading ? (
                <div className="bg-[#0a0a0a] h-screen w-screen flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"/>
                    <span className="text-neutral-500 text-xs tracking-widest uppercase">Cargando Enfoca...</span>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
