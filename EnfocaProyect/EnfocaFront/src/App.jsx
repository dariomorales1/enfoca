import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';

const SIDEBAR_ROUTES = ['/dashboard', '/study-plan', '/analytics', '/pomodoro', '/focus-mode', '/settings/password', '/profile', '/library'];

function AppContent() {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    const hasSidebar = isAuthenticated && SIDEBAR_ROUTES.some(r => pathname.startsWith(r));

    if (hasSidebar) {
        return <AppRouter />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
            <Navbar />
            <main className="flex-grow flex flex-col">
                <AppRouter />
            </main>
            {!isAuthenticated && <Footer />}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}
