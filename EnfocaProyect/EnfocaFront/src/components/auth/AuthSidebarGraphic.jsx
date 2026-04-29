import React from 'react';

export default function AuthSidebarGraphic({headlineText, imageSrc, imageAlt}) {
    return (
        <>
            <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

            <div className="absolute bottom-8 left-10 right-10 z-10">
                <p className="text-violet-500 text-[10px] font-bold tracking-widest uppercase mb-2">
                    Deep Work Protocol
                </p>
                <h2 className="text-3xl font-bold text-white leading-tight">
                    {headlineText}
                </h2>
            </div>
        </>
    );
}