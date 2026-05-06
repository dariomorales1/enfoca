import React, {useState} from 'react';

export default function FocusModePage() {
    // Estado simple para simular el botón de Play/Pause visualmente
    const [isRunning, setIsRunning] = useState(false);

    return (
        // Contenedor principal: pantalla completa, oscuro, sin scroll
        <div
            className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans overflow-hidden selection:bg-violet-500/30">

            {/* Imagen de fondo con efecto de atenuación */}
            <div className="absolute inset-0 z-0">
                {/* Asegúrate de colocar una imagen llamada 'focus-bg.jpg' en tu carpeta public/ */}
                <img
                    src="/focus-bg.webp"
                    alt="Background Landscape"
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale"
                />
                {/* Gradiente para que los bordes superior e inferior sean más oscuros */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
            </div>

            {/* Cabecera superior minimalista */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-neutral-400">
                    ENFOCA
                </span>
                <button className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-2">
                    {/* Icono de cerrar (X) */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                              d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Contenido Central: Reloj y Controles */}
            <div className="relative z-10 flex flex-col items-center w-full">

                {/* Indicador de Audio superior */}
                <div
                    className="flex items-center gap-2 mb-10 opacity-60 text-[9px] uppercase tracking-[0.2em] font-mono text-neutral-400">
                    <span className="text-violet-500">💧</span>
                    <span>SOFT RAIN</span>
                </div>

                <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-6 font-medium">
                    Focus Period
                </h2>

                {/* Temporizador Gigante */}
                <div
                    className="text-[120px] md:text-[180px] lg:text-[220px] font-light leading-none tracking-tighter mb-12 tabular-nums">
                    25:00
                </div>

                {/* Controles de Reproducción Minimalistas */}
                <div className="flex items-center gap-8">
                    {/* Botón Atrás */}
                    <button className="text-neutral-600 hover:text-white transition-colors p-2">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>

                    {/* Botón Play/Pause */}
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="w-16 h-16 rounded-full border border-neutral-700/50 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        {isRunning ? (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        )}
                    </button>

                    {/* Botón Adelante */}
                    <button className="text-neutral-600 hover:text-white transition-colors p-2">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progreso Inferior */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-10">
                {/* Barra de progreso */}
                <div className="h-[2px] w-full bg-neutral-800/80 rounded-full mb-4 overflow-hidden">
                    {/* Ajusta este ancho (w-1/3) mediante código dinámico después */}
                    <div className="h-full bg-neutral-400 w-1/3 rounded-full"></div>
                </div>

                {/* Textos de tiempo transcurrido y restante */}
                <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-[0.1em]">
                    <span>8m 22s elapsed</span>
                    <span>16m 38s left</span>
                </div>
            </div>

        </div>
    );
}