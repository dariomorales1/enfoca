import StatCard from '../components/dashboard/StatCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import FocusEngine from '../components/dashboard/FocusEngine';
import CurriculumCard from '../components/dashboard/CurriculumCard';

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
const IconSigma = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 4H6l7 8-7 8h12" />
    </svg>
);
const IconUpload = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);
const IconGlobe = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <line x1="3.05" y1="9" x2="20.95" y2="9" /><line x1="3.05" y1="15" x2="20.95" y2="15" />
        <path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18" />
    </svg>
);

const CURRICULUM = [
    {
        code: 'MTH-402',
        title: 'Integración Multivariable',
        efficiency: 75.0,
        topic: 'Tema: Integrales triples en coordenadas esféricas y campos vectoriales.',
        accent: 'violet',
        icon: <IconSigma />,
    },
    {
        code: 'BIO-612',
        title: 'Edición Génica CRISPR',
        efficiency: 42.8,
        topic: 'Tema: Análisis de secuenciación molecular CAS9 y unión a objetivos.',
        accent: 'emerald',
        icon: <IconUpload />,
    },
    {
        code: 'HIS-101',
        title: 'Revolución Industrial',
        efficiency: 88.2,
        topic: 'Tema: Cambio socioeconómico y mecanización en la Europa del siglo XIX.',
        accent: 'amber',
        icon: <IconGlobe />,
    },
];

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-6 flex flex-col gap-5">

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Horas Enfocadas"
                    value="124.5"
                    badge="+12%"
                    badgeColor="green"
                    icon={<IconClock />}
                />
                <StatCard
                    label="XP Trabajo Profundo"
                    value="2.450"
                    badge="NIV 24"
                    badgeColor="neutral"
                    icon={<IconTarget />}
                />
                <StatCard
                    label="Tasa de Retención"
                    value="92"
                    unit="%"
                    icon={<IconLayers />}
                />
                <StatCard
                    label="Racha Activa"
                    value="12"
                    unit="DÍAS"
                    icon={<IconBolt />}
                    accent="text-amber-400"
                />
            </div>

            {/* Gráfico + Motor */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <WeeklyChart />
                <FocusEngine />
            </div>

            {/* Currículo activo */}
            <div>
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-xs font-bold tracking-widest text-white uppercase">Currículo Activo</h2>
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
                    {CURRICULUM.map((c) => (
                        <CurriculumCard key={c.code} {...c} />
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
                    {['Manifiesto', 'Arquitectura', 'Nodos'].map((link) => (
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
