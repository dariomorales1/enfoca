import React, {useState, useEffect} from 'react';

export default function Timer() {
    // 1. Estados iniciales
    const [seconds, setSeconds] = useState(25 * 60); // Tiempo de trabajo (25 min)
    const [phase, setPhase] = useState('IDLE');     // Fases: IDLE, PREPARING, WORKING
    const [isActive, setIsActive] = useState(false); // ¿El tiempo está corriendo?
    const [prepSeconds, setPrepSeconds] = useState(10); // Cuenta regresiva inicial

    // 2. Lógica del contador
    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                if (phase === 'PREPARING') {
                    setPrepSeconds((prev) => {
                        if (prev <= 1) {
                            setPhase('WORKING');
                            return 10; // Reiniciamos prep para la próxima sesión
                        }
                        return prev - 1;
                    });
                } else if (phase === 'WORKING') {
                    setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, phase]);

    // 3. Manejador del botón
    const handleStartClick = () => {
        if (phase === 'IDLE') {
            setPhase('PREPARING');
            setIsActive(true);
        } else {
            setIsActive(!isActive); // Solo pausa/reanuda sin tocar el tiempo restante
        }
    };

    // Formateo de tiempo (MM:SS)
    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            {/* Visualización del estado y tiempo */}
            <div className="text-center">
                <span className="text-violet-400 text-sm font-bold uppercase tracking-widest">
                    {phase === 'PREPARING' ? 'Prepárate' : 'Tiempo de Enfoque'}
                </span>
                <h2 className="text-7xl font-mono text-white mt-2">
                    {phase === 'PREPARING' ? `${prepSeconds}s` : formatTime(seconds)}
                </h2>
            </div>

            {/* El botón con el icono centrado que corregimos */}
            <button
                onClick={handleStartClick}
                className={`w-20 h-20 flex items-center justify-center rounded-full bg-[#9d84fd] hover:bg-[#b09dfd] text-black shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all transform hover:scale-105 active:scale-95`}
            >
                {isActive && phase === 'WORKING' ? (
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                ) : (
                    <svg className="w-8 h-8 fill-current transform translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                )}
            </button>
        </div>
    );
}