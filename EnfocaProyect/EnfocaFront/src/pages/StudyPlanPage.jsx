import { useState } from 'react';

const TIME_OPTIONS = [
    { value: '2h', label: '2 Horas (Liviano)' },
    { value: '5h', label: '5 Horas (Moderado)' },
    { value: '10h', label: '10 Horas (Intensivo)' },
    { value: '20h', label: '20+ Horas (Profundo)' },
];

const COMMUNITY_PLANS = [
    {
        tag: 'ALTA DENSIDAD',
        tagColor: 'bg-violet-600',
        title: 'Dominio del Cálculo III',
        modules: 12,
        rating: 4.9,
        author: 'Alex M.',
        bg: 'from-amber-900/40 to-neutral-900',
    },
    {
        tag: 'EXPLORATORIO',
        tagColor: 'bg-blue-600',
        title: 'Psicología Cognitiva 101',
        modules: 8,
        rating: 4.7,
        author: 'Sarah K.',
        bg: 'from-blue-900/40 to-neutral-900',
    },
    {
        tag: 'VÍA RÁPIDA',
        tagColor: 'bg-emerald-600',
        title: 'Estructuras de Datos',
        modules: 15,
        rating: 4.8,
        author: 'David L.',
        bg: 'from-emerald-900/40 to-neutral-900',
    },
    {
        tag: 'COMPRENSIVO',
        tagColor: 'bg-amber-600',
        title: 'Estática Arquitectónica',
        modules: 20,
        rating: 5.0,
        author: 'María R.',
        bg: 'from-orange-900/40 to-neutral-900',
    },
];

const INITIAL_TASKS = [
    { id: 1, text: 'Revisar el contexto histórico de los modelos clave', done: true },
    { id: 2, text: 'Identificar variables primarias y coeficientes', done: false },
    { id: 3, text: 'Construir representaciones diagramáticas preliminares', done: false },
];

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
const ShareIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
);
const UserIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);
const CodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
    </svg>
);
const ChevronIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

