import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService, certService } from '../services/api';
import { getPlanImage, getPlanBgFallback } from '../utils/planImage';

const NIVEL_LABEL = { BASICO: 'Básico', INTERMEDIO: 'Intermedio', AVANZADO: 'Avanzado' };
const NIVEL_COLOR = { BASICO: 'bg-emerald-600', INTERMEDIO: 'bg-amber-600', AVANZADO: 'bg-violet-600' };

// (Iconos se mantienen intactos)
const StarIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);
const UsersIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const BookIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
);

const IconMedal = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
);

function PlanCard({ plan, index, onClick, badge, showProgress, tieneCertificado }) {
    const progreso = showProgress ? (() => {
        const temas = plan.modulos?.flatMap(m => m.temas) ?? [];
        if (!temas.length) return 0;
        return Math.round(temas.filter(t => t.completado).length / temas.length * 100);
    })() : null;

    const rating = plan.ratioValidaciones
        ? (plan.ratioValidaciones * 5).toFixed(1)
        : null;

    return (
        <button
            onClick={() => onClick(plan)}
            // Agregamos flex flex-col y h-full para que todas las tarjetas tengan la misma altura
            // aunque el título ocupe 1 o 2 líneas
            className="group w-full h-full text-left bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all hover:-translate-y-0.5 active:scale-95 flex flex-col"
        >
            {/* Portada */}
            <div className={`h-32 sm:h-36 bg-gradient-to-b ${getPlanBgFallback(index)} to-neutral-900 relative flex items-end p-3 overflow-hidden shrink-0`}>
                <img
                    src={getPlanImage(plan.titulo)}
                    alt={plan.titulo}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/20 to-transparent"/>
                <div className="relative z-10 flex items-center gap-1.5 flex-wrap">
                    {badge && (
                        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-violet-600 text-white">
                            {badge}
                        </span>
                    )}
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white ${NIVEL_COLOR[plan.nivel] ?? 'bg-neutral-700'}`}>
                        {NIVEL_LABEL[plan.nivel] ?? plan.nivel}
                    </span>
                    {progreso === 100 && (
                        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                            ✓
                        </span>
                    )}
                    {tieneCertificado && (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500 text-black mt-1 sm:mt-0">
                            <IconMedal /> Certificado
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-violet-300 transition-colors leading-tight line-clamp-2">
                        {plan.titulo}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-neutral-600">
                        <span>{plan.modulos?.length ?? 0} módulos</span>
                        {rating && (
                            <span className="flex items-center gap-1">
                                <StarIcon /> {rating}
                                <span className="text-neutral-700 ml-1 flex items-center gap-0.5">
                                    <UsersIcon /> {plan.totalValidaciones}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress siempre abajo gracias a flex-1 en el contenedor padre */}
                {showProgress && progreso !== null && (
                    <div className="mt-1">
                        <div className="flex justify-between text-[9px] font-mono text-neutral-700 mb-1">
                            <span>Progreso</span><span>{progreso}%</span>
                        </div>
                        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${progreso}%`, backgroundColor: progreso === 100 ? '#10b981' : '#8b5cf6' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
}

const SkeletonGrid = () => (
    // Transición suave de columnas: 1 -> 2 -> 3 -> 4
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden animate-pulse h-64">
                <div className="h-36 bg-neutral-800/40"/>
                <div className="p-4 flex flex-col gap-2">
                    <div className="h-3 bg-neutral-800 rounded w-3/4"/>
                    <div className="h-2 bg-neutral-800 rounded w-1/2"/>
                </div>
            </div>
        ))}
    </div>
);

export default function LibraryPage() {
    const navigate = useNavigate();
    const [catalogo, setCatalogo]       = useState([]);
    const [misPlanes, setMisPlanes]     = useState([]);
    const [enRevision, setEnRevision]   = useState([]);
    const [certIds, setCertIds]         = useState(new Set());
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        Promise.all([
            planService.catalogo().then(r => r.data ?? []).catch(() => []),
            planService.listar().then(r => r.data ?? []).catch(() => []),
            planService.enRevision().then(r => r.data ?? []).catch(() => []),
            certService.certificados().then(r => r.data ?? []).catch(() => []),
        ]).then(([cat, mis, rev, certs]) => {
            setCatalogo(cat);
            setMisPlanes(mis);
            setEnRevision(rev);
            setCertIds(new Set(certs.map(c => c.planMaestroId)));
        }).finally(() => setLoading(false));
    }, []);

    const tieneCert = (plan) =>
        certIds.has(plan.originalPlanId ?? plan.id);

    const abrirPlan = (plan) => navigate(`/plan-detail/${plan.id}`);

    return (
        // Quitamos p-4 md:p-8 y delegamos paddings. Usamos gap-8 sm:gap-12 para separar secciones
        <div className="w-full flex flex-col gap-8 sm:gap-12">

            {/* ── Biblioteca Comunitaria ── */}
            <section className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Biblioteca Comunitaria</h2>
                    <p className="text-neutral-500 text-xs sm:text-sm mt-1">Planes valorados y curados por la comunidad.</p>
                </div>

                {loading ? <SkeletonGrid /> : catalogo.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {catalogo.map((plan, i) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                index={i}
                                badge="Comunidad"
                                showProgress={false}
                                onClick={abrirPlan}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 border border-dashed border-neutral-800 rounded-2xl w-full">
                        <div className="text-neutral-700"><BookIcon /></div>
                        <p className="text-sm text-neutral-500 text-center">Aún no hay planes comunitarios disponibles</p>
                        <p className="text-xs text-neutral-700 max-w-xs text-center">
                            Los planes con alta valoración de la comunidad aparecerán aquí
                        </p>
                    </div>
                )}
            </section>

            {/* ── Planes en Evaluación ── */}
            {enRevision.length > 0 && (
                <section className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Planes en Evaluación</h2>
                        <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                            Planes generados por la comunidad que aún necesitan valoraciones.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {enRevision.map((plan, i) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                index={i + 8}
                                badge="En evaluación"
                                showProgress={false}
                                onClick={p => navigate(`/plan-detail/${p.id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Mis Planes ── */}
            {misPlanes.length > 0 && (
                <section className="flex flex-col gap-4 sm:gap-6">
                    {/* Convertimos a flex-col en móvil para que el botón no aplaste el texto */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-0">
                        <div className="flex flex-col">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Mis Planes</h2>
                            <p className="text-neutral-500 text-xs sm:text-sm mt-1">Planes generados y guardados por ti.</p>
                        </div>
                        <button
                            onClick={() => navigate('/study-plan')}
                            // En móvil ocupa todo el ancho (w-full) para mayor accesibilidad táctil
                            className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 text-xs font-semibold transition-all"
                        >
                            + Nuevo Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {misPlanes.map((plan, i) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                index={i + 4}
                                showProgress
                                tieneCertificado={tieneCert(plan)}
                                onClick={abrirPlan}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}