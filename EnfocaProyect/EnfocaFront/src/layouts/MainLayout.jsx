// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';

// Reutilizamos el icono de menú hamburguesa
const IconMenu = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export default function MainLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-[#cdccca]">

            {/* OVERLAY: Fondo oscuro en móvil cuando el menú está abierto */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR: Slide-in en móvil, fijo en escritorio (lg) */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* HEADER MÓVIL: Solo visible en pantallas pequeñas */}
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

                {/* ÁREA DE RENDERIZADO DEL CONTENIDO */}
                <div className="flex-grow overflow-y-auto w-full">
                    {/* Tus paddings originales estaban muy bien: p-4 en móvil, p-8 en desktop */}
                    <div className="p-4 lg:p-8 w-full min-h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}