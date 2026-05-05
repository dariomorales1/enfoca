import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthProvider';

export default function Navbar() {
    const context = useContext(AuthContext);

    if (!context) return null;

    const {user, isAuthenticated, logout} = context;

    return (
        <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-black text-white border-b border-neutral-800/50">

            <Link to="/" className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <img src="/logo.png" alt="Enfoca" className="h-14 w-auto object-contain"/>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                <Link to="/focus" className="hover:text-white transition-colors">Enfoque</Link>
                <Link to="/stats" className="hover:text-white transition-colors">Estadísticas</Link>
                <Link to="/community" className="hover:text-white transition-colors">Comunidad</Link>
                <Link to="/pricing" className="hover:text-white transition-colors">Precios</Link>
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
                        <Link to="/profile" className="flex items-center gap-2 hover:text-neutral-300 transition-colors">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-neutral-700"/>
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs">
                                    {user?.firstName?.charAt(0) || user?.nombre?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span className="hidden lg:inline">{user?.firstName || user?.nombre}</span>
                        </Link>
                        <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
