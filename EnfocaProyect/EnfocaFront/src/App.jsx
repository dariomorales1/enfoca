import React, { useContext } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Outlet,
    Navigate,
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './contexts/AuthProvider';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Componentes públicos
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Páginas públicas
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import RecoverAccountPage from './pages/RecoverAccountPage';

// Páginas del dashboard
import DashboardPage from './pages/dashboard/DashboardPage';
// Futuras páginas (descomenta cuando las crees):
// import FocusPage      from './pages/dashboard/FocusPage';
// import StudyPlansPage from './pages/dashboard/StudyPlansPage';
// import AnalyticsPage  from './pages/dashboard/AnalyticsPage';


// ─────────────────────────────────────────
// Guard: redirige al login si no está autenticado
// ─────────────────────────────────────────
function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useContext(AuthContext);

    // Mientras el AuthProvider verifica el token, no redirigir todavía
    if (loading) return null;

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}


// ─────────────────────────────────────────
// Layout público: Navbar + Outlet + Footer
// Rutas: /, /login, /register, /recover
// ─────────────────────────────────────────
function PublicLayout() {
    return (
        <div className="min-h-screen bg-black flex flex-col font-sans text-white">
            <Navbar />
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}


// ─────────────────────────────────────────
// App root
// ─────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>

                    {/* ── Rutas públicas ── */}
                    <Route element={<PublicLayout />}>
                        <Route path="/"         element={<LandingPage />} />
                        <Route path="/login"    element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/recover"  element={<RecoverAccountPage />} />
                    </Route>

                    {/* ── Rutas privadas (dashboard) ── */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    >
                        {/* index → /dashboard */}
                        <Route index element={<DashboardPage />} />

                        {/* Futuras rutas (descomenta cuando crees las páginas): */}
                        {/* <Route path="focus"     element={<FocusPage />} /> */}
                        {/* <Route path="plans"     element={<StudyPlansPage />} /> */}
                        {/* <Route path="analytics" element={<AnalyticsPage />} /> */}
                    </Route>

                    {/* ── Fallback: cualquier ruta desconocida → home ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;