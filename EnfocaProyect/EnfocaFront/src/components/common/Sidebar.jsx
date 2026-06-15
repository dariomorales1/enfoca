import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

// (Mantenemos todos tus iconos originales intactos)
const IconDashboard = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
);
const IconTimer = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
    </svg>
);
const IconBook = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
);
const IconChart = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
);
const IconFocus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M3 9V5h4M21 9V5h-4M3 15v4h4M21 15v4h-4"/>
    </svg>
);
const IconLibrary = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);
const IconLogout = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);
const IconCalendar = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// Nuevo icono para cerrar el menú en móvil
const IconClose = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const menuItems = [
    { name: 'Panel',           path: '/dashboard',  icon: <IconDashboard /> },
    { name: 'Plan de Estudio', path: '/study-plan', icon: <IconBook /> },
    { name: 'Biblioteca',      path: '/library',    icon: <IconLibrary /> },
    { name: 'Análisis',        path: '/analytics',  icon: <IconChart /> },
    { name: 'Calendario',      path: '/calendar',   icon: <IconCalendar/>}
];

// Agregamos el prop onMobileClose
export default function Sidebar({ onMobileClose }) {
    const location = useLocation();
    const navigate  = useNavigate();
    const { user, logout } = useAuth();

    const firstName = (user?.first_name || user?.nombre || user?.firstName || 'Usuario').split(' ')[0];
    const initial   = firstName.charAt(0).toUpperCase();

    // CORRECCIÓN: Actualizado para usar async/await y navegar directamente
    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/login');
    };

    // Función unificada para cerrar el menú al hacer clic en cualquier enlace
    const handleNavigation = () => {
        if (onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <aside className="w-60 flex-shrink-0 h-screen bg-[#0c0c0c] border-r border-neutral-800 flex flex-col sticky top-0">

            {/* Logo y Botón de cierre en móvil */}
            <div className="px-4 pt-5 pb-4 flex justify-between items-center">
                <img src="/logo.png" alt="Enfoca" className="h-8 md:h-12 w-auto object-contain object-left" />

                {/* Solo visible en pantallas pequeñas */}
                <button
                    onClick={handleNavigation}
                    className="lg:hidden p-1 text-neutral-500 hover:text-white transition-colors"
                >
                    <IconClose />
                </button>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavigation}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                active
                                    ? 'bg-violet-600/15 text-white border border-violet-500/20'
                                    : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'
                            }`}
                        >
                            <span className={active ? 'text-violet-400' : ''}>{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Usuario + Cerrar sesión */}
            <div className="px-4 pt-3 pb-4 border-t border-neutral-800 flex flex-col gap-1">
                <Link
                    to="/profile"
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-neutral-800/50 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{firstName}</p>
                        <p className="text-[10px] text-neutral-500">Ver perfil</p>
                    </div>
                </Link>

                <div className="border-t border-neutral-800/60 my-1" />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
                >
                    <IconLogout />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}