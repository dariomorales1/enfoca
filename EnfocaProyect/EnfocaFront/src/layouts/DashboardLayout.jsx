// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

// Icono de menú hamburguesa custom para no agregar dependencias
const IconMenu = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export default function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-[#cdccca] overflow-hidden">

            {/* OVERLAY: Fondo oscuro que aparece en móvil cuando el menú está abierto */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR: Slide-in en móvil, fijo y normal en escritorio (lg:) */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Pasamos la función para que el Sidebar pueda cerrarse al hacer clic en un link */}
                <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* HEADER MÓVIL: Solo visible en pantallas pequeñas (< lg) */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-[#0c0c0c] border-b border-neutral-800 flex-shrink-0">
                    <img src="/logo.png" alt="Enfoca" className="h-6 w-auto object-contain" />
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Abrir menú"
                    >
                        <IconMenu />
                    </button>
                </header>

                {/* ÁREA DE RENDERIZADO (El Dashboard en sí) */}
                <main className="flex-1 overflow-y-auto bg-[#0a0a0a] w-full relative">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}