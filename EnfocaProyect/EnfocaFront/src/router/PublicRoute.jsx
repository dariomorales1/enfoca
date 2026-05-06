import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
// Asegúrate de que la ruta a tu hook useAuth sea la correcta
import {useAuth} from '../contexts/AuthContext';

export default function PublicRoute() {
    const {isAuthenticated, loading} = useAuth();

    if (loading) return null;

    if (isAuthenticated) {
        // Usamos directamente el string '/pomodoro' (o '/' si prefieres enviarlo al inicio)
        return <Navigate to="/pomodoro" replace/>;
    }

    return <Outlet/>;
}