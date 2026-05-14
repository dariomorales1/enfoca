import { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import CurriculumCard from '../components/dashboard/CurriculumCard';
import Sidebar from '../components/common/Sidebar';
import { metricsService, planService } from '../services/api';

const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
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
const IconMicroscope = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 18h8"/><path d="M3 21h18"/>
        <path d="M14 21v-4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"/>
        <path d="M14 7l2-2-5-5-2 2"/>
        <path d="M9 12l5-5"/>
        <path d="M13 7l4 4-3.5 3.5"/>
        <circle cx="8.5" cy="15.5" r=".5" fill="currentColor"/>
    </svg>
);
const IconHistory = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <line x1="3.05" y1="9" x2="20.95" y2="9"/><line x1="3.05" y1="15" x2="20.95" y2="15"/>
        <path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18"/>
    </svg>
);


const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

function mapearDatosSemana(rawDias) {
    if (!rawDias?.length) return null;
    const hoy     = new Date().getDay();
    const indicHoy = hoy === 0 ? 6 : hoy - 1;
    const semana  = DIAS.map((day, i) => ({ day, cycles: 0, current: i === indicHoy }));
    rawDias.forEach(item => {
        const fecha   = new Date(item.date + 'T00:00:00');
        const diaSem  = fecha.getDay();
        const indice  = diaSem === 0 ? 6 : diaSem - 1;
        semana[indice].cycles = item.sessionsCount ?? 0;
    });
    return semana;
}

const calcularEficiencia = (plan) => {
    if (!plan?.modulos) return plan?.progreso?.porcentaje ?? 0;
    const total = plan.modulos.reduce((acc, m) => acc + (m.temas?.length ?? 0), 0);
    if (total === 0) return 0;
    const done = plan.modulos.reduce((acc, m) => acc + (m.temas?.filter(t => t.completado).length ?? 0), 0);
    return Math.round((done / total) * 100);
};

export default function DashboardPage() {
    const [resumen, setResumen] = useState(null);
    const [datosSemana, setDatosSemana] = useState(null);
    const [planes, setPlanes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resSummary, resDias, resPlanes] = await Promise.allSettled([
                    metricsService.getSummary(),
                    metricsService.getLast7Days(),
                    planService.listar(),
                ]);

                if (resSummary.status === 'fulfilled') setResumen(resSummary.value.data);
                if (resDias.status === 'fulfilled') {
                    const mapeado = mapearDatosSemana(resDias.value.data);
                    if (mapeado) setDatosSemana(mapeado);
                }
                if (resPlanes.status === 'fulfilled') setPlanes(resPlanes.value.data ?? []);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    const CURRICULUM_FALLBACK = [
        {
            code: 'MTH-402',
            title: 'Integración Multivariable',
            efficiency: 75.0,
            topic: 'Tema: Integrales triples en coordenadas esféricas y campos vectoriales.',
            accent: 'violet',
            icon: <IconBook />,
        },
        {
            code: 'BIO-612',
            title: 'Edición Génica CRISPR',
            efficiency: 42.8,
            topic: 'Tema: Análisis de secuenciación molecular CAS9 y unión a objetivos.',
            accent: 'emerald',
            icon: <IconMicroscope />,
        },
        {
            code: 'HIS-101',
            title: 'Revolución Industrial',
            efficiency: 88.2,
            topic: 'Tema: Cambio socioeconómico y mecanización en la Europa del siglo XIX.',
            accent: 'amber',
            icon: <IconHistory />,
        },
    ];

    const ACCENTS = ['violet', 'emerald', 'amber'];

    const curriculumItems = planes.length > 0
        ? planes.slice(0, 3).map((p, i) => ({
            code: p.id ? p.id.toString().slice(-6).toUpperCase() : String(i + 1).padStart(3, '0'),
            title: p.titulo ?? 'Plan sin título',
            efficiency: calcularEficiencia(p),
            topic: p.objetivo ?? p.nivel ?? '',
            accent: ACCENTS[i % ACCENTS.length],
            icon: <IconBook />,
        }))
        : CURRICULUM_FALLBACK;

    const horasEnfocadas = resumen?.focusedMinutesTotal != null
        ? (resumen.focusedMinutesTotal / 60).toFixed(1)
        : null;
    const tasaRetencion = resumen?.retentionRate ?? null;
    const rachaActiva   = resumen?.currentStreak ?? null;

    if (cargando) {
        return (
            <div className="flex h-screen bg-[#0c0c0c]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0c0c0c] overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-5">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Horas Enfocadas"
                    value={horasEnfocadas ?? '—'}
                    unit={horasEnfocadas != null ? 'HRS' : undefined}
                    badge={resumen?.focusedMinutesWeek != null ? `${(resumen.focusedMinutesWeek / 60).toFixed(1)}h semana` : undefined}
                    badgeColor="green"
                    icon={<IconClock />}
                    accent="text-violet-400"
                />
                <StatCard
                    label="Sesiones Hoy"
                    value={resumen?.sessionsToday ?? '—'}
                    unit={resumen?.sessionsToday != null ? 'HOY' : undefined}
                    badge={resumen?.focusedMinutesToday != null ? `${resumen.focusedMinutesToday} min` : undefined}
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
                    badge={resumen?.longestStreak != null ? `Récord: ${resumen.longestStreak}d` : undefined}
                    icon={<IconFire />}
                    accent="text-orange-400"
                />
            </div>

            <div className="mt-2">
                <WeeklyChart data={datosSemana} />
            </div>

            <div className="mt-4">
                <div className="mb-4">
                    <h2 className="text-sm font-bold tracking-widest text-white uppercase">Currículo Activo</h2>
                    <p className="text-xs text-neutral-500 tracking-wider mt-0.5">
                        Planes de estudio principales y progreso modular
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curriculumItems.map((c) => (
                        <CurriculumCard key={c.code} {...c} />
                    ))}
                </div>
            </div>

            </div>
        </div>
    );
}
