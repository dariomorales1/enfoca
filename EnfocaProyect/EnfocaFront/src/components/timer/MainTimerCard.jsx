import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { pomodoroService, metricsService } from '../../services/api';
import SessionConfigModal from './SessionConfigModal';

const getUserId = () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return String(payload.sub ?? payload.userId ?? payload.id ?? '');
    } catch { return null; }
};

const DURATIONS       = [1500, 2400, 3000];
const DURATION_LABELS = ['25 MIN', '40 MIN', '50 MIN'];
const DEFAULT_BREAKS  = [5, 5, 10];
const STREAM_URL      = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
const PREP_TIME       = 10;

// 🔴 IMPORTANTE: Asegúrate de que onConfigChange esté escrito aquí
const MainTimerCard = forwardRef(function MainTimerCard({ autoOpenConfig = false, onComplete, onConfigChange, onPhaseChange, stopRequested = false }, ref) {

    const [phase, setPhase]       = useState('IDLE');
    const [sessionId, setSessionId] = useState(null);
    const duracion    = useRef(0);
    const pausedFrom  = useRef('RUNNING');

    const [durationIdx, setDurationIdx] = useState(0);

    const [showModal,     setShowModal]     = useState(false);
    const [sessionConfig, setSessionConfig] = useState(null);
    const [roundsLeft,    setRoundsLeft]    = useState(0);

    const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_TIME);
    const [timeLeft,     setTimeLeft]     = useState(DURATIONS[0]);

    const [volume,     setVolume]     = useState(0.7);
    const lastVolume   = useRef(0.7);
    const audioRef     = useRef(null);

    useImperativeHandle(ref, () => ({
        getTimerState: () => ({ phase, timeLeft, roundsLeft, sessionConfig }),
        pause: () => {
            if (phase === 'RUNNING' || phase === 'BREAK') {
                pausedFrom.current = phase;
                audioRef.current?.pause();
                setPhase('PAUSED');
            }
        },
    }));

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => { onPhaseChange?.(phase); }, [phase]);

    useEffect(() => {
        if (!stopRequested || phase === 'IDLE') return;
        audioRef.current?.pause();
        if (sessionId) pomodoroService.completar(sessionId, 'ABANDONED').catch(() => {});
        setSessionId(null);
        setSessionConfig(null);
        setRoundsLeft(0);
        setPhase('IDLE');
        onComplete?.();
    }, [stopRequested]);

    useEffect(() => {
        if (autoOpenConfig) setShowModal(true);
    }, [autoOpenConfig]);

    // 🔴 ESTE ES EL MOTOR QUE LE ENVÍA LOS DATOS A POMODOROPAGE
    // DENTRO DE MainTimerCard.jsx
    useEffect(() => {
        if (onConfigChange) {
            const config = sessionConfig || {
                studyMinutes: DURATIONS[durationIdx] / 60,
                breakMinutes: DEFAULT_BREAKS[durationIdx],
                longBreakFreq: [4, 3, 2][durationIdx],
                longBreakMinutes: [15, 20, 30][durationIdx],
                rounds: [4, 3, 2][durationIdx]
            };

            onConfigChange({
                focus: config.studyMinutes,
                break: config.breakMinutes,
                longBreakFreq: config.longBreakFreq,
                longBreak: config.longBreakMinutes,
                rounds: config.rounds
            });
        }
    }, [sessionConfig, durationIdx, onConfigChange]);

    useEffect(() => {
        if (phase === 'IDLE' && !sessionConfig) {
            setTimeLeft(DURATIONS[durationIdx]);
        }
    }, [durationIdx, phase, sessionConfig]);

    // PREPARING
    useEffect(() => {
        if (phase !== 'PREPARING') return;
        const id = setInterval(() => {
            setPrepTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    pomodoroService.iniciar({
                        userId:          getUserId(),
                        sessionType:     'FOCUS',
                        durationMinutes: Math.max(sessionConfig ? sessionConfig.studyMinutes : DURATIONS[durationIdx] / 60, 15),
                    }).then(res => {
                        const id = res.data?.id ?? null;
                        setSessionId(id);
                        if (id) pomodoroService.comenzar(id).catch(() => {});
                    }).catch(() => {});
                    duracion.current = 0;
                    setPhase('RUNNING');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // RUNNING
    useEffect(() => {
        if (phase !== 'RUNNING') return;
        if (audioRef.current && !audioRef.current.src) {
            audioRef.current.src = STREAM_URL;
        }
        audioRef.current?.play().catch(() => {});

        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(id); return 0; }
                duracion.current += 1;
                return prev - 1;
            });
        }, 1000);

        return () => { clearInterval(id); audioRef.current?.pause(); };
    }, [phase]);

    // BREAK
    useEffect(() => {
        if (phase !== 'BREAK') return;
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(id); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // TRANSICIONES
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

    const handleStartClick = () => {
        if (phase === 'IDLE') setShowModal(true);
        else if (phase === 'RUNNING' || phase === 'BREAK') {
            pausedFrom.current = phase;
            setPhase('PAUSED');
        } else if (phase === 'PAUSED') setPhase(pausedFrom.current);
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
            {showModal && <SessionConfigModal onConfirm={handleConfigConfirm} onClose={() => setShowModal(false)} />}
            {/* Se redujo el padding en móvil (p-4 a p-3 sm:p-4) para dar más espacio horizontal */}
            <div className="relative bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-2xl w-full overflow-hidden">
                <audio ref={audioRef} preload="none" />

                {/* Badge superior */}
                {/* Se redujo el margen superior en móvil (mt-4 a mt-2 sm:mt-4) */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-black border border-neutral-800 rounded-full px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 shadow-sm mt-2 sm:mt-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${phase === 'PREPARING' ? 'bg-yellow-500 animate-pulse' : isBreakPhase ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]'}`} />
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono tracking-widest uppercase">{badgeLabel}</span>
                </div>

                {/* Reloj central */}
                {/* Altura adaptativa y fuentes usando clamp() para escalar con la pantalla */}
                <div className="flex items-center justify-center mb-6 sm:mb-8 select-none h-24 sm:h-32 mt-2 sm:mt-4 w-full">
                    {phase === 'PREPARING' ? (
                        <span className="font-bold tracking-tighter text-violet-500 leading-none tabular-nums animate-pulse"
                              style={{ fontSize: 'clamp(80px, 20vw, 160px)' }}>
                            {prepTimeLeft}
                        </span>
                    ) : (
                        <div className="flex items-end justify-center w-full">
                            {/* El uso de clamp asegura que nunca excederá el ancho de un teléfono pequeño */}
                            <span className={`font-light tracking-tighter leading-none tabular-nums transition-colors ${phase === 'PAUSED' ? 'text-neutral-600' : isBreakPhase ? 'text-emerald-400/80' : 'text-white'}`}
                                  style={{ fontSize: 'clamp(70px, 18vw, 140px)' }}>
                                {minutes}:{seconds}
                            </span>
                            <span className={`font-light ml-1 sm:ml-2 mb-2 sm:mb-4 font-mono transition-colors ${isBreakPhase ? 'text-emerald-500/20' : 'text-violet-500/40'}`}
                                  style={{ fontSize: 'clamp(24px, 5vw, 48px)' }}>
                                .00
                            </span>
                        </div>
                    )}
                </div>

                {/* Controles */}
                <div className="flex flex-col items-center gap-3 mb-6 sm:mb-8">
                    {sessionConfig ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                            <span className={isBreakPhase ? 'text-emerald-500/50' : 'text-violet-500/60'}>
                                {isBreakPhase ? 'BREAK' : `RONDA ${sessionConfig.rounds - roundsLeft + 1}`}
                            </span>
                            <span className="text-neutral-800">·</span>
                            <span>{roundsLeft} de {sessionConfig.rounds} restantes</span>
                        </div>
                    ) : (
                        <span className="text-[9px] sm:text-[10px] text-neutral-600 font-mono tracking-widest uppercase">{DURATION_LABELS[durationIdx]}</span>
                    )}

                    <div className="flex items-center justify-center">
                        <button onClick={handleStartClick} disabled={phase === 'PREPARING'} className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full text-black shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all transform hover:scale-105 ${isBreakPhase ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-[#9d84fd] hover:bg-[#b09dfd]'} ${phase === 'PREPARING' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}>
                            {phase === 'RUNNING' || phase === 'BREAK' ? (
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current transform translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Controles de sonido */}
                <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 w-full max-w-[200px] sm:max-w-[220px]">
                    <button
                        onClick={toggleMute}
                        className="text-neutral-500 hover:text-white transition-colors flex-shrink-0 p-1"
                        title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                    >
                        {volume === 0 ? (
                            <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                            </svg>
                        ) : volume < 0.5 ? (
                            <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        ) : (
                            <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={volume}
                        onChange={e => handleVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1.5 sm:h-1 appearance-none rounded-full cursor-pointer accent-violet-500"
                        style={{ background: `linear-gradient(to right, #8b5cf6 ${volume * 100}%, #262626 ${volume * 100}%)` }}
                    />
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-600 w-5 sm:w-6 text-right tabular-nums">
                        {Math.round(volume * 100)}
                    </span>
                </div>

                {/* Footer de métricas: Se ajustó el gap para que no se desborde en móvil */}
                <div className="w-full flex items-center justify-between sm:justify-center sm:gap-10 border-t border-neutral-800/50 pt-4 sm:pt-6 px-2 sm:px-0">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-0.5 sm:mb-1">Estudio</span>
                        <div className="text-lg sm:text-xl text-white font-light tabular-nums font-mono">
                            {sessionConfig ? sessionConfig.studyMinutes : DURATIONS[durationIdx] / 60}
                            <span className="text-neutral-600 text-xs sm:text-sm ml-0.5 sm:ml-1">min</span>
                        </div>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-neutral-800" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-0.5 sm:mb-1">Descanso</span>
                        <div className="text-lg sm:text-xl text-emerald-400/70 font-light tabular-nums font-mono">
                            {sessionConfig ? sessionConfig.breakMinutes : DEFAULT_BREAKS[durationIdx]}
                            <span className="text-neutral-600 text-xs sm:text-sm ml-0.5 sm:ml-1">min</span>
                        </div>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-neutral-800" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-0.5 sm:mb-1">Ciclos</span>
                        <div className="text-lg sm:text-xl text-white font-light tabular-nums">
                            {sessionConfig ? roundsLeft : 1}
                            <span className="text-neutral-600 text-base sm:text-lg mx-0.5">/</span>
                            <span className="text-neutral-400">{sessionConfig ? sessionConfig.rounds : 1}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default MainTimerCard;