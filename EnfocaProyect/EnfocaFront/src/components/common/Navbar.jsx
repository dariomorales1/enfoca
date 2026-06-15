// src/components/common/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Navbar() {
    const { isAuthenticated } = useAuth();

    return (
        <nav className="w-full px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center justify-between bg-black text-white border-b border-neutral-800/50">

            <Link
                to={isAuthenticated ? '/dashboard' : '/'}
                className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
                {/* Logo escalable: h-10 en móvil, h-12 en tablet, h-14 en escritorio */}
                <img src="/logo.png" alt="Enfoca" className="h-10 sm:h-12 lg:h-14 w-auto object-contain" />
            </Link>

            {/* Espaciador central flex */}
            <div className="flex-1" />

                {!isAuthenticated && (
                    <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
                        <Link to="/login" className="text-neutral-300 hover:text-white transition-colors hidden sm:block">
                        Iniciar sesión
                        </Link>
                        {/* Botón con padding ligeramente menor en móvil si es necesario, aunque px-4 py-2 es muy estándar */}
                        <Link to="/register" className="bg-white text-black hover:bg-neutral-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors inline-block text-center whitespace-nowrap">
                            Registrarse
                        </Link>
                    </div>
                )}
        </nav>
    );
}