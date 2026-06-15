import React from 'react';

export default function BadgeGenerator({ title = "NUEVO TEMA" }) {
    // Ajustar font-size según largo del título para que quepa en la cinta
    const len      = (title || '').length;
    const fontSize = len <= 8 ? 26 : len <= 14 ? 22 : len <= 20 ? 18 : 14;

    return (
        <div className="relative w-full aspect-square flex items-center justify-center group">
            {/*
              Un único SVG que embebe la imagen y el texto en el mismo
              sistema de coordenadas 500×500, eliminando el desalineamiento
              que causaba el overlay separado con object-contain.
            */}
            <svg
                viewBox="0 0 500 500"
                // Sombra más ligera en móvil para mejor rendimiento de renderizado
                // active:scale-95 para dar feedback táctil si en el futuro se hace clickeable
                className="w-full h-full drop-shadow-lg sm:drop-shadow-2xl transition-transform group-hover:scale-105 active:scale-95 duration-300"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Imagen del badge ocupando exactamente el viewBox completo */}
                <image
                    href="/badge.svg"
                    x="0"
                    y="0"
                    width="500"
                    height="500"
                    preserveAspectRatio="xMidYMid meet"
                />

                {/* Texto centrado sobre la cinta del badge */}
                <text
                    x="250"
                    y="363"
                    fill="#FFFFFF"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fontFamily="Arial, Helvetica, sans-serif"
                    letterSpacing="1.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {(title || '').toUpperCase()}
                </text>
            </svg>
        </div>
    );
}