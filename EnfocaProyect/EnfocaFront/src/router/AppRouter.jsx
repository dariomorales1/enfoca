import React from 'react';
import {Routes, Route} from 'react-router-dom';
import {PUBLIC_ROUTES, PRIVATE_ROUTES} from './routes';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

export default function AppRouter() {
    return (
        <Routes>

            <Route element={<PublicRoute/>}>
                {PUBLIC_ROUTES.map((route) => {
                    const Element = route.element;
                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<Element/>}
                        />
                    );
                })}
            </Route>

            <Route element={<ProtectedRoute/>}>
                {PRIVATE_ROUTES.map((route) => {
                    const Element = route.element;
                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<Element/>}
                        />
                    );
                })}
            </Route>

        </Routes>
    );
}