export default function StudyPlanPage() {
    const [subject, setSubject] = useState('');
    const [time, setTime] = useState('10h');
    const [goal, setGoal] = useState('');
    const [status, setStatus] = useState('idle');
    const [tasks, setTasks] = useState(INITIAL_TASKS);

    const handleGenerate = () => {
        if (!subject.trim()) return;
        setStatus('generating');
        setTimeout(() => setStatus('generated'), 2800);
    };

    const toggleTask = (id) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    };

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

                {/* Left — Parameters */}
                <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-6 flex flex-col gap-5 h-fit">
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

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-400">Materia o Área</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="ej. Macroeconomía Avanzada"
                            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 transition-colors"
                        />
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-400">Tiempo Total Disponible</label>
                        <div className="relative">
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full appearance-none bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors cursor-pointer pr-8"
                            >
                                {TIME_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
                                <ChevronIcon />
                            </span>
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-400">Objetivo Principal</label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Define tus objetivos de aprendizaje..."
                            rows={4}
                            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!subject.trim() || status === 'generating'}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all active:scale-[0.98] ${
                            !subject.trim()
                                ? 'bg-violet-600/30 text-violet-400/50 cursor-not-allowed'
                                : status === 'generating'
                                ? 'bg-violet-600/70 text-white cursor-wait'
                                : 'bg-violet-600 hover:bg-violet-500 text-white'
                        }`}
                    >
                        {status === 'generating' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                Generando...
                            </>
                        ) : (
                            <>
                                <SparkleIcon />
                                Generar con IA
                            </>
                        )}
                    </button>
                </div>

                {/* Right — Generated Strategy */}
                <div className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden flex flex-col">

                    {/* Strategy header */}
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
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors">
                                <SaveIcon />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors">
                                <ShareIcon />
                            </button>
                        </div>
                    </div>

                    {/* Strategy content */}
                    <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">

                        {/* Idle state */}
                        {status === 'idle' && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-800/60 border border-neutral-700 flex items-center justify-center text-neutral-600">
                                    <SparkleIcon />
                                </div>
                                <p className="text-neutral-600 text-sm">Ingresa una materia y genera tu plan personalizado.</p>
                            </div>
                        )}

                        {/* Generating state */}
                        {status === 'generating' && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-neutral-500 text-xs tracking-widest uppercase">Procesando con IA...</p>
                            </div>
                        )}

                        {/* Generated state */}
                        {status === 'generated' && (
                            <>
                                {/* Module 01 */}
                                <div className="bg-[#0d0d0d] border border-neutral-800/60 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded uppercase">
                                            Módulo 01: Fundamentos
                                        </span>
                                        <span className="text-[11px] font-mono text-neutral-500">03:00 EST</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-4">
                                        Teorías Base y Suposiciones
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        {tasks.map((task) => (
                                            <label
                                                key={task.id}
                                                className="flex items-start gap-3 cursor-pointer group"
                                            >
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`w-4 h-4 mt-0.5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        task.done
                                                            ? 'bg-violet-600 border-violet-600'
                                                            : 'border-neutral-700 hover:border-violet-600/50'
                                                    }`}
                                                >
                                                    {task.done && (
                                                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                    )}
                                                </button>
                                                <span className={`text-sm leading-relaxed transition-colors ${
                                                    task.done ? 'text-neutral-600 line-through' : 'text-neutral-300 group-hover:text-white'
                                                }`}>
                                                    {task.text}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Module 02 — pending */}
                                <div className="bg-[#0d0d0d] border border-neutral-800/40 rounded-xl p-5 opacity-60">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                                            Módulo 02: Síntesis
                                        </span>
                                        <span className="text-[11px] font-mono text-neutral-700 italic">Generación pendiente...</span>
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-600 mb-2">
                                        Aplicación Matemática Avanzada
                                    </h3>
                                    <p className="text-xs text-neutral-700 italic">
                                        Define parámetros para generar los próximos pasos.
                                    </p>
                                </div>

                                {/* Retention index */}
                                <div className="bg-[#0d0d0d] border border-neutral-800/60 rounded-xl p-5 flex items-center gap-6">
                                    <span className="text-4xl font-black text-violet-400 leading-none flex-shrink-0">84%</span>
                                    <div className="w-px h-10 bg-neutral-800 flex-shrink-0"/>
                                    <div>
                                        <p className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase mb-1">
                                            Índice de Retención
                                        </p>
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

            {/* Community Library */}
            <div>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Biblioteca Comunitaria</h2>
                        <p className="text-neutral-500 text-sm mt-1">Blueprints curados por IA desde la colectividad.</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                        Ver catálogo
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COMMUNITY_PLANS.map((plan) => (
                        <button
                            key={plan.title}
                            className="group text-left bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-0.5"
                        >
                            {/* Card image area */}
                            <div className={`h-40 bg-gradient-to-b ${plan.bg} relative overflow-hidden flex items-end p-3`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                <span className={`relative z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${plan.tagColor} text-white`}>
                                    {plan.tag}
                                </span>
                            </div>

                            {/* Card info */}
                            <div className="p-4 flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors leading-tight">
                                    {plan.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-600">
                                        {plan.modules} Módulos
                                        <span className="mx-1.5 text-neutral-800">•</span>
                                        <span className="text-amber-500/80">★</span> {plan.rating}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                                        <UserIcon />
                                    </div>
                                    <span className="text-[11px] text-neutral-500">{plan.author}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-2 pt-5 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-neutral-700 rounded flex items-center justify-center">
                        <span className="text-[8px] font-black text-neutral-500">E</span>
                    </div>
                    <span className="text-[10px] tracking-widest text-neutral-600 uppercase font-semibold">Enfoca OS</span>
                </div>
                <div className="flex items-center gap-6">
                    {['Privacidad', 'Términos', 'Recursos', 'Colectivo'].map((link) => (
                        <button key={link} className="text-[10px] tracking-widest text-neutral-700 hover:text-neutral-500 uppercase transition-colors">
                            {link}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] text-neutral-800 font-mono">v2.4.0-ESTABLE // BUILD_200431</span>
            </footer>
        </div>
    );
}
