// src/layouts/SplitCardLayout.jsx
import React from 'react';

export default function SplitCardLayout({ children, graphicContent, invertOrder = false }) {
    return (
        <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 bg-black">

            {/* CONTENEDOR PRINCIPAL DE LA TARJETA */}
            <div className={`
                flex flex-col w-full max-w-5xl 
                h-auto min-h-[450px] lg:h-[80%] lg:max-h-[580px]
                bg-black border border-neutral-800 rounded-2xl 
                overflow-hidden shadow-2xl transition-all duration-500
                ${invertOrder ? 'lg:flex-row-reverse' : 'lg:flex-row'}
            `}>

                {/* COLUMNA DE CONTENIDO / FORMULARIO */}
                {/* Agregamos py-8 en móvil para dar espacio vertical y gap-6 para separar los elementos */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-4">
                    <div className="w-full max-w-sm flex flex-col justify-center lg:justify-between h-full lg:max-h-[500px] gap-6 lg:gap-0">
                        {children}
                    </div>
                </div>

                {/* COLUMNA GRÁFICA / ILUSTRACIÓN */}
                {/* Se mantiene oculta en móvil, visible desde lg */}
                <div className={`
                  w-full lg:w-1/2 relative hidden lg:block bg-neutral-900
                  ${invertOrder ? 'lg:border-r border-neutral-800/50' : 'lg:border-l border-neutral-800/50'}
                `}>
                    {graphicContent}
                </div>

            </div>
        </div>
    );
}