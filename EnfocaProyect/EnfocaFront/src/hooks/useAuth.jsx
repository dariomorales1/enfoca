import {useContext} from 'react';
// AQUÍ ESTÁ LA CORRECCIÓN: Apuntamos al archivo AuthContext correcto
import {AuthContext} from '../contexts/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
};