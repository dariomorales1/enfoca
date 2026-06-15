import { useAuth } from '../contexts/AuthContext.jsx';
import { useGamification } from '../hooks/useGamification.jsx';
import { useMetrics } from '../hooks/useMetrics';
import { usePlanes } from '../hooks/usePlanes';
import StatCard from '../components/dashboard/StatCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import CurriculumCard from '../components/dashboard/CurriculumCard';
import GamificationPanel from '../components/dashboard/GamificationPanel';

// (Iconos se mantienen intactos)
const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IconTarget = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
    </svg>
);
const IconStar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);
const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IconFire = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
);
const IconBook = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
);

const Skeleton = ({ className }) => (
    <div className={`bg-neutral-800/60 rounded animate-pulse ${className}`} />
);

const StatCardSkeleton = () => (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 flex flex-col gap-3">
        {/* Cambié anchos fijos por porcentajes/w-full para que no se deformen en móvil */}
        <Skeleton className="h-3 w-[40%]" />
        <Skeleton className="h-7 w-[30%]" />
        <Skeleton className="h-3 w-[20%]" />
    </div>
);

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

const ACCENTS = ['violet', 'emerald', 'amber'];

function accentFromIndex(i) {
    return ACCENTS[i % ACCENTS.length];
}

const calcularEficiencia = (plan) => {
    if (!plan?.modulos) return plan?.progreso?.porcentaje ?? 0;
    const total = plan.modulos.reduce((acc, m) => acc + (m.temas?.length ?? 0), 0);
    if (total === 0) return 0;
    const done = plan.modulos.reduce((acc, m) => acc + (m.temas?.filter(t => t.completado).length ?? 0), 0);
    return Math.round((done / total) * 100);
};

const CURRICULUM_FALLBACK = [
    { code: 'MTH-402', title: 'Integración Multivariable',    efficiency: 75.0, topic: 'Integrales triples en coordenadas esféricas y campos vectoriales.',        accent: 'violet',  icon: <IconBook /> },
    { code: 'BIO-612', title: 'Edición Génica CRISPR',        efficiency: 42.8, topic: 'Análisis de secuenciación molecular CAS9 y unión a objetivos.',             accent: 'emerald', icon: <IconBook /> },
    { code: 'HIS-101', title: 'Revolución Industrial',        efficiency: 88.2, topic: 'Cambio socioeconómico y mecanización en la Europa del siglo XIX.',          accent: 'amber',   icon: <IconBook /> },
];

export default function DashboardPage() {
    const { perfil,  loading: loadingGam }     = useGamification();
    const { summary, loading: loadingMetrics } = useMetrics();
    const { planes,  loading: loadingPlanes }  = usePlanes();

    const horasEnfocadas = summary?.focusedMinutesTotal != null
        ? (summary.focusedMinutesTotal / 60).toFixed(1)
        : null;
    const tasaRetencion = summary?.retentionRate ?? null;
    const rachaActiva   = summary?.currentStreak ?? null;

    const curriculumItems = planes.length > 0
        ? planes.slice(0, 3).map((p, i) => ({
            code:       p.id ? p.id.toString().slice(-6).toUpperCase() : String(i + 1).padStart(3, '0'),
            title:      p.titulo ?? 'Plan sin título',
            efficiency: calcularEficiencia(p),
            topic:      p.objetivo ?? p.nivel ?? '',
            accent:     accentFromIndex(i),
            icon:       <IconBook />,
        }))
        : CURRICULUM_FALLBACK;

    return (
        // Quitamos p-4 md:p-6 porque MainLayout y DashboardLayout ya manejan los paddings.
        // Aumentamos los gaps para que las secciones respiren al apilarse en móvil.
        <div className="flex flex-col gap-6 sm:gap-8 w-full">

            {/* StatCards */}
            {/* Flujo: 1 col (móvil) -> 2 cols (sm) -> 3 cols (lg) -> 5 cols (xl) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                {loadingMetrics || loadingGam ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Horas Enfocadas"
                            value={horasEnfocadas ?? '—'}
                            unit={horasEnfocadas != null ? 'HRS' : undefined}
                            badge={summary?.focusedMinutesWeek != null ? `${(summary.focusedMinutesWeek / 60).toFixed(1)}h semana` : undefined}
                            badgeColor="green"
                            icon={<IconClock />}
                            accent="text-violet-400"
                        />
                        <StatCard
                            label="XP Trabajo Profundo"
                            value={perfil ? perfil.xpTotal.toLocaleString('es-CL') : '—'}
                            badge={perfil ? `NIV ${perfil.nivel}` : undefined}
                            badgeColor="neutral"
                            icon={<IconTarget />}
                            accent="text-violet-400"
                        />
                        <StatCard
                            label="Sesiones Hoy"
                            value={summary?.sessionsToday ?? '—'}
                            unit={summary?.sessionsToday != null ? 'HOY' : undefined}
                            badge={summary?.focusedMinutesToday != null ? `${summary.focusedMinutesToday} min` : undefined}
                            badgeColor="neutral"
                            icon={<IconStar />}
                            accent="text-yellow-400"
                        />
                        <StatCard
                            label="Tasa de Retención"
                            value={tasaRetencion != null ? tasaRetencion.toFixed(1) : '—'}
                            unit={tasaRetencion != null ? '%' : undefined}
                            icon={<IconShield />}
                            accent="text-emerald-400"
                        />
                        <StatCard
                            label="Racha Activa"
                            value={rachaActiva ?? '—'}
                            unit={rachaActiva != null ? 'DÍAS' : undefined}
                            badge={summary?.longestStreak != null ? `Récord: ${summary.longestStreak}d` : undefined}
                            icon={<IconFire />}
                            accent="text-orange-400"
                        />
                    </>
                )}
            </div>

            {/* WeeklyChart + GamificationPanel */}
            {/* En móvil se apilan 100%, en escritorio dividen el espacio */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 sm:gap-6">
                <WeeklyChart />
                <GamificationPanel />
            </div>

            {/* Currículo Activo */}
            <div>
                <div className="mb-4">
                    <h2 className="text-sm font-bold tracking-widest text-white uppercase">Currículo Activo</h2>
                    <p className="text-xs text-neutral-500 tracking-wider mt-0.5">
                        Planes de estudio principales y progreso modular
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {loadingPlanes ? (
                        <>
                            <CurriculumCardSkeleton />
                            <CurriculumCardSkeleton />
                            <CurriculumCardSkeleton />
                        </>
                    ) : (
                        curriculumItems.map((c) => (
                            <CurriculumCard key={c.code} {...c} />
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}