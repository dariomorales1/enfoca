import React, {useState, useEffect} from 'react';

export default function MainTimerCard() {
    // 1. Estados de las fases (Agregamos 'PAUSED')
    const [phase, setPhase] = useState('IDLE'); // IDLE, PREPARING, RUNNING, PAUSED
    const [sessionId, setSessionId] = useState(null);

    // 2. Tiempos iniciales
    const initialPrepTime = 10; // Ajustado a 10s según tus requerimientos anteriores
    const initialFocusTime = 1500;

    const [prepTimeLeft, setPrepTimeLeft] = useState(initialPrepTime);
    const [timeLeft, setTimeLeft] = useState(initialFocusTime);

    // 3. Efecto para la fase de PREPARACIÓN (Solo al inicio)
    useEffect(() => {
        let interval = null;

        if (phase === 'PREPARING') {
            interval = setInterval(() => {
                setPrepTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // Aquí iría la llamada al backend: /begin
                        setPhase('RUNNING');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [phase]);

    // 4. Efecto para la fase RUNNING (Cronómetro persistente)
    useEffect(() => {
        let interval = null;

        if (phase === 'RUNNING') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setPhase('IDLE'); // Fin de sesión
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Al estar en 'PAUSED', el intervalo se limpia automáticamente
        // pero 'timeLeft' conserva su valor actual.
        return () => clearInterval(interval);
    }, [phase]);

    // 5. Lógica de control de reproducción
    const handleStartClick = () => {
        if (phase === 'IDLE') {
            // Inicio absoluto: Preparación
            setPrepTimeLeft(initialPrepTime);
            setTimeLeft(initialFocusTime);
            setPhase('PREPARING');
        } else if (phase === 'RUNNING') {
            // Pausar sin reiniciar
            setPhase('PAUSED');
        } else if (phase === 'PAUSED') {
            // Reanudar desde donde quedó
            setPhase('RUNNING');
        }
    };

    // 6. Formateo de tiempo
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return {m, s};
    };

    const {m: minutes, s: seconds} = formatTime(timeLeft);

    return (
        <div className="relative bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 lg:p-4 flex flex-col items-center shadow-2xl w-full  overflow-hidden">

            {/* Línea de progreso decorativa */}
            <div className={`absolute top-0 left-0 h-[2px] bg-violet-600/50 transition-all duration-1000 ${phase === 'RUNNING' ? 'w-full' : 'w-0'}`}></div>

            {/* Badge Superior */}
            <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-full px-3 py-1 mb-12 shadow-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${phase === 'PREPARING' ? 'bg-yellow-500 animate-pulse' : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]'}`}></div>
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                    {phase === 'PREPARING' ? 'STATUS_PREPARING' : phase === 'PAUSED' ? 'STATUS_PAUSED' : 'PROC_DEEP_FOCUS'}
                </span>
            </div>

            {/* Reloj Central */}
            <div className="flex items-baseline mb-8 select-none h-32 items-center justify-center">
                {phase === 'PREPARING' ? (
                    <span className="text-[120px] md:text-[160px] font-bold tracking-tighter text-violet-500 leading-none tabular-nums animate-pulse">
                        {prepTimeLeft}
                    </span>
                ) : (
                    <>
                        <span className="text-8xl md:text-[140px] font-light tracking-tighter text-white leading-none tabular-nums">
                            {minutes}:{seconds}
                        </span>
                        <span className="text-3xl md:text-5xl font-light text-violet-500/40 ml-2 mb-4 font-mono">
                            .00
                        </span>
                    </>
                )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-6 mb-8">
                <button className="w-12 h-12 flex items-center justify-center border border-neutral-800 rounded-xl bg-[#111] hover:bg-neutral-800 text-neutral-400 transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>

                <button
                    onClick={handleStartClick}
                    disabled={phase === 'PREPARING'}
                    className={`w-20 h-20 flex items-center justify-center rounded-full bg-[#9d84fd] hover:bg-[#b09dfd] text-black shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all transform hover:scale-105 ${phase === 'PREPARING' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                >
                    {phase === 'RUNNING' ? (
                        /* Icono Pausa */
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    ) : (
                        /* Icono Play con corrección de centro óptico */
                        <svg className="w-8 h-8 fill-current transform translate-x-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>

                <button className="w-12 h-12 flex items-center justify-center border border-neutral-800 rounded-xl bg-[#111] hover:bg-neutral-800 text-neutral-400 transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
            </div>

            {/* Footer */}
            <div className="w-full flex items-center justify-center gap-12 border-t border-neutral-800/50 pt-8">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">Index</span>
                    <div className="text-2xl text-white font-light tabular-nums">02<span className="text-neutral-600 text-lg mx-1">/</span><span className="text-neutral-400">04</span></div>
                </div>
                <div className="w-px h-8 bg-neutral-800"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">Quota</span>
                    <div className="text-2xl text-white font-light tabular-nums">4.5<span className="text-neutral-500 text-sm ml-1 uppercase tracking-wider">hrs</span></div>
                </div>
            </div>
        </div>
    );
}