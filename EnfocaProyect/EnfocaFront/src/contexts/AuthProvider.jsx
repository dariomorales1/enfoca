// src/contexts/AuthProvider.jsx
import React, {useState, useEffect} from 'react';
// Importamos el contexto que acabamos de crear en el otro archivo
import {AuthContext} from './AuthContext';

// Exportamos ÚNICAMENTE el componente (ESLint ya no mostrará errores)
export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                // Aquí irá tu conexión al backend
                setIsAuthenticated(false);
                setUser(null);
            } catch (error) {
                console.error("Error validando sesión:", error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = () => setIsAuthenticated(true);

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, loading, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};