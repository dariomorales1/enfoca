import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainTimerCard from '../components/timer/MainTimerCard';
import SessionEndModal from '../components/timer/SessionEndModal';
import SocraticGuidePanel from '../components/study/SocraticGuidePanel';
import QuizModal from '../components/study/QuizModal';
import { planService } from '../services/api';
import { Maximize2 } from 'lucide-react';

const TRACKS = [
    { name: 'Lofi Hip Hop',  url: 'https://stream.zeno.fm/f3wvbbqmdg8uv'         },
    { name: 'Chillhop',      url: 'https://ice3.somafm.com/groovesalad-128-mp3'  },
    { name: 'Lofi Chill',    url: 'https://lofi.stream.laut.fm/lofi'             },
    { name: 'Jazz & Fusion', url: 'https://ice3.somafm.com/sonicuniverse-128-mp3' },
    { name: 'Deep Focus',    url: 'https://stream.zeno.fm/0r0xa792kwzuv'         },
];

const IconVolumePom = ({ muted }) => muted ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const IconChevron = ({ open }) => (
    <svg className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

function ModuleItem({ modulo, temaActivo, moduleUnlocked, onToggle, onSelectTema }) {
    const [expanded, setExpanded] = useState(false);
    const completed = modulo.temas?.filter(t => t.completado).length ?? 0;
    const total     = modulo.temas?.length ?? 0;
    const allDone   = total > 0 && completed === total;

    return (
        <div className="border-b border-neutral-800/60 last:border-0">
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-2 py-2 px-1 hover:bg-neutral-800/40 transition-colors text-left group rounded-lg"
            >
                <IconChevron open={expanded} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold tracking-widest uppercase mb-0.5 ${allDone ? 'text-violet-500/50' : 'text-neutral-600'}`}>
                        M{String(modulo.orden).padStart(2, '0')}
                    </p>
                    <p className={`text-sm truncate leading-tight transition-colors ${allDone ? 'text-neutral-600 line-through' : 'text-neutral-300 group-hover:text-white'}`}>
                        {modulo.titulo}
                    </p>
                </div>
                <span className="text-xs text-neutral-600 font-mono flex-shrink-0 ml-1">{completed}/{total}</span>
            </button>

            {expanded && (
                <div className="pl-3 pb-1.5 flex flex-col gap-0.5 border-l border-neutral-800 ml-1.5 mt-0.5">
                    {modulo.temas?.map((tema, index) => {
                        const isActive = temaActivo?.id === tema.id;
                        // El módulo debe estar desbloqueado Y todos los temas anteriores dentro del módulo completos
                        const prevAllDone = moduleUnlocked && modulo.temas.slice(0, index).every(t => t.completado);
                        const nextAnyDone = modulo.temas.slice(index + 1).some(t => t.completado);
                        const canToggle = moduleUnlocked && (tema.completado ? !nextAnyDone : prevAllDone);

                        return (
                            <div
                                key={tema.id}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${isActive ? 'bg-violet-600/10 border border-violet-500/20' : 'hover:bg-neutral-800/50'}`}
                            >
                                {/* Checkbox con validación secuencial */}
                                <button
                                    onClick={() => canToggle && onToggle(tema.id)}
                                    disabled={!canToggle}
                                    title={
                                        tema.completado
                                            ? (!canToggle ? 'Desmarca los temas siguientes primero' : 'Marcar como pendiente')
                                            : (!canToggle ? 'Completa los temas anteriores primero' : 'Marcar como completado')
                                    }
                                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                        tema.completado
                                            ? 'bg-violet-600 border-violet-600'
                                            : canToggle
                                                ? 'border-neutral-600 hover:border-violet-500 cursor-pointer'
                                                : 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-40'
                                    }`}
                                >
                                    {tema.completado && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>

                                {/* Texto — selecciona como tema activo (requiere anteriores completos) */}
                                <button
                                    onClick={() => (isActive || prevAllDone) && !tema.completado && onSelectTema(isActive ? null : tema)}
                                    disabled={!isActive && (!prevAllDone || tema.completado)}
                                    title={
                                        tema.completado
                                            ? 'Tema ya completado'
                                            : isActive
                                                ? 'Deseleccionar'
                                                : !prevAllDone
                                                    ? 'Completa los temas anteriores primero'
                                                    : 'Trabajar en este tema'
                                    }
                                    className={`flex-1 text-left min-w-0 ${!isActive && (!prevAllDone || tema.completado) ? 'cursor-not-allowed' : ''}`}
                                >
                                    <span className={`text-xs leading-relaxed select-none transition-all ${
                                        tema.completado
                                            ? 'text-neutral-600 line-through'
                                            : isActive
                                                ? 'text-violet-300 font-medium'
                                                : !prevAllDone
                                                    ? 'text-neutral-700'
                                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}>
                                        {tema.titulo}
                                    </span>
                                    {tema.subtemas?.length > 0 && (
                                        <div className="mt-0.5 flex flex-col gap-px">
                                            {tema.subtemas.map((sub, j) => (
                                                <span key={j} className={`block text-[9px] leading-snug ${tema.completado ? 'text-neutral-700' : 'text-neutral-600'}`}>
                                                    · {sub}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>

                                {isActive && !tema.completado && (
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" title="Tema activo" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function PomodoroPage() {
    const location       = useLocation();
    const navigate       = useNavigate();
    const autoOpenConfig = location.state?.openConfig ?? false;

    const [plan, setPlan]                 = useState(location.state?.plan ?? null);
    const [temaActivo, setTemaActivo]     = useState(null);
    const [showEndModal, setShowEndModal] = useState(false);
    const [sesionesCompletadas, setSesionesCompletadas] = useState(0);
    const [timerPhase, setTimerPhase]       = useState('IDLE');
    const [stopRequested, setStopRequested] = useState(false);
    const timerRef      = useRef(null);
    const temaIdRef     = useRef(null);  // ref síncrono para garantizar el ID al abrir el modal
    const [quiz, setQuiz]                 = useState(null);
    const [quizLoading, setQuizLoading]   = useState(false);
    const [showQuiz, setShowQuiz]         = useState(false);

    // Lofi player
    const pomAudioRef   = useRef(null);
    const pomLastVol    = useRef(0.7);
    const [pomVolume, setPomVolume]       = useState(0.7);
    const [pomTrackIdx, setPomTrackIdx]   = useState(0);

    const [timerConfig, setTimerConfig] = useState({
        focus: 25, break: 5, longBreakFreq: 4, longBreak: 15, rounds: 4
    });

    const handleConfigChange = useCallback((config) => {
        setTimerConfig(config);
    }, []);

    // Lofi: volumen
    useEffect(() => {
        if (pomAudioRef.current) pomAudioRef.current.volume = pomVolume;
    }, [pomVolume]);

    // Lofi: cambio de pista
    useEffect(() => {
        const audio = pomAudioRef.current;
        if (!audio) return;
        audio.pause();
        audio.src = '';
        audio.src = TRACKS[pomTrackIdx].url;
        audio.load();
        if (timerPhase === 'RUNNING') audio.play().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pomTrackIdx]);

    // Lofi: play/pause según fase del timer
    useEffect(() => {
        const audio = pomAudioRef.current;
        if (!audio) return;
        if (timerPhase === 'RUNNING') {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    }, [timerPhase]);

    const pomPrevTrack   = () => setPomTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length);
    const pomNextTrack   = () => setPomTrackIdx(i => (i + 1) % TRACKS.length);
    const pomToggleMute  = () => {
        if (pomVolume > 0) pomLastVol.current = pomVolume;
        setPomVolume(pomVolume > 0 ? 0 : pomLastVol.current);
    };

    const toggleTopic = async (temaId) => {
        if (!plan) return;

        // Localizar el tema y su posición
        let modIdx = -1, temaIdx = -1;
        plan.modulos.forEach((m, mi) => {
            m.temas.forEach((t, ti) => {
                if (t.id === temaId) { modIdx = mi; temaIdx = ti; }
            });
        });
        if (modIdx === -1) return;

        const estaCompletado = plan.modulos[modIdx].temas[temaIdx].completado;

        if (estaCompletado) {
            // DESMARCAR — cascada: desmarcar el tema y todos los posteriores
            // (siguientes del mismo módulo + todos los de módulos siguientes)
            const idsADesmarcar = [];
            plan.modulos.forEach((m, mi) => {
                m.temas.forEach((t, ti) => {
                    if (!t.completado) return;
                    const esDespues =
                        (mi === modIdx && ti >= temaIdx) || mi > modIdx;
                    if (esDespues) idsADesmarcar.push(t.id);
                });
            });

            // Actualizar estado local de una vez
            setPlan(prev => ({
                ...prev,
                modulos: prev.modulos.map((m, mi) => ({
                    ...m,
                    temas: m.temas.map((t, ti) => {
                        const esDespues =
                            (mi === modIdx && ti >= temaIdx) || mi > modIdx;
                        return esDespues ? { ...t, completado: false } : t;
                    })
                }))
            }));

            // Limpiar tema activo si estaba en alguno de los desmarcados
            setTemaActivo(prev =>
                prev && idsADesmarcar.includes(prev.id) ? null : prev
            );

            // Llamar API por cada uno
            idsADesmarcar.forEach(id => planService.toggleTema(id).catch(() => {}));
        } else {
            // MARCAR — solo este tema + registrar hoy en calendario
            const nuevoEstadoPlan = {
                ...plan,
                modulos: plan.modulos.map((m, mi) => ({
                    ...m,
                    temas: m.temas.map((t, ti) =>
                        mi === modIdx && ti === temaIdx
                            ? { ...t, completado: true }
                            : t
                    )
                }))
            };
            setPlan(nuevoEstadoPlan);
            planService.registrarSesion(temaId).catch(() => {});

            // Llamar API y detectar si el módulo quedó completo
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

    const handleTimerComplete = () => {
        setStopRequested(false);
        setSesionesCompletadas(prev => prev + 1);

        // Si no hay tema activo, usar el primer tema incompleto del plan
        const temaEfectivo = temaActivo
            ?? plan?.modulos?.flatMap(m => m.temas).find(t => !t.completado)
            ?? null;

        if (temaEfectivo && temaEfectivo.id) {
            temaIdRef.current = temaEfectivo.id;   // guardar síncronamente
            planService.registrarSesion(temaEfectivo.id).catch(() => {});
            if (!temaActivo) setTemaActivo(temaEfectivo);
        }
        setShowEndModal(true);
    };

    const handleTopicComplete = async (temaId) => {
        // temaId puede ser null si no hay tema activo — usar primer tema incompleto
        const idEfectivo = temaId
            ?? temaActivo?.id
            ?? plan?.modulos?.flatMap(m => m.temas).find(t => !t.completado)?.id;

        if (idEfectivo) {
            const tema = plan?.modulos?.flatMap(m => m.temas).find(t => t.id === idEfectivo);
            if (tema && !tema.completado) await toggleTopic(idEfectivo);
        }
        setShowEndModal(false);
        setTemaActivo(null);
        navigate('/dashboard');
    };

    const handleTopicSchedule = async (fechas) => {
        const todosLosTemas = plan?.modulos?.flatMap(m => m.temas) ?? [];

        // Prioridad: ref síncrono → estado activo → primer incompleto → cualquier tema del plan
        const idEfectivo = temaIdRef.current
            ?? temaActivo?.id
            ?? todosLosTemas.find(t => !t.completado)?.id
            ?? todosLosTemas[0]?.id;   // fallback: usar el primer tema aunque esté completado (repaso)

        if (idEfectivo && fechas?.length > 0) {
            await planService.programar(idEfectivo, fechas).catch(console.error);
        }
        setShowEndModal(false);
        navigate('/dashboard');
    };

    const isLongBreak = sesionesCompletadas > 0 && sesionesCompletadas % timerConfig.longBreakFreq === 0;
    const totalTopics     = plan?.modulos?.reduce((acc, m) => acc + (m.temas?.length ?? 0), 0) ?? 0;
    const completedTopics = plan?.modulos?.reduce((acc, m) => acc + (m.temas?.filter(t => t.completado).length ?? 0), 0) ?? 0;
    const planProgress    = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 text-white font-sans selection:bg-violet-500/30">
            <audio ref={pomAudioRef} />

            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4">
                <h1 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">Active_Terminal</h1>
                <div className="hidden md:flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
                    <button
                        onClick={() => {
                            const ts = timerRef.current?.getTimerState() ?? {};
                            timerRef.current?.pause();
                            document.documentElement.requestFullscreen().catch(() => {});
                            navigate('/focus-mode', {
                                state: {
                                    plan,
                                    topic: temaActivo ?? (plan ? { titulo: plan.titulo } : null),
                                    focusDuration: timerConfig.focus * 60,
                                    shortBreakDuration: timerConfig.break * 60,
                                    longBreakFreq: timerConfig.longBreakFreq,
                                    longBreakDuration: timerConfig.longBreak * 60,
                                    totalRounds: timerConfig.rounds,
                                    sesionesCompletadas,
                                    currentTimeLeft: ts.timeLeft,
                                    currentPhase: ts.phase,
                                    currentRoundsLeft: ts.roundsLeft,
                                }
                            });
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 border border-violet-500/20 rounded-lg transition-all font-semibold"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Deep Focus
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-grow">
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <MainTimerCard
                        ref={timerRef}
                        autoOpenConfig={autoOpenConfig}
                        onComplete={handleTimerComplete}
                        onConfigChange={handleConfigChange}
                        onPhaseChange={setTimerPhase}
                        stopRequested={stopRequested}
                    />

                    {/* Reproductor Lofi */}
                    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Lofi</span>
                            {timerPhase === 'RUNNING' && pomVolume > 0 && (
                                <span className="flex gap-px">
                                    {[1,2,3].map(i => (
                                        <span key={i} className="w-px bg-violet-400 rounded-full animate-pulse" style={{ height: `${4+i*2}px`, animationDelay: `${i*0.15}s` }} />
                                    ))}
                                </span>
                            )}
                        </div>

                        <button onClick={pomPrevTrack} title="Pista anterior"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-600 hover:text-violet-400 hover:bg-white/5 transition-all flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                        </button>

                        <div className="flex-1 flex flex-col items-center min-w-0">
                            <span className={`text-[11px] font-mono truncate w-full text-center transition-colors ${timerPhase==='RUNNING' ? 'text-violet-400' : 'text-neutral-500'}`}>
                                {TRACKS[pomTrackIdx].name}
                            </span>
                            <div className="flex gap-1 mt-1">
                                {TRACKS.map((_, i) => (
                                    <button key={i} onClick={() => setPomTrackIdx(i)}
                                        className={`rounded-full transition-all ${i===pomTrackIdx ? 'w-2.5 h-1.5 bg-violet-500' : 'w-1.5 h-1.5 bg-neutral-700 hover:bg-neutral-500'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button onClick={pomNextTrack} title="Pista siguiente"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-600 hover:text-violet-400 hover:bg-white/5 transition-all flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
                        </button>

                        <div className="w-px h-4 bg-neutral-800 flex-shrink-0" />

                        <button onClick={pomToggleMute}
                            className="text-neutral-600 hover:text-violet-400 transition-colors p-1 flex-shrink-0">
                            <IconVolumePom muted={pomVolume===0} />
                        </button>
                        <input type="range" min="0" max="1" step="0.05" value={pomVolume}
                            onChange={e => setPomVolume(parseFloat(e.target.value))}
                            className="w-14 accent-violet-500 cursor-pointer h-px bg-white/10 rounded-full flex-shrink-0" />
                    </div>

                    {(timerPhase === 'RUNNING' || timerPhase === 'PAUSED' || timerPhase === 'BREAK') && (
                        <button
                            onClick={() => setStopRequested(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 text-xs font-semibold tracking-wider uppercase transition-all"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="4" y="4" width="16" height="16" rx="2"/>
                            </svg>
                            Finalizar sesión
                        </button>
                    )}

                    {sesionesCompletadas > 0 && !showEndModal && (
                        <div className={`flex items-center gap-4 border rounded-xl px-5 py-4 shadow-lg ${isLongBreak ? 'bg-blue-500/10 border-blue-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <div>
                                <p className={`text-sm font-bold ${isLongBreak ? 'text-blue-400' : 'text-emerald-400'}`}>
                                    ¡Sesión completada! ({sesionesCompletadas} ciclos)
                                </p>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    {isLongBreak
                                        ? `Toca un descanso largo (${timerConfig.longBreak} min).`
                                        : `Toca un descanso corto (${timerConfig.break} min).`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Panel derecho — Plan de estudio */}
                <div className="lg:col-span-4 flex flex-col gap-5 self-stretch">
                    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col flex-grow lg:h-0 lg:min-h-0 overflow-hidden">
                        {plan ? (
                            <>
                                <div className="flex items-start justify-between mb-3 flex-shrink-0 gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                                            Temario · Sesión activa
                                        </p>
                                        <h2 className="text-base font-bold text-white leading-tight truncate">
                                            {plan.titulo}
                                        </h2>
                                        <p className="text-xs text-neutral-600 mt-0.5">
                                            {plan.modulos?.length ?? 0} módulos · {totalTopics} temas
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/study-plan')}
                                        className="flex-shrink-0 text-[9px] text-neutral-600 hover:text-violet-400 transition-colors font-mono uppercase tracking-wider"
                                        title="Ir a Plan de Estudio"
                                    >
                                        ←
                                    </button>
                                </div>

                                {temaActivo && (
                                    <div className="flex-shrink-0 mb-2 px-2 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                        <p className="text-[10px] text-violet-300 truncate">
                                            Trabajando en: <span className="font-semibold">{temaActivo.titulo}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="flex-grow overflow-y-auto pr-0.5 min-h-0 flex flex-col gap-0.5">
                                    {plan.modulos?.map((modulo, modIndex) => {
                                        const moduleUnlocked = plan.modulos
                                            .slice(0, modIndex)
                                            .every(m => m.temas?.every(t => t.completado));
                                        return (
                                            <ModuleItem
                                                key={modulo.id}
                                                modulo={modulo}
                                                temaActivo={temaActivo}
                                                moduleUnlocked={moduleUnlocked}
                                                onToggle={toggleTopic}
                                                onSelectTema={setTemaActivo}
                                            />
                                        );
                                    })}
                                </div>


                                <div className="mt-3 flex-shrink-0 border-t border-neutral-800/60 pt-3 flex flex-col gap-3">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                            <span>Avance</span>
                                            <span>{completedTopics}/{totalTopics} · {planProgress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-violet-600 rounded-full transition-all duration-300"
                                                style={{ width: `${planProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <SocraticGuidePanel
                                        temaActivo={temaActivo}
                                        guiaSocratica={temaActivo?.guiaSocratica}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <h2 className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase">Job_Queue</h2>
                                    <button
                                        onClick={() => navigate('/study-plan')}
                                        className="w-5 h-5 rounded border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors"
                                        title="Ir a Plan de Estudio"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="space-y-3 overflow-y-auto pr-1 flex-grow min-h-0">
                                    <div className="border border-neutral-700 bg-neutral-900/30 p-3 rounded-xl flex gap-3">
                                        <div className="w-3.5 h-3.5 rounded border border-violet-500 bg-violet-500/20 mt-0.5" />
                                        <h3 className="text-xs font-medium text-neutral-200">Cognitive Psychology Review</h3>
                                    </div>
                                </div>
                                <div className="mt-4 border border-neutral-800 p-3 rounded-xl bg-black/50 flex-shrink-0">
                                    <p className="text-[10px] font-mono text-neutral-500 italic leading-tight">
                                        "// Focus is the new IQ."
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <QuizModal
                key={quiz?.moduloId ?? 'quiz'}
                isOpen={showQuiz}
                onClose={() => { setShowQuiz(false); setQuiz(null); }}
                cuestionario={quiz}
                loading={quizLoading}
            />

            <SessionEndModal
                isOpen={showEndModal}
                onClose={() => setShowEndModal(false)}
                topic={temaActivo ?? (plan ? { id: null, titulo: plan.titulo } : null)}
                onComplete={handleTopicComplete}
                onSchedule={handleTopicSchedule}
            />
        </div>
    );
}
