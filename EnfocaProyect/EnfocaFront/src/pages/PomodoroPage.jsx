import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MainTimerCard from '../components/timer/MainTimerCard';
import { planService } from '../services/api';

const IconChevron = ({ open }) => (
    <svg
        className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

function ModuleItem({ modulo, onToggle }) {
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
                    <p className={`text-sm truncate leading-tight transition-colors ${
                        allDone ? 'text-neutral-600 line-through' : 'text-neutral-300 group-hover:text-white'
                    }`}>
                        {modulo.titulo}
                    </p>
                </div>
                <span className="text-xs text-neutral-600 font-mono flex-shrink-0 ml-1">
                    {completed}/{total}
                </span>
            </button>

            {expanded && (
                <div className="pl-5 pb-1.5 flex flex-col gap-0.5 border-l border-neutral-800 ml-1.5 mt-0.5">
                    {modulo.temas?.map(tema => {
                        return (
                            <button
                                key={tema.id}
                                onClick={() => onToggle(tema.id)}
                                className="flex items-start gap-1.5 py-1 px-1.5 rounded hover:bg-neutral-800/50 transition-colors text-left w-full group/t"
                                title={tema.completado ? 'Desmarcar' : 'Marcar como completado'}
                            >
                                <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-neutral-800 group-hover/t:bg-neutral-600 transition-colors" />
                                <span className={`text-xs leading-relaxed select-none transition-all ${
                                    tema.completado
                                        ? 'text-violet-400/60 underline decoration-violet-500/50 decoration-1 underline-offset-2'
                                        : 'text-neutral-500 group-hover/t:text-neutral-300'
                                }`}>
                                    {tema.titulo}
                                </span>
                            </button>
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

    const [plan, setPlan]             = useState(location.state?.plan ?? null);
    const [sesionCompleta, setSesionCompleta] = useState(false);

    const toggleTopic = async (temaId) => {
        try {
            const { data: temaActualizado } = await planService.toggleTema(temaId);
            setPlan(prev => ({
                ...prev,
                modulos: prev.modulos.map(m => ({
                    ...m,
                    temas: m.temas.map(t =>
                        t.id === temaId ? { ...t, completado: temaActualizado.completado, completadoEn: temaActualizado.completadoEn } : t
                    ),
                })),
            }));
        } catch {
            // si falla la red, toggle local como fallback
            setPlan(prev => ({
                ...prev,
                modulos: prev.modulos.map(m => ({
                    ...m,
                    temas: m.temas.map(t =>
                        t.id === temaId ? { ...t, completado: !t.completado } : t
                    ),
                })),
            }));
        }
    };

    const totalTopics     = plan?.modulos?.reduce((acc, m) => acc + (m.temas?.length ?? 0), 0) ?? 0;
    const completedTopics = plan?.modulos?.reduce((acc, m) => acc + (m.temas?.filter(t => t.completado).length ?? 0), 0) ?? 0;
    const planProgress    = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <MainLayout>
            <div className="h-full flex flex-col text-white font-sans selection:bg-violet-500/30">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4">
                    <h1 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                        Active_Terminal
                    </h1>
                    <div className="hidden md:flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span className="text-violet-400 cursor-pointer">Focus_Session</span>
                    </div>
                </div>

                {/* Grilla principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-grow">

                    {/* Columna izquierda */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        <MainTimerCard
                            autoOpenConfig={autoOpenConfig}
                            onComplete={() => setSesionCompleta(true)}
                        />

                        {sesionCompleta && (
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span className="text-sm text-emerald-400 font-semibold">¡Sesión completada!</span>
                            </div>
                        )}

                    </div>

                    {/* Columna derecha — Plan de estudio */}
                    <div className="lg:col-span-4 flex flex-col gap-5 self-stretch">

                        {/* Panel de temario */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col flex-grow lg:h-0 lg:min-h-0 overflow-hidden">

                            {plan ? (
                                <>
                                    {/* Cabecera */}
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

                                    {/* Lista de módulos */}
                                    <div className="flex-grow overflow-y-auto pr-0.5 min-h-0 flex flex-col gap-0.5">
                                        {plan.modulos?.map(modulo => (
                                            <ModuleItem
                                                key={modulo.id}
                                                modulo={modulo}
                                                onToggle={toggleTopic}
                                            />
                                        ))}
                                    </div>

                                    {/* Barra de progreso del plan */}
                                    <div className="mt-3 flex-shrink-0 border-t border-neutral-800/60 pt-3">
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
                                </>
                            ) : (
                                <>
                                    {/* Sin plan — placeholder original */}
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
                                            <div className="w-3.5 h-3.5 rounded border border-violet-500 bg-violet-500/20 mt-0.5"></div>
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
            </div>
        </MainLayout>
    );
}
