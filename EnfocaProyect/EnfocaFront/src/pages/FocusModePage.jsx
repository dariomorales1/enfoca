import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PREP_TIME   = 10;
const FOCUS_TIME  = 1500;
const STREAM_URL  = 'https://stream.zeno.fm/f3wvbbqmdg8uv';

function fmt(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return { m, s };
}

const IconPlay = () => (
    <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);
const IconPause = () => (
    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);
const IconClose = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const IconVolume = ({ muted }) => muted ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

export default function FocusModePage() {
    const [phase, setPhase]       = useState('PREPARING');
    const [prepLeft, setPrepLeft] = useState(PREP_TIME);
    const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
    const [volume,   setVolume]   = useState(0.7);
    const lastVolume = useRef(0.7);

    const audioRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {});
        }
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        if (phase !== 'PREPARING') return;
        const id = setInterval(() => {
            setPrepLeft((prev) => {
                if (prev <= 1) { clearInterval(id); setPhase('RUNNING'); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'RUNNING') return;
        audioRef.current?.play().catch(() => {});
        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(id); setPhase('IDLE'); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => { clearInterval(id); audioRef.current?.pause(); };
    }, [phase]);

    const handlePlayPause = () => {
        if (phase === 'RUNNING') setPhase('PAUSED');
        else if (phase === 'PAUSED') setPhase('RUNNING');
    };

    const handleClose = () => {
        audioRef.current?.pause();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        navigate('/dashboard');
    };

    const handleVolume = (val) => {
        if (val > 0) lastVolume.current = val;
        setVolume(val);
    };
    const toggleMute = () => handleVolume(volume > 0 ? 0 : lastVolume.current);

    const elapsed  = FOCUS_TIME - timeLeft;
    const progress = (elapsed / FOCUS_TIME) * 100;
    const { m, s } = fmt(timeLeft);
    const elFmt    = fmt(elapsed);
    const remFmt   = fmt(timeLeft);

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden select-none">

            <audio ref={audioRef} src={STREAM_URL} />

            {/* Fondo */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/focus-bg.webp"
                    alt=""
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex-shrink-0 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-neutral-400">ENFOCA</span>

                    {/* LOFI RADIO + control de volumen */}
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest ${
                            phase === 'RUNNING' ? 'text-violet-400' : 'text-neutral-600'
                        }`}>
                            <span>LOFI RADIO</span>
                            {phase === 'RUNNING' && volume > 0 && (
                                <span className="flex gap-px ml-0.5">
                                    {[1, 2, 3].map(i => (
                                        <span key={i} className="w-px bg-violet-400 rounded-full animate-pulse"
                                            style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </span>
                            )}
                        </div>

                        {/* Icono mute / volumen */}
                        <button
                            onClick={toggleMute}
                            className="text-neutral-600 hover:text-violet-400 transition-colors flex-shrink-0"
                            title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                        >
                            <IconVolume muted={volume === 0} />
                        </button>

                        {/* Slider */}
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={volume}
                            onChange={e => handleVolume(parseFloat(e.target.value))}
                            className="w-20 accent-violet-500 cursor-pointer h-px bg-white/10 rounded-full"
                        />
                        <span className="text-[9px] font-mono text-neutral-700 w-6 tabular-nums">
                            {Math.round(volume * 100)}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="text-neutral-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                    aria-label="Cerrar modo enfoque"
                >
                    <IconClose />
                </button>
            </div>

            {/* Centro — ocupa el espacio disponible entre header y barra */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0">

                <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-4 font-medium">
                    {phase === 'PREPARING' && 'Preparando...'}
                    {phase === 'RUNNING'   && 'Focus Period'}
                    {phase === 'PAUSED'    && 'Pausado'}
                    {phase === 'IDLE'      && 'Sesión completada'}
                </h2>

                {/* Reloj — usa min(vw, vh) para garantizar que no desborde en ninguna resolución */}
                {phase === 'PREPARING' ? (
                    <div
                        className="font-light leading-none tracking-tighter tabular-nums text-violet-400 animate-pulse mb-8"
                        style={{ fontSize: 'clamp(80px, min(20vw, 28vh), 200px)' }}
                    >
                        {prepLeft}
                    </div>
                ) : (
                    <div
                        className={`font-light leading-none tracking-tighter tabular-nums transition-colors mb-8 ${
                            phase === 'PAUSED' ? 'text-neutral-500' : 'text-white'
                        }`}
                        style={{ fontSize: 'clamp(72px, min(18vw, 26vh), 180px)' }}
                    >
                        {m}:{s}
                    </div>
                )}

                {(phase === 'RUNNING' || phase === 'PAUSED') && (
                    <button
                        onClick={handlePlayPause}
                        className="w-14 h-14 rounded-full border border-neutral-700/50 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        {phase === 'RUNNING' ? <IconPause /> : <IconPlay />}
                    </button>
                )}

                {phase === 'IDLE' && (
                    <button
                        onClick={handleClose}
                        className="px-10 py-3 rounded-full border border-neutral-700/50 text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-all tracking-[0.2em] uppercase"
                    >
                        Terminar
                    </button>
                )}
            </div>

            {/* Barra de progreso — footer fijo */}
            {phase !== 'PREPARING' && (
                <div className="relative z-10 flex-shrink-0 px-8 pb-6 w-full max-w-lg mx-auto">
                    <div className="h-px w-full bg-neutral-800 rounded-full mb-3 overflow-hidden">
                        <div
                            className="h-full bg-neutral-400 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                        <span>{elFmt.m}m {elFmt.s}s transcurrido</span>
                        <span>{remFmt.m}m {remFmt.s}s restante</span>
                    </div>
                </div>
            )}
        </div>
    );
}
