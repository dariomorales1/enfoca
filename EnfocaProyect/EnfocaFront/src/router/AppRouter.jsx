import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PUBLIC_ROUTES, PRIVATE_ROUTES, FULLSCREEN_ROUTES, OPEN_ROUTES } from './routes';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import DashboardLayout from '../layouts/DashboardLayout';

export default function AppRouter() {
    return (
        <Routes>
            {/* Rutas abiertas: accesibles para todos sin redirección */}
            {OPEN_ROUTES.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={<route.element />}
                />
            ))}

            <Route element={<PublicRoute />}>
                {PUBLIC_ROUTES.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<route.element />}
                    />
                ))}
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    {PRIVATE_ROUTES.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<route.element />}
                        />
                    ))}
                </Route>
                {FULLSCREEN_ROUTES.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<route.element />}
                    />
                ))}
            </Route>
        </Routes>
    );
}
