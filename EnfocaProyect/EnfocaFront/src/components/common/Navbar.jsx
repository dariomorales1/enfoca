import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getUserInitial = () => {
        const name = user?.nombre || user?.firstName || user?.username || 'U';
        return name.charAt(0).toUpperCase();
    };

    const getUserDisplayName = () => {
        return user?.nombre || user?.firstName || 'Usuario';
    };

    return (
        <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-black text-white border-b border-neutral-800/50">

            <Link
                to={isAuthenticated ? "/dashboard" : "/"}
                className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
                <img src="/logo.png" alt="Enfoca" className="h-14 w-auto object-contain" />
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                <Link to="/pomodoro" className="hover:text-white transition-colors">Enfoque</Link>
                <Link to="/study-plan" className="hover:text-white transition-colors">Plan de Estudio</Link>
                <Link to="/focus-mode" className="hover:text-white transition-colors">Deep Focus</Link>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
                {!isAuthenticated ? (
                    <>
                        <Link to="/login" className="text-neutral-300 hover:text-white transition-colors hidden sm:block">
                            Iniciar sesión
                        </Link>
                        <Link to="/register" className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors inline-block">
                            Registrarse
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Avatar"
                                    className="h-8 w-8 rounded-full border border-neutral-700"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                    {getUserInitial()}
                                </div>
                            )}
                            <span className="hidden lg:inline text-neutral-300">{getUserDisplayName()}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}