import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
// Asegúrate de que la ruta a tu hook useAuth sea la correcta
import {useAuth} from '../contexts/AuthContext';

export default function ProtectedRoute() {
    const {isAuthenticated, loading} = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Usamos directamente el string '/login' en lugar de la variable ROUTES
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
}