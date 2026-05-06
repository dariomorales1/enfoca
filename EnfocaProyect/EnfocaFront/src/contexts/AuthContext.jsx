// src/contexts/AuthContext.js
import {createContext, useContext} from 'react';

// 1. Exportamos el Contexto (Es una variable normal)
export const AuthContext = createContext();

// 2. Exportamos tu Hook (Es una función normal)
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
};