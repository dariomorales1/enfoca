// src/contexts/AuthProvider.jsx
import React, { useState } from 'react';
import { AuthContext } from './AuthContext'; // Importamos el contexto desde el otro archivo

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken ? { token: storedToken } : null;
    });

    const [loading, setLoading] = useState(false);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser({ ...userData, token });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};