import { useContext } from 'react';
import { useGamification } from '../hooks/useGamification.jsx';
import { useMetrics } from '../hooks/useMetrics';
import { usePlanes } from '../hooks/usePlanes';
import { AuthContext } from '../contexts/AuthContext';

import StatCard from '../components/dashboard/StatCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import FocusEngine from '../components/dashboard/FocusEngine';
import CurriculumCard from '../components/dashboard/CurriculumCard';
import GamificationPanel from '../components/dashboard/GamificationPanel';

// ── Iconos ────────────────────────────────────────────────────────────────────
const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
    </svg>
);
const IconTarget = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);
const IconLayers = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
);
const IconBolt = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

// ── Skeleton genérico ─────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`bg-neutral-800/60 rounded animate-pulse ${className}`} />
);

// ── Skeleton de StatCard ──────────────────────────────────────────────────────
const StatCardSkeleton = () => (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-10" />
    </div>
);

// ── Skeleton de CurriculumCard ────────────────────────────────────────────────
const CurriculumCardSkeleton = () => (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 flex flex-col gap-3 animate-pulse">
        <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtHoras(minutos) {
    if (minutos == null) return '—';
    const h = minutos / 60;
    return h % 1 === 0 ? String(h) : h.toFixed(1);
}

function accentFromIndex(i) {
    const NIVEL_ACCENT = { BASICO: 'emerald', INTERMEDIO: 'amber', AVANZADO: 'violet' };
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardPage() {
    const { user } = useContext(AuthContext);

    // Datos reales desde hooks
    const { perfil, loading: loadingGam }         = useGamification();
    const { summary, loading: loadingMetrics }     = useMetrics();
    const { planes, loading: loadingPlanes }       = usePlanes();
    const NIVEL_ACCENT = { BASICO: 'emerald', INTERMEDIO: 'amber', AVANZADO: 'violet' };
    return (
        <div className="p-4 md:p-6 flex flex-col gap-5">

            {/* ── Métricas ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {loadingMetrics ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Horas Enfocadas"
                            value={fmtHoras(summary?.minutosTotales)}
                            badge={summary?.variacionSemanal != null
                                ? `${summary.variacionSemanal > 0 ? '+' : ''}${summary.variacionSemanal}%`
                                : null}
                            badgeColor="green"
                            icon={<IconClock />}
                        />
                        <StatCard
                            label="XP Trabajo Profundo"
                            value={perfil
                                ? perfil.xpTotal.toLocaleString('es-CL')
                                : '—'}
                            badge={perfil ? `NIV ${perfil.nivel}` : '...'}
                            badgeColor="neutral"
                            icon={<IconTarget />}
                        />
                        <StatCard
                            label="Tasa de Retención"
                            value={summary?.tasaRetencion ?? '—'}
                            unit="%"
                            icon={<IconLayers />}
                        />
                        <StatCard
                            label="Racha Activa"
                            value={summary?.rachaDias ?? '—'}
                            unit="DÍAS"
                            icon={<IconBolt />}
                            accent="text-amber-400"
                        />
                    </>
                )}
            </div>

            {/* ── Gráfico + Motor + Gamificación ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <WeeklyChart />
                <div className="flex flex-col gap-4">
                    <FocusEngine />
                    <GamificationPanel />
                </div>
            </div>

            {/* ── Currículo activo ──────────────────────────────────────── */}
            <div>
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-xs font-bold tracking-widest text-white uppercase">
                            Currículo Activo
                        </h2>
                        <p className="text-[10px] text-neutral-600 tracking-wider mt-0.5">
                            Planes de estudio principales y progreso modular
                        </p>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-semibold text-violet-400 hover:text-violet-300 tracking-wider uppercase transition-colors">
                        Ver Registro
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadingPlanes ? (
                        <>
                            <CurriculumCardSkeleton />
                            <CurriculumCardSkeleton />
                            <CurriculumCardSkeleton />
                        </>
                    ) : planes.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="9" x2="15" y2="9" />
                                <line x1="9" y1="12" x2="15" y2="12" />
                                <line x1="9" y1="15" x2="12" y2="15" />
                            </svg>
                            <p className="text-xs text-neutral-600 tracking-wide">
                                Sin planes activos
                            </p>
                            <p className="text-[10px] text-neutral-700 max-w-[28ch]">
                                Crea tu primer plan de estudio para ver tu progreso aquí.
                            </p>
                        </div>
                    ) : (
                        planes.slice(0, 6).map((plan, i) => (
                            <CurriculumCard
                                key={plan.id}
                                code={`${plan.nivel?.slice(0, 3) ?? 'PLN'}-${String(plan.id).slice(-4).toUpperCase()}`}
                                title={plan.titulo}
                                efficiency={plan.progreso?.porcentaje ?? Math.round(plan.ratioValidaciones * 100)}
                                topic={plan.objetivo}
                                accent={accentFromIndex(i)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <footer className="mt-2 pt-5 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-neutral-700 rounded flex items-center justify-center">
                        <span className="text-[8px] font-black text-neutral-500">E</span>
                    </div>
                    <span className="text-[10px] tracking-widest text-neutral-600 uppercase font-semibold">
                        Enfoca OS
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    {['Manifiesto', 'Arquitectura', 'Nodos'].map((link) => (
                        <button key={link}
                                className="text-[10px] tracking-widest text-neutral-700 hover:text-neutral-500 uppercase transition-colors">
                            {link}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] text-neutral-800 font-mono">
                    v2.4.0-ESTABLE // {user?.id ? `UID_${user.id}` : 'BUILD_200431'}
                </span>
            </footer>
        </div>
    );
}