import React from 'react';

export default function SplitCardLayout({ children, graphicContent, invertOrder = false }) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12 md:p-8 bg-black">

            {/* EL CONTENEDOR PRINCIPAL (La Tarjeta)
        Al ser un 'flex', sus hijos directos (las dos mitades)
        tomarán automáticamente la misma altura (items-stretch por defecto).
      */}
            <div className={`
        flex w-full max-w-6xl min-h-[600px] lg:min-h-[650px]
        bg-black border border-neutral-800 rounded-2xl 
        overflow-hidden shadow-2xl transition-all
        ${invertOrder ? 'flex-row-reverse' : 'flex-row'}
      `}>

                {/* MITAD 1: El Formulario */}
                <div className="w-1/2 flex items-center justify-center px-8 py-12 lg:px-12">
                    <div className="w-full max-w-sm">
                        {children}
                    </div>
                </div>

                {/* MITAD 2: El Gráfico
          Solo necesita 'relative'. Al estirarse automáticamente por su padre flex,
          el 'absolute inset-0' de la imagen interior llenará este espacio perfectamente.
        */}
                <div className={`
          w-1/2 relative hidden lg:block bg-neutral-900
          ${invertOrder ? 'border-r border-neutral-800/50' : 'border-l border-neutral-800/50'}
        `}>
                    {graphicContent}
                </div>

            </div>
        </div>
    );
}