import React from 'react';

export default function Navbar() {
    return (
        <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-black text-white border-b border-neutral-800/50">

            {/* Izquierda: Logo */}
            <div className="flex-shrink-0 cursor-pointer">
                <img
                    src="/logo.png"
                    alt="Enfoca logo"
                    className="h-12 w-auto object-contain"
                />
            </div>

            {/* Centro: Enlaces de Navegación (Ocultos en móviles, visibles en pantallas medianas/grandes) */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                <a href="#" className="hover:text-white transition-colors">Focus</a>
                <a href="#" className="hover:text-white transition-colors">Stats</a>
                <a href="#" className="hover:text-white transition-colors">Community</a>
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
            </div>

            {/* Derecha: Botones de Acción */}
            <div className="flex items-center gap-4 text-sm font-medium">
                <a href="#" className="text-neutral-300 hover:text-white transition-colors hidden sm:block">
                    Log in
                </a>
                <button className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors">
                    Sign up
                </button>
            </div>

        </nav>
    );
}