import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { planService } from '../services/api';
import Sidebar from '../components/common/Sidebar';

const TIME_OPTIONS = [
    { value: '2 horas', label: '2 Horas (Liviano)' },
    { value: '5 horas', label: '5 Horas (Moderado)' },
    { value: '10 horas', label: '10 Horas (Intensivo)' },
    { value: '20 horas o más', label: '20+ Horas (Profundo)' },
];

const NIVEL_OPTIONS = [
    { value: 'BASICO', label: 'Básico' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' },
];

const TAG_COLORS = {
    ACTIVO:      'bg-emerald-600',
    EN_REVISION: 'bg-amber-600',
    CONGELADO:   'bg-violet-600',
    EN_MEJORA:   'bg-blue-600',
};
const PLAN_BG = {
    ACTIVO:      'from-emerald-900/50',
    EN_REVISION: 'from-amber-900/50',
    CONGELADO:   'from-violet-900/50',
    EN_MEJORA:   'from-blue-900/50',
};
const CARD_PALETTE = [
    'from-violet-900/60',
    'from-blue-900/60',
    'from-emerald-900/60',
    'from-amber-900/60',
    'from-rose-900/60',
    'from-cyan-900/60',
    'from-orange-900/60',
    'from-purple-900/60',
];

const TAG_LABELS = {
    ACTIVO: 'Activo',
    EN_REVISION: 'En revisión',
    CONGELADO: 'Congelado',
    EN_MEJORA: 'En mejora',
};

const SparkleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="2"/>
        <path d="M12 2v6"/>
        <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="13" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="13" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M9 17h6"/>
        <path d="M3 12H1M23 12h-2"/>
    </svg>
);
const SaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
    </svg>
);
const ChevronIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);
const CodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
);
const FocusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M3 9V5h4M21 9V5h-4M3 15v4h4M21 15v4h-4"/>
    </svg>
);

const getPlanProgress = (plan) => {
    if (!plan?.modulos) return plan?.progreso?.porcentaje ?? 0;
    const total = plan.modulos.reduce((acc, m) => acc + (m.temas?.length ?? 0), 0);
    if (total === 0) return 0;
    const done  = plan.modulos.reduce((acc, m) => acc + (m.temas?.filter(t => t.completado).length ?? 0), 0);
    return Math.round((done / total) * 100);
};

