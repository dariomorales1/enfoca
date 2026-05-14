import React, { useState, useEffect, useRef } from 'react';
import { pomodoroService, metricsService } from '../../services/api';

const getUserId = () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return String(payload.sub ?? payload.userId ?? payload.id ?? '');
    } catch { return null; }
};
import SessionConfigModal from './SessionConfigModal';

const DURATIONS       = [1500, 2400, 3000];
const DURATION_LABELS = ['25 MIN', '40 MIN', '50 MIN'];
const DEFAULT_BREAKS  = [5, 5, 10];
const STREAM_URL      = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
const PREP_TIME       = 10;

export default function MainTimerCard({ autoOpenConfig = false, onComplete }) {
    // ── Fases: IDLE | PREPARING | RUNNING | BREAK | PAUSED ──
    const [phase, setPhase]       = useState('IDLE');
    const [sessionId, setSessionId] = useState(null);
    const duracion    = useRef(0);
    const pausedFrom  = useRef('RUNNING');

    // ── Duración manual (sin sesión configurada) ──
    const [durationIdx, setDurationIdx] = useState(0);

    // ── Sesión configurada desde el modal ──
    const [showModal,     setShowModal]     = useState(false);
    const [sessionConfig, setSessionConfig] = useState(null);
    const [roundsLeft,    setRoundsLeft]    = useState(0);

    // ── Tiempos ──
    const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_TIME);
    const [timeLeft,     setTimeLeft]     = useState(DURATIONS[0]);

    // ── Audio ──
    const [volume,     setVolume]     = useState(0.7);
    const lastVolume   = useRef(0.7);
    const audioRef     = useRef(null);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (autoOpenConfig) setShowModal(true);
    }, []);

    // ── Sincronizar timeLeft en IDLE (modo manual) ──
    useEffect(() => {
        if (phase === 'IDLE' && !sessionConfig) {
            setTimeLeft(DURATIONS[durationIdx]);
        }
    }, [durationIdx, phase]);

    // ── PREPARING ──
    useEffect(() => {
        if (phase !== 'PREPARING') return;
        const id = setInterval(() => {
            setPrepTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    pomodoroService.iniciar({
                        userId:          getUserId(),
                        sessionType:     'FOCUS',
                        // backend valida min 15; para demo (1 min) enviamos 15
                        durationMinutes: Math.max(
                            sessionConfig ? sessionConfig.studyMinutes : DURATIONS[durationIdx] / 60,
                            15
                        ),
                    })
                        .then(res => {
                            const id = res.data?.id ?? null;
                            setSessionId(id);
                            if (id) pomodoroService.comenzar(id).catch(() => {});
                        })
                        .catch(() => {});
                    duracion.current = 0;
                    setPhase('RUNNING');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // ── RUNNING ──
    useEffect(() => {
        if (phase !== 'RUNNING') return;
        audioRef.current?.play().catch(() => {});

        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                duracion.current += 1;
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(id);
            audioRef.current?.pause();
        };
    }, [phase]);

    // ── BREAK ──
    useEffect(() => {
        if (phase !== 'BREAK') return;

        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [phase]);

    // ── Transiciones cuando timeLeft llega a 0 ──
    useEffect(() => {
        if (timeLeft !== 0) return;

        if (phase === 'RUNNING') {
            if (sessionId) {
                pomodoroService.completar(sessionId, 'COMPLETED').catch(() => {});
                const studyMins = sessionConfig ? sessionConfig.studyMinutes : DURATIONS[durationIdx] / 60;
                metricsService.registrarSesion(studyMins * 60, 1).catch(() => {});
            }
            if (sessionConfig && roundsLeft > 1) {
                const next = roundsLeft - 1;
                setRoundsLeft(next);
                setTimeLeft(sessionConfig.breakMinutes * 60);
                setPhase('BREAK');
            } else {
                setSessionConfig(null);
                setRoundsLeft(0);
                setPhase('IDLE');
                onComplete?.();
            }
        } else if (phase === 'BREAK' && sessionConfig) {
            setPrepTimeLeft(PREP_TIME);
            setTimeLeft(sessionConfig.studyMinutes * 60);
            setPhase('PREPARING');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // ── Handlers ──
    const handleStartClick = () => {
        if (phase === 'IDLE') {
            setShowModal(true);
        } else if (phase === 'RUNNING' || phase === 'BREAK') {
            pausedFrom.current = phase;
            setPhase('PAUSED');
        } else if (phase === 'PAUSED') {
            setPhase(pausedFrom.current);
        }
    };

    const handleConfigConfirm = (config) => {
        setSessionConfig(config);
        setRoundsLeft(config.rounds);
        setShowModal(false);
        setPrepTimeLeft(PREP_TIME);
        setTimeLeft(config.studyMinutes * 60);
        setPhase('PREPARING');
    };

    const handleVolume = (val) => {
        if (val > 0) lastVolume.current = val;
        setVolume(val);
    };
    const toggleMute = () => handleVolume(volume > 0 ? 0 : lastVolume.current);

    const canAdjust = phase === 'IDLE' && !sessionConfig;
    const decreaseDuration = () => { if (canAdjust) setDurationIdx(p => Math.max(0, p - 1)); };
    const increaseDuration = () => { if (canAdjust) setDurationIdx(p => Math.min(DURATIONS.length - 1, p + 1)); };

    // ── Formateo ──
    const fmt = (s) => ({
        m: Math.floor(s / 60).toString().padStart(2, '0'),
        s: (s % 60).toString().padStart(2, '0'),
    });
    const { m: minutes, s: seconds } = fmt(timeLeft);

    const badgeLabel = {
        PREPARING: 'STATUS_PREPARING',
        RUNNING:   'PROC_DEEP_FOCUS',
        BREAK:     'BREAK_TIME',
        PAUSED:    pausedFrom.current === 'BREAK' ? 'PAUSED · BREAK' : 'STATUS_PAUSED',
        IDLE:      'PROC_DEEP_FOCUS',
    }[phase] ?? 'PROC_DEEP_FOCUS';

    const isBreakPhase = phase === 'BREAK' || (phase === 'PAUSED' && pausedFrom.current === 'BREAK');

    return (
        <>
            {showModal && (
                <SessionConfigModal
                    onConfirm={handleConfigConfirm}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="relative bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col items-center shadow-2xl w-full overflow-hidden">

                <audio ref={audioRef} src={STREAM_URL} />

                {/* Barra de progreso decorativa */}
                <div className={`absolute top-0 left-0 h-[2px] transition-all duration-1000 ${
                    phase === 'RUNNING' ? 'w-full bg-violet-600/50' :
                    isBreakPhase       ? 'w-full bg-emerald-600/40' :
                    'w-0 bg-violet-600/50'
                }`} />

                {/* Badge superior */}
                <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-full px-3 py-1 mb-4 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        phase === 'PREPARING' ? 'bg-yellow-500 animate-pulse' :
                        isBreakPhase          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                                               'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]'
                    }`} />
                    <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                        {badgeLabel}
                    </span>
                </div>

                {/* Control de volumen — visible cuando hay audio activo */}
                <div className={`flex items-center gap-2.5 mb-6 transition-all duration-300 ${
                    phase === 'RUNNING' || phase === 'PAUSED' || phase === 'BREAK'
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                }`}>
                    <button
                        onClick={toggleMute}
                        className="text-neutral-600 hover:text-violet-400 transition-colors flex-shrink-0"
                        title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                    >
                        {volume === 0 ? (
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                                <line x1="23" y1="9" x2="17" y2="15"/>
                                <line x1="17" y1="9" x2="23" y2="15"/>
                            </svg>
                        ) : volume < 0.5 ? (
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        ) : (
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={volume}
                        onChange={e => handleVolume(parseFloat(e.target.value))}
                        className="w-20 accent-violet-500 cursor-pointer h-px bg-neutral-800 rounded-full"
                    />
                    <span className="text-[9px] font-mono text-neutral-700 w-6 text-right tabular-nums">
                        {Math.round(volume * 100)}
                    </span>
                </div>

                {/* Reloj central */}
                <div className="flex items-center justify-center mb-8 select-none h-32">
                    {phase === 'PREPARING' ? (
                        <span className="text-[120px] md:text-[160px] font-bold tracking-tighter text-violet-500 leading-none tabular-nums animate-pulse">
                            {prepTimeLeft}
                        </span>
                    ) : (
                        <>
                            <span className={`text-8xl md:text-[140px] font-light tracking-tighter leading-none tabular-nums transition-colors ${
                                phase === 'PAUSED' ? 'text-neutral-600' :
                                isBreakPhase       ? 'text-emerald-400/80' :
                                'text-white'
                            }`}>
                                {minutes}:{seconds}
                            </span>
                            <span className={`text-3xl md:text-5xl font-light ml-2 mb-4 font-mono transition-colors ${
                                isBreakPhase ? 'text-emerald-500/20' : 'text-violet-500/40'
                            }`}>
                                .00
                            </span>
                        </>
                    )}
                </div>

                {/* Etiqueta break */}
                {isBreakPhase && (
                    <p className="text-[9px] font-mono text-emerald-500/50 uppercase tracking-[0.3em] -mt-4 mb-4">
                        descanso · próxima ronda en {minutes}:{seconds}
                    </p>
                )}

                {/* Controles */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    {sessionConfig ? (
                        /* Con sesión configurada: muestra rondas */
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                            <span className={isBreakPhase ? 'text-emerald-500/50' : 'text-violet-500/60'}>
                                {isBreakPhase ? 'BREAK' : `RONDA ${sessionConfig.rounds - roundsLeft + 1}`}
                            </span>
                            <span className="text-neutral-800">·</span>
                            <span>{roundsLeft} de {sessionConfig.rounds} restantes</span>
                            <span className="text-neutral-800">·</span>
                            <span>{sessionConfig.intensityId}</span>
                        </div>
                    ) : (
                        /* Sin sesión: selector manual */
                        <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
                            {DURATION_LABELS[durationIdx]}
                        </span>
                    )}

                    <div className="flex items-center justify-center">
                        {/* Play / Pause */}
                        <button
                            onClick={handleStartClick}
                            disabled={phase === 'PREPARING'}
                            className={`w-20 h-20 flex items-center justify-center rounded-full text-black shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all transform hover:scale-105
                                ${isBreakPhase
                                    ? 'bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.2)]'
                                    : 'bg-[#9d84fd] hover:bg-[#b09dfd]'
                                }
                                ${phase === 'PREPARING' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {phase === 'RUNNING' || phase === 'BREAK' ? (
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
                </div>

                {/* Footer */}
                <div className="w-full flex items-center justify-center gap-10 border-t border-neutral-800/50 pt-6">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">Estudio</span>
                        <div className="text-xl text-white font-light tabular-nums font-mono">
                            {sessionConfig ? sessionConfig.studyMinutes : DURATIONS[durationIdx] / 60}
                            <span className="text-neutral-600 text-sm ml-1">min</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-neutral-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">Descanso</span>
                        <div className="text-xl text-emerald-400/70 font-light tabular-nums font-mono">
                            {sessionConfig ? sessionConfig.breakMinutes : DEFAULT_BREAKS[durationIdx]}
                            <span className="text-neutral-600 text-sm ml-1">min</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-neutral-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">Ciclos</span>
                        <div className="text-xl text-white font-light tabular-nums">
                            {sessionConfig ? roundsLeft : 1}
                            <span className="text-neutral-600 text-lg mx-0.5">/</span>
                            <span className="text-neutral-400">{sessionConfig ? sessionConfig.rounds : 1}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
