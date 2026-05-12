import { useState, useEffect } from 'react';
import { planService } from '../services/api';

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
    ACTIVO: 'bg-emerald-600',
    EN_REVISION: 'bg-amber-600',
    CONGELADO: 'bg-violet-600',
    EN_MEJORA: 'bg-blue-600',
};

const TAG_LABELS = {
    ACTIVO: 'Activo',
    EN_REVISION: 'En revisión',
    CONGELADO: 'Congelado',
    EN_MEJORA: 'En mejora',
};

const SparkleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
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
const UserIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const AUTORES_MOCK = ['Alex M.', 'Sarah K.', 'David L.', 'María R.'];
const BG_MOCK = ['from-amber-900/40', 'from-blue-900/40', 'from-emerald-900/40', 'from-orange-900/40'];

export default function StudyPlanPage() {
    const [materia, setMateria] = useState('');
    const [tiempo, setTiempo] = useState('10 horas');
    const [objetivo, setObjetivo] = useState('');
    const [nivel, setNivel] = useState('BASICO');
    const [status, setStatus] = useState('idle');
    const [planActual, setPlanActual] = useState(null);
    const [error, setError] = useState('');
    const [misPlanes, setMisPlanes] = useState([]);
    const [catalogo, setCatalogo] = useState([]);
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        planService.listar().then(r => setMisPlanes(r.data)).catch(() => {});
        planService.catalogo().then(r => setCatalogo(r.data)).catch(() => {});
    }, []);

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

    const handleGuardar = () => {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
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
        <div className="p-4 md:p-6 flex flex-col gap-8">

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

                    {/* Mis planes guardados */}
                    {misPlanes.length > 0 && (
                        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Mis planes</span>
                            {misPlanes.map(plan => (
                                <button key={plan.id} onClick={() => { setPlanSeleccionado(plan); setStatus('generated'); }}
                                    className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-colors group ${
                                        planMostrado?.id === plan.id ? 'bg-violet-600/15 border border-violet-500/30' : 'hover:bg-neutral-800/50 border border-transparent'}`}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">{plan.titulo}</p>
                                        <span className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded ${TAG_COLORS[plan.estado]} text-white mt-0.5 inline-block`}>
                                            {TAG_LABELS[plan.estado]}
                                        </span>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); handleEliminar(plan.id); }}
                                        className="text-neutral-700 hover:text-red-400 transition-colors ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100">
                                        <TrashIcon />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}
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
                            <div className="flex gap-2">
                                <button onClick={() => handleEliminar(planMostrado.id)}
                                    className="w-8 h-8 rounded-lg border border-neutral-800 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors">
                                    <TrashIcon />
                                </button>
                                <button
                                    onClick={handleGuardar}
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                                        guardado
                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                            : 'border-neutral-800 hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                                    }`}
                                    title={guardado ? '¡Plan guardado!' : 'Guardar plan'}
                                >
                                    {guardado ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    ) : (
                                        <SaveIcon />
                                    )}
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
                                        {planMostrado.progreso?.porcentaje ?? 0}% completado
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
                                    <span className="text-4xl font-black text-violet-400 leading-none flex-shrink-0">
                                        {Math.round((planMostrado.ratioValidaciones ?? 0) * 100) || 84}%
                                    </span>
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

            {/* Biblioteca Comunitaria */}
            <div>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Biblioteca Comunitaria</h2>
                        <p className="text-neutral-500 text-sm mt-1">Blueprints curados por IA desde la colectividad.</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                        Ver catálogo
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </button>
                </div>

                {catalogo.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {catalogo.map((plan, i) => (
                            <button key={plan.id} onClick={() => { setPlanSeleccionado(plan); setStatus('generated'); }}
                                className="group text-left bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-0.5">
                                <div className={`h-40 bg-gradient-to-b ${BG_MOCK[i % BG_MOCK.length]} to-neutral-900 relative flex items-end p-3`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                    <span className="relative z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-violet-600 text-white">
                                        CONGELADO
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors leading-tight">{plan.titulo}</h4>
                                    <span className="text-[10px] text-neutral-600">
                                        {plan.modulos?.length ?? 0} Módulos
                                        <span className="mx-1.5 text-neutral-800">•</span>
                                        <span className="text-amber-500/80">★</span> {Math.round((plan.ratioValidaciones ?? 0) * 50) / 10}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                                            <UserIcon />
                                        </div>
                                        <span className="text-[11px] text-neutral-500">{AUTORES_MOCK[i % AUTORES_MOCK.length]}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { tag: 'ALTA DENSIDAD', titulo: 'Dominio del Cálculo III', modulos: 12, rating: 4.9, bg: 'from-amber-900/40' },
                            { tag: 'EXPLORATORIO', titulo: 'Psicología Cognitiva 101', modulos: 8, rating: 4.7, bg: 'from-blue-900/40' },
                            { tag: 'VÍA RÁPIDA', titulo: 'Estructuras de Datos', modulos: 15, rating: 4.8, bg: 'from-emerald-900/40' },
                            { tag: 'COMPRENSIVO', titulo: 'Estática Arquitectónica', modulos: 20, rating: 5.0, bg: 'from-orange-900/40' },
                        ].map((p, i) => (
                            <div key={p.titulo} className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden opacity-60">
                                <div className={`h-40 bg-gradient-to-b ${p.bg} to-neutral-900 relative flex items-end p-3`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                    <span className="relative z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">{p.tag}</span>
                                </div>
                                <div className="p-4 flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold text-neutral-400">{p.titulo}</h4>
                                    <span className="text-[10px] text-neutral-700">{p.modulos} Módulos · ★ {p.rating}</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600"><UserIcon /></div>
                                        <span className="text-[11px] text-neutral-700">{AUTORES_MOCK[i]}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="mt-2 pt-5 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-neutral-700 rounded flex items-center justify-center">
                        <span className="text-[8px] font-black text-neutral-500">E</span>
                    </div>
                    <span className="text-[10px] tracking-widest text-neutral-600 uppercase font-semibold">Enfoca OS</span>
                </div>
                <div className="flex items-center gap-6">
                    {['Privacidad', 'Términos', 'Recursos', 'Colectivo'].map(link => (
                        <button key={link} className="text-[10px] tracking-widest text-neutral-700 hover:text-neutral-500 uppercase transition-colors">{link}</button>
                    ))}
                </div>
                <span className="text-[10px] text-neutral-800 font-mono">v2.4.0-ESTABLE // BUILD_200431</span>
            </footer>
        </div>
    );
}
