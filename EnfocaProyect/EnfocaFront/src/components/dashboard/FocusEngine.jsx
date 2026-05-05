import { useState, useEffect, useRef } from 'react';

const TOTAL_SECONDS = 25 * 60;
const RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GridIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

export default function FocusEngine() {
    const [seconds, setSeconds] = useState(TOTAL_SECONDS);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds((s) => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running]);

    const progress = seconds / TOTAL_SECONDS;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    const handleToggle = () => {
        if (seconds === 0) { setSeconds(TOTAL_SECONDS); setRunning(true); }
        else setRunning((r) => !r);
    };

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Motor de Enfoque</span>
                <span className="text-neutral-600"><GridIcon /></span>
            </div>

            <div className="flex justify-center">
                <div className="relative flex items-center justify-center" style={{ width: 168, height: 168 }}>
                    <svg width="168" height="168" viewBox="0 0 168 168" className="absolute inset-0 -rotate-90">
                        <circle cx="84" cy="84" r={RADIUS} fill="none" stroke="#1f1f1f" strokeWidth="3" />
                        <circle
                            cx="84" cy="84" r={RADIUS}
                            fill="none" stroke="#7c3aed" strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 0.8s linear' }}
                        />
                        <circle
                            cx={84 + RADIUS * Math.cos(-Math.PI / 2 + 2 * Math.PI * progress - 0.01)}
                            cy={84 + RADIUS * Math.sin(-Math.PI / 2 + 2 * Math.PI * progress - 0.01)}
                            r="4" fill="white"
                        />
                    </svg>
                    <div className="flex flex-col items-center gap-1 z-10">
                        <span className="text-[2.2rem] font-bold tracking-tight text-white leading-none font-mono">
                            {mins}:{secs}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-neutral-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                            {running ? 'ENFOCANDO' : 'MODO_REPOSO'}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase transition-colors active:scale-[0.98]"
            >
                {running ? (
                    <>
                        <span className="flex gap-0.5">
                            <span className="w-1 h-3.5 bg-black rounded-sm" />
                            <span className="w-1 h-3.5 bg-black rounded-sm" />
                        </span>
                        Pausar Enfoque
                    </>
                ) : (
                    <>
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="black">
                            <path d="M1 1l10 6-10 6V1z" />
                        </svg>
                        Iniciar Enfoque
                    </>
                )}
            </button>

            <div className="flex items-center justify-between text-[10px] text-neutral-600 font-mono">
                <span>Sesión: Física_Cuántica_L4</span>
                <span>01/04 Ciclos</span>
            </div>
        </div>
    );
}