export default function StudyPlanPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [materia, setMateria] = useState('');
    const [tiempo, setTiempo] = useState('10 horas');
    const [objetivo, setObjetivo] = useState('');
    const [nivel, setNivel] = useState('BASICO');
    const [status, setStatus] = useState('idle');
    const [planActual, setPlanActual] = useState(null);
    const [error, setError] = useState('');
    const [misPlanes, setMisPlanes] = useState([]);
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [retentionIndex, setRetentionIndex] = useState(null);

    useEffect(() => {
        planService.listar().then(r => setMisPlanes(r.data)).catch(() => {});
        if (location.state?.planSeleccionado) {
            setPlanSeleccionado(location.state.planSeleccionado);
            setStatus('generated');
        }
    }, []);

    const planMostradoId = (planSeleccionado || planActual)?.id;
    useEffect(() => {
        if (!planMostradoId) { setRetentionIndex(null); return; }
        planService.obtener(planMostradoId)
            .then(r => setRetentionIndex(Math.round((r.data?.ratioValidaciones ?? 0) * 100)))
            .catch(() => setRetentionIndex(null));
    }, [planMostradoId]);

    const handleGenerar = async () => {
        if (!materia.trim()) return;
        setStatus('generating');
        setError('');
        setPlanActual(null);
        try {
            const { data } = await planService.crear({ materia, tiempoDisponible: tiempo, objetivo, nivel });
            setPlanActual(data);
            setMisPlanes(prev => [data, ...prev]);
            setStatus('generated');
        } catch (err) {
            const msg = err.response?.data?.mensaje || 'Error al generar el plan. Intenta de nuevo.';
            setError(msg);
            setStatus('idle');
        }
    };

    const handleEliminar = async (id) => {
        try {
            await planService.eliminar(id);
            setMisPlanes(prev => prev.filter(p => p.id !== id));
            if (planActual?.id === id) { setPlanActual(null); setStatus('idle'); }
            if (planSeleccionado?.id === id) setPlanSeleccionado(null);
        } catch {}
    };


    const handleToggleTema = (temaId) => {
        if (!planActual) return;
        setPlanActual(prev => ({
            ...prev,
            modulos: prev.modulos.map(m => ({
                ...m,
                temas: m.temas.map(t =>
                    t.id === temaId ? { ...t, completado: !t.completado } : t
                )
            }))
        }));
    };

    const planMostrado = planSeleccionado || planActual;

    return (
        <div className="flex h-screen bg-[#0c0c0c] overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Generador de Plan de Estudio con IA
                </h1>
                <p className="text-neutral-400 text-sm mt-2 max-w-xl leading-relaxed">
                    Elabora una hoja de ruta de alto rendimiento adaptada a tus objetivos académicos y capacidad cognitiva.
                </p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">

                {/* Left — Parámetros */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <line x1="9" y1="9" x2="15" y2="9"/>
                                    <line x1="9" y1="12" x2="15" y2="12"/>
                                    <line x1="9" y1="15" x2="12" y2="15"/>
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-white">Parámetros del Plan</span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-neutral-400">Materia o Área</label>
                            <input
                                type="text"
                                value={materia}
                                onChange={e => setMateria(e.target.value)}
                                placeholder="ej. Macroeconomía Avanzada"
                                className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-400">Tiempo</label>
                                <div className="relative">
                                    <select value={tiempo} onChange={e => setTiempo(e.target.value)}
                                        className="w-full appearance-none bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600/50 cursor-pointer pr-7">
                                        {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"><ChevronIcon /></span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-neutral-400">Nivel</label>
                                <div className="relative">
                                    <select value={nivel} onChange={e => setNivel(e.target.value)}
                                        className="w-full appearance-none bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600/50 cursor-pointer pr-7">
                                        {NIVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"><ChevronIcon /></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-neutral-400">Objetivo Principal</label>
                            <textarea value={objetivo} onChange={e => setObjetivo(e.target.value)}
                                placeholder="Define tus objetivos de aprendizaje..."
                                rows={3}
                                className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 transition-colors resize-none"/>
                        </div>

                        {error && (
                            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                {error}
                            </div>
                        )}

                        <button onClick={handleGenerar}
                            disabled={!materia.trim() || status === 'generating'}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all active:scale-[0.98] ${
                                !materia.trim() ? 'bg-violet-600/30 text-violet-400/50 cursor-not-allowed'
                                : status === 'generating' ? 'bg-violet-600/70 text-white cursor-wait'
                                : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
                            {status === 'generating' ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generando con IA...</>
                            ) : (
                                <><SparkleIcon />Generar con IA</>
                            )}
                        </button>
                    </div>

                </div>

                {/* Right — Estrategia Generada */}
                <div className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                                <CodeIcon />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white">Estrategia Generada</span>
                                <div className="mt-0.5">
                                    <span className="text-[9px] font-bold tracking-widest text-violet-400 uppercase">
                                        Optimizado para flujo cognitivo
                                    </span>
                                </div>
                            </div>
                        </div>
                        {planMostrado && (
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => navigate('/pomodoro', { state: { plan: planMostrado, openConfig: true } })}
                                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all active:scale-95"
                                    title="Iniciar sesión de enfoque con este plan"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 2L4.09 12.26a1 1 0 0 0 .91 1.64L11 13l-2 9 8.91-10.26a1 1 0 0 0-.91-1.64L11 11l2-9z"/>
                                    </svg>
                                    Iniciar
                                </button>
                                <button onClick={() => handleEliminar(planMostrado.id)}
                                    className="w-8 h-8 rounded-lg border border-neutral-800 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors"
                                    title="Eliminar plan">
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">

                        {status === 'idle' && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-800/60 border border-neutral-700 flex items-center justify-center text-neutral-600">
                                    <SparkleIcon />
                                </div>
                                <p className="text-neutral-600 text-sm">Ingresa una materia y genera tu plan personalizado.</p>
                            </div>
                        )}

                        {status === 'generating' && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                                <div className="flex gap-1.5">
                                    {[0,1,2,3].map(i => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }}/>
                                    ))}
                                </div>
                                <p className="text-neutral-500 text-xs tracking-widest uppercase">Groq · Llama 3.3 70B procesando...</p>
                            </div>
                        )}

                        {status === 'generated' && planMostrado && (
                            <>
                                {/* Info del plan */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${TAG_COLORS[planMostrado.estado]} text-white`}>
                                        {TAG_LABELS[planMostrado.estado]}
                                    </span>
                                    <span className="text-[10px] text-neutral-600 font-mono">
                                        {getPlanProgress(planMostrado)}% completado
                                    </span>
                                    <span className="text-[10px] text-neutral-600">
                                        {planMostrado.totalValidaciones} validaciones · ratio {Math.round((planMostrado.ratioValidaciones ?? 0) * 100)}%
                                    </span>
                                </div>

                                {/* Módulos */}
                                {planMostrado.modulos?.map((modulo, mi) => (
                                    <div key={modulo.id} className={`bg-[#0d0d0d] border rounded-xl p-5 ${mi === 0 ? 'border-neutral-800/60' : 'border-neutral-800/40 opacity-80'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${mi === 0 ? 'text-violet-400 bg-violet-500/10 border border-violet-500/20' : 'text-neutral-600'}`}>
                                                Módulo {String(modulo.orden).padStart(2,'0')}: {modulo.titulo}
                                            </span>
                                            <span className="text-[11px] font-mono text-neutral-600">
                                                {modulo.temas?.reduce((s, t) => s + t.pomodorosEstimados, 0) * 25} min est.
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {modulo.temas?.map(tema => (
                                                <label key={tema.id} className="flex items-start gap-3 cursor-pointer group">
                                                    <button onClick={() => handleToggleTema(tema.id)}
                                                        className={`w-4 h-4 mt-0.5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                            tema.completado ? 'bg-violet-600 border-violet-600' : 'border-neutral-700 hover:border-violet-600/50'}`}>
                                                        {tema.completado && (
                                                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                                <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <div className="flex-1">
                                                        <span className={`text-sm leading-relaxed transition-colors ${tema.completado ? 'text-neutral-600 line-through' : 'text-neutral-300 group-hover:text-white'}`}>
                                                            {tema.titulo}
                                                        </span>
                                                        <span className="ml-2 text-[10px] text-neutral-700 font-mono">
                                                            {tema.pomodorosEstimados}🍅
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Índice de retención */}
                                <div className="bg-[#0d0d0d] border border-neutral-800/60 rounded-xl p-5 flex items-center gap-6">
                                    {retentionIndex === null ? (
                                        <div className="w-14 h-8 bg-neutral-800/60 rounded animate-pulse flex-shrink-0"/>
                                    ) : (
                                        <span className="text-4xl font-black text-violet-400 leading-none flex-shrink-0">
                                            {retentionIndex}%
                                        </span>
                                    )}
                                    <div className="w-px h-10 bg-neutral-800 flex-shrink-0"/>
                                    <div>
                                        <p className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase mb-1">Índice de Retención</p>
                                        <p className="text-xs text-neutral-500 leading-relaxed">
                                            Diseñado para consolidación óptima de memoria a través de rutas de aprendizaje recursivas.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mis Planes */}
            {misPlanes.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Mis Planes</h2>
                            <p className="text-neutral-500 text-sm mt-1">Planes generados y guardados por ti.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {misPlanes.map((plan, idx) => (
                            <div
                                key={plan.id}
                                onClick={() => { setPlanSeleccionado(plan); setStatus('generated'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className={`group cursor-pointer text-left bg-[#111111] border rounded-xl overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-0.5 ${
                                    planMostrado?.id === plan.id ? 'border-violet-500/40' : 'border-neutral-800/60'
                                }`}
                            >
                                <div className={`h-36 bg-gradient-to-b ${CARD_PALETTE[idx % CARD_PALETTE.length]} to-neutral-900 relative flex items-end p-3`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                    <div className="relative z-10 flex items-center gap-1.5">
                                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${TAG_COLORS[plan.estado] ?? 'bg-neutral-700'} text-white`}>
                                            {TAG_LABELS[plan.estado] ?? plan.estado}
                                        </span>
                                        {getPlanProgress(plan) === 100 && (
                                            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500 text-white">
                                                ✓ Completado
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors leading-tight line-clamp-2">
                                        {plan.titulo}
                                    </h4>
                                    <span className="text-[10px] text-neutral-600">
                                        {plan.modulos?.length ?? 0} Módulos
                                        <span className="mx-1.5 text-neutral-800">•</span>
                                        {getPlanProgress(plan)}% completado
                                    </span>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={e => { e.stopPropagation(); handleEliminar(plan.id); }}
                                            className="text-neutral-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Eliminar plan"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            </div>
        </div>
    );
}
