import React from 'react';

export default function AuthSidebarGraphic({headlineText, imageSrc, imageAlt}) {
    return (
        <>
            {/* La imagen y el gradiente ya tienen un comportamiento elástico perfecto (inset-0, w-full, h-full) */}
            <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

            {/* Ajuste de márgenes: más compactos en tablets (bottom-6 left-6) y amplios en desktop (lg:left-10) */}
            <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-10 lg:right-10 z-10">
                <p className="text-violet-500 text-[9px] lg:text-[10px] font-bold tracking-widest uppercase mb-1.5 lg:mb-2">
                    Deep Work Protocol
                </p>
                {/* Escalado tipográfico para que el texto no se asfixie si la columna es estrecha */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {headlineText}
                </h2>
            </div>
        </>
    );
}