import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SessionEndModal from '../components/timer/SessionEndModal';
import QuizModal from '../components/study/QuizModal';
import { planService } from '../services/api';

const TRACKS = [
    { name: 'Lofi Hip Hop',   url: 'https://stream.zeno.fm/f3wvbbqmdg8uv'        },
    { name: 'Chillhop',       url: 'https://ice3.somafm.com/groovesalad-128-mp3' },
    { name: 'Lofi Chill',     url: 'https://lofi.stream.laut.fm/lofi'            },
    { name: 'Jazz & Fusion',  url: 'https://ice3.somafm.com/sonicuniverse-128-mp3' },
    { name: 'Deep Focus',     url: 'https://stream.zeno.fm/0r0xa792kwzuv'        },
];

function fmt(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return { m, s };
}

const IconPlay = () => ( <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> );
const IconPause = () => ( <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> );
const IconClose = () => ( <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );
const IconFullscreen = () => ( <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg> );
const IconExitFullscreen = () => ( <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg> );
const IconVolume = ({ muted }) => muted ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
);

export default function FocusModePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state || {};
    const topic = state.topic || null;
    const [plan, setPlan] = useState(state.plan ?? null);

    // En móviles, inicializamos el panel oculto por defecto para que no estorbe
    const [panelVisible, setPanelVisible] = useState(window.innerWidth > 768);

    const focusDuration      = state.focusDuration || 25 * 60;
    const shortBreakDuration = state.shortBreakDuration || 5 * 60;
    const longBreakFreq      = state.longBreakFreq || 4;
    const longBreakDuration  = state.longBreakDuration || 15 * 60;
    const totalRounds        = state.totalRounds || 4;

    const resuming = state.currentPhase === 'RUNNING' || state.currentPhase === 'PAUSED' || state.currentPhase === 'BREAK';

    useEffect(() => {
        if (!state.plan && !state.topic && !resuming) {
            navigate('/study-plan', { replace: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [mode, setMode] = useState(state.currentPhase === 'BREAK' ? 'shortBreak' : 'focus');
    const [sesionesCompletadas, setSesionesCompletadas] = useState(
        state.currentRoundsLeft != null
            ? (state.totalRounds || 4) - state.currentRoundsLeft
            : (state.sesionesCompletadas || 0)
    );
    const [phase, setPhase]   = useState(resuming ? (state.currentPhase === 'RUNNING' ? 'RUNNING' : 'PAUSED') : 'PREPARING');
    const [prepLeft, setPrepLeft] = useState(10);
    const [timeLeft, setTimeLeft] = useState(state.currentTimeLeft ?? focusDuration);

    const [volume, setVolume]     = useState(0.7);
    const lastVolume              = useRef(0.7);
    const [trackIdx, setTrackIdx] = useState(0);
    const audioRef                = useRef(null);
    const shouldPlayAudio         = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [quiz, setQuiz]         = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    const toggleTopic = async (temaId) => {
        if (!plan) return;
        let modIdx = -1, temaIdx = -1;
        plan.modulos.forEach((m, mi) => m.temas.forEach((t, ti) => {
            if (t.id === temaId) { modIdx = mi; temaIdx = ti; }
        }));
        if (modIdx === -1) return;

        const estaCompletado = plan.modulos[modIdx].temas[temaIdx].completado;

        if (estaCompletado) {
            const idsADesmarcar = [];
            plan.modulos.forEach((m, mi) => m.temas.forEach((t, ti) => {
                if (t.completado && ((mi === modIdx && ti >= temaIdx) || mi > modIdx))
                    idsADesmarcar.push(t.id);
            }));
            setPlan(prev => ({
                ...prev,
                modulos: prev.modulos.map((m, mi) => ({
                    ...m,
                    temas: m.temas.map((t, ti) => {
                        const esDespues = (mi === modIdx && ti >= temaIdx) || mi > modIdx;
                        return esDespues ? { ...t, completado: false } : t;
                    })
                }))
            }));
            idsADesmarcar.forEach(id => planService.toggleTema(id).catch(() => {}));
        } else {
            setPlan(prev => ({
                ...prev,
                modulos: prev.modulos.map((m, mi) => ({
                    ...m,
                    temas: m.temas.map((t, ti) =>
                        mi === modIdx && ti === temaIdx ? { ...t, completado: true } : t
                    )
                }))
            }));
            planService.registrarSesion(temaId).catch(() => {});
            planService.toggleTema(temaId)
                .then(({ data }) => {
                    if (data?.moduloCompletado && data?.moduloId) {
                        setQuizLoading(true);
                        setShowQuiz(true);
                        planService.generarCuestionario(data.moduloId)
                            .then(res => setQuiz(res.data))
                            .catch(() => setShowQuiz(false))
                            .finally(() => setQuizLoading(false));
                    }
                })
                .catch(() => {});
        }
    };

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.src = '';
        audio.src = TRACKS[trackIdx].url;
        audio.load();
        if (shouldPlayAudio.current) audio.play().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIdx]);

    const prevTrack = () => setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length);
    const nextTrack = () => setTrackIdx(i => (i + 1) % TRACKS.length);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    useEffect(() => {
        if (phase !== 'PREPARING') return;
        const id = setInterval(() => {
            setPrepLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    setPhase('RUNNING');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'RUNNING') return;

        if (mode === 'focus') {
            shouldPlayAudio.current = true;
            audioRef.current?.play().catch(() => {});
        } else {
            shouldPlayAudio.current = false;
        }

        const id = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => {
            clearInterval(id);
            shouldPlayAudio.current = false;
            audioRef.current?.pause();
        };
    }, [phase, mode]);

    useEffect(() => {
        if (phase === 'RUNNING' && timeLeft <= 0) {
            if (mode === 'focus') {
                const nextSesiones = sesionesCompletadas + 1;
                setSesionesCompletadas(nextSesiones);
                if (nextSesiones >= totalRounds) {
                    setPhase('IDLE');
                    triggerEndSession();
                } else {
                    const isLongBreak = nextSesiones % longBreakFreq === 0;
                    setMode(isLongBreak ? 'longBreak' : 'shortBreak');
                    setTimeLeft(isLongBreak ? longBreakDuration : shortBreakDuration);
                    setPhase('RUNNING');
                }
            } else {
                setMode('focus');
                setTimeLeft(focusDuration);
                setPrepLeft(10);
                setPhase('PREPARING');
            }
        }
    }, [timeLeft, phase, mode, sesionesCompletadas, totalRounds, longBreakFreq, longBreakDuration, shortBreakDuration, focusDuration]);

    const handlePlayPause = () => {
        if (phase === 'RUNNING') setPhase('PAUSED');
        else if (phase === 'PAUSED') setPhase('RUNNING');
    };

    const triggerEndSession = () => {
        audioRef.current?.pause();
        setPhase('PAUSED');
        setIsModalOpen(true);
    };

    const handleClose = () => {
        audioRef.current?.pause();
        setPhase('PAUSED');
        setIsModalOpen(true);

        if (!topic) {
            setTimeout(() => {
                if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                navigate('/dashboard');
            }, 300);
        }
    };

    const toggleMute = () => {
        if (volume > 0) lastVolume.current = volume;
        setVolume(volume > 0 ? 0 : lastVolume.current);
    };

    const totalDuration = mode === 'focus' ? focusDuration : (mode === 'shortBreak' ? shortBreakDuration : longBreakDuration);
    const elapsed  = totalDuration - timeLeft;
    const progress = phase === 'IDLE' ? 100 : (elapsed / totalDuration) * 100;
    const { m, s } = fmt(timeLeft);

    const getStatusText = () => {
        if (phase === 'IDLE') return 'Sesión Completada';
        if (phase === 'PREPARING') return 'Preparando...';
        if (phase === 'PAUSED') return 'Pausado';
        if (mode === 'focus') return 'Focus Period';
        if (mode === 'shortBreak') return 'Descanso Corto';
        return 'Descanso Largo';
    };

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden select-none">
            <audio ref={audioRef} />

            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                <img src="/focus-bg.webp" alt="" className={`w-full h-full object-cover mix-blend-luminosity grayscale ${mode === 'focus' ? 'opacity-20' : 'opacity-10'}`} />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            {/* HEADER */}
            <div className="relative z-10 flex-shrink-0 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] font-bold text-neutral-400">ENFOCA</span>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        className="text-neutral-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                    >
                        {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
                    </button>
                    <button onClick={handleClose} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                        <span className="text-[10px] tracking-widest font-mono uppercase hidden sm:block">Finalizar</span>
                        <IconClose />
                    </button>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-row min-h-0 relative">

                {/* PANEL LATERAL DEL PLAN DE ESTUDIO (Mobile: Flotante absolute / Desktop: Fijo relative) */}
                {plan && (
                    <div className={`
                        absolute md:relative z-50 h-full flex-shrink-0 flex flex-col transition-all duration-300
                        ${panelVisible ? 'w-[80%] max-w-[300px] sm:w-72 md:w-64 translate-x-0' : 'w-10 sm:w-12 md:w-10 -translate-x-full md:translate-x-0'}
                        bg-black/90 md:bg-black/40 border-r border-white/10 md:border-white/5 backdrop-blur-md md:backdrop-blur-sm overflow-hidden
                    `}>
                        {panelVisible ? (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest mb-0.5">Plan activo</p>
                                        <p className="text-xs font-bold text-white truncate">{plan.titulo}</p>
                                    </div>
                                    <button onClick={() => setPanelVisible(false)} className="flex-shrink-0 ml-2 p-2 -mr-2 text-neutral-600 hover:text-white transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                                    {plan.modulos?.map((modulo, modIndex) => {
                                        const done  = modulo.temas?.filter(t => t.completado).length ?? 0;
                                        const total = modulo.temas?.length ?? 0;
                                        const moduleUnlocked = plan.modulos
                                            .slice(0, modIndex)
                                            .every(m => m.temas?.every(t => t.completado));
                                        return (
                                            <div key={modulo.id}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider truncate">{modulo.titulo}</p>
                                                    <span className="text-[9px] font-mono text-neutral-700 flex-shrink-0 ml-1">{done}/{total}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {modulo.temas?.map((tema, temaIndex) => {
                                                        const prevAllDone = moduleUnlocked && modulo.temas.slice(0, temaIndex).every(t => t.completado);
                                                        const nextAnyDone = modulo.temas.slice(temaIndex + 1).some(t => t.completado);
                                                        const canToggle = moduleUnlocked && (tema.completado ? !nextAnyDone : prevAllDone);
                                                        return (
                                                            <button
                                                                key={tema.id}
                                                                onClick={() => canToggle && toggleTopic(tema.id)}
                                                                disabled={!canToggle}
                                                                title={tema.completado
                                                                    ? (!canToggle ? 'Desmarca los temas siguientes primero' : 'Desmarcar')
                                                                    : (!canToggle ? 'Completa los anteriores primero' : 'Marcar como completado')}
                                                                className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors text-left w-full ${
                                                                    tema.completado ? 'bg-violet-600/10' : canToggle ? 'hover:bg-white/5 cursor-pointer' : 'cursor-not-allowed opacity-40'
                                                                }`}
                                                            >
                                                                <div className={`w-3 h-3 rounded flex-shrink-0 border flex items-center justify-center transition-all mt-0.5 ${
                                                                    tema.completado ? 'bg-violet-500 border-violet-500' : canToggle ? 'border-neutral-500' : 'border-neutral-700'
                                                                }`}>
                                                                    {tema.completado && (
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                                                                            <polyline points="20 6 9 17 4 12"/>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                    <span className={`text-[10px] leading-tight ${tema.completado ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}>
                                                                        {tema.titulo}
                                                                    </span>
                                                                    {tema.subtemas?.length > 0 && (
                                                                        <div className="mt-0.5 flex flex-col gap-px">
                                                                            {tema.subtemas.map((sub, j) => (
                                                                                <span key={j} className={`text-[9px] leading-snug ${tema.completado ? 'text-neutral-700' : 'text-neutral-600'}`}>
                                                                                    · {sub}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setPanelVisible(true)}
                                // El botón de apertura se ajusta y se despega del borde en móvil
                                className="absolute md:relative top-4 md:top-0 left-0 h-10 w-10 md:h-full md:w-full flex items-center justify-center bg-black/40 md:bg-transparent rounded-r-lg md:rounded-none border border-l-0 border-white/10 md:border-none text-neutral-600 hover:text-white transition-colors z-50"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* TIMER PRINCIPAL CENTRADO */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4">

                    {/* INDICADOR DINÁMICO DE RONDAS TOTALES */}
                    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
                        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(dot => {
                            const isCompleted = sesionesCompletadas >= dot;
                            const isCurrent = sesionesCompletadas + 1 === dot && phase !== 'IDLE';

                            return (
                                <div
                                    key={dot}
                                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                                        isCompleted ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]' :
                                            isCurrent ? 'bg-violet-500/50 animate-pulse' :
                                                'bg-neutral-800'
                                    }`}
                                />
                            );
                        })}
                    </div>

                    <h2 className={`text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-medium mb-3 sm:mb-4 text-center ${phase === 'IDLE' ? 'text-violet-400' : (mode === 'focus' ? 'text-neutral-500' : 'text-emerald-500')}`}>
                        {getStatusText()}
                    </h2>

                    {phase === 'PREPARING' ? (
                        <div className="font-light leading-none tracking-tighter tabular-nums text-violet-400 animate-pulse mb-6 sm:mb-8" style={{ fontSize: 'clamp(64px, min(18vw, 24vh), 200px)' }}>
                            {prepLeft}
                        </div>
                    ) : (
                        <div className={`font-light leading-none tracking-tighter tabular-nums transition-colors mb-6 sm:mb-8 ${phase === 'PAUSED' || phase === 'IDLE' ? 'text-neutral-500' : (mode === 'focus' ? 'text-white' : 'text-emerald-400')}`} style={{ fontSize: 'clamp(64px, min(18vw, 24vh), 180px)' }}>
                            {m}:{s}
                        </div>
                    )}

                    {(phase === 'RUNNING' || phase === 'PAUSED') && (
                        <button onClick={handlePlayPause} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all backdrop-blur-sm ${mode === 'focus' ? 'border-neutral-700/50 text-neutral-300 hover:text-white hover:bg-white/10' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}>
                            {phase === 'RUNNING' ? <IconPause /> : <IconPlay />}
                        </button>
                    )}

                    {phase === 'IDLE' && (
                        <button onClick={handleClose} className="px-8 sm:px-10 py-3 sm:py-3 rounded-full border border-violet-500/50 bg-violet-500/10 text-xs sm:text-sm text-violet-300 hover:text-white hover:bg-violet-500/30 transition-all tracking-[0.2em] uppercase mt-4">
                            Terminar y Guardar
                        </button>
                    )}

                    {/* REPRODUCTOR LOFI — centrado, siempre visible */}
                    <div className="mt-6 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                        <button
                            onClick={prevTrack}
                            title="Pista anterior"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-violet-400 hover:bg-white/10 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                            </svg>
                        </button>

                        <div className="flex flex-col items-center min-w-[90px] sm:min-w-[110px]">
                            <div className="flex items-center gap-1.5">
                                {phase === 'RUNNING' && mode === 'focus' && volume > 0 && (
                                    <span className="flex gap-px">
                                        {[1,2,3].map(i => (
                                            <span key={i} className="w-px bg-violet-400 rounded-full animate-pulse" style={{ height: `${4+i*2}px`, animationDelay: `${i*0.15}s` }} />
                                        ))}
                                    </span>
                                )}
                                <span className={`text-[11px] font-mono truncate transition-colors ${phase==='RUNNING' && mode==='focus' ? 'text-violet-400' : 'text-neutral-500'}`}>
                                    {TRACKS[trackIdx].name}
                                </span>
                            </div>
                            <div className="flex gap-1 mt-1">
                                {TRACKS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTrackIdx(i)}
                                        className={`rounded-full transition-all ${i===trackIdx ? 'w-2.5 h-1.5 bg-violet-500' : 'w-1.5 h-1.5 bg-neutral-700 hover:bg-neutral-500'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={nextTrack}
                            title="Pista siguiente"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-violet-400 hover:bg-white/10 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
                            </svg>
                        </button>

                        <div className="w-px h-3.5 bg-white/10" />

                        <button onClick={toggleMute} className="text-neutral-500 hover:text-violet-400 transition-colors p-1">
                            <IconVolume muted={volume===0} />
                        </button>
                        <input
                            type="range" min="0" max="1" step="0.05" value={volume}
                            onChange={e => setVolume(parseFloat(e.target.value))}
                            className="w-14 sm:w-16 accent-violet-500 cursor-pointer h-px bg-white/10 rounded-full"
                        />
                    </div>

                    {topic && <p className="mt-5 sm:mt-6 text-[10px] sm:text-xs font-mono text-neutral-500 tracking-widest uppercase text-center px-4 line-clamp-2">{topic.titulo}</p>}

                    {/* BARRA DE PROGRESO */}
                    {phase !== 'PREPARING' && (
                        <div className="w-full max-w-xs sm:max-w-sm px-2 sm:px-4 pb-4 sm:pb-6 mt-6 sm:mt-8">
                            <div className="h-px w-full bg-neutral-800 rounded-full mb-2 sm:mb-3 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ${phase === 'IDLE' ? 'bg-violet-500' : (mode === 'focus' ? 'bg-violet-500' : 'bg-emerald-500')}`} style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                                <span>{fmt(elapsed).m}m {fmt(elapsed).s}s transcurrido</span>
                                <span>{m}m {s}s restante</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALES */}
            <SessionEndModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                topic={topic}
                onComplete={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    navigate('/dashboard');
                }}
                onSchedule={async (fechas) => {
                    const todosLosTemas = plan?.modulos?.flatMap(m => m.temas) ?? [];
                    const idEfectivo = topic?.id
                        ?? todosLosTemas.find(t => !t.completado)?.id
                        ?? todosLosTemas[0]?.id;
                    if (idEfectivo && fechas?.length > 0) {
                        await planService.programar(idEfectivo, fechas).catch(console.error);
                    }
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    navigate('/dashboard');
                }}
            />

            <QuizModal
                key={quiz?.moduloId ?? 'quiz'}
                isOpen={showQuiz}
                onClose={() => { setShowQuiz(false); setQuiz(null); }}
                cuestionario={quiz}
                loading={quizLoading}
            />

        </div>
    );
}