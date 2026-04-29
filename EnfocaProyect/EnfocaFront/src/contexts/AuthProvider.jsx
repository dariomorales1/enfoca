import React, {createContext, useState, useEffect, useCallback} from 'react';
import api, {authService, profileService} from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_data');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        try {
            const {data} = await profileService.getProfile();
            setUser(data);
            localStorage.setItem('user_data', JSON.stringify(data));
        } catch (error) {
            console.error("Error cargando perfil:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, fetchUserProfile]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const {data} = await authService.login(credentials);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            setIsAuthenticated(true);
            await fetchUserProfile();
            return {success: true};
        } catch (error) {
            return {success: false, error: error.response?.data?.message || 'Error de conexión'};
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, logout, loading}}>
            {loading ? (
                <div className="bg-black h-screen w-screen flex items-center justify-center text-white">
                    Cargando Enfoca...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};