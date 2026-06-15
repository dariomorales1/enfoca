import { useGamification } from '../../hooks/useGamification';

// ── Iconos inline ─────────────────────────────────────────────────────────────
const IconFlame  = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9 7 6 9 6 13a6 6 0 0 0 12 0c0-4-3-6-6-11z"/>
        <path d="M12 14c-1 2-3 2-3 4a3 3 0 0 0 6 0c0-2-2-2-3-4z" opacity=".5"/>
    </svg>
);
const IconStar   = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);
const IconTrophy = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
        <path d="M6 5h12v6a6 6 0 0 1-12 0V5z"/>
        <line x1="12" y1="17" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
);
const IconZap    = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const IconLock   = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

// ── Sub-componentes ───────────────────────────────────────────────────────────
function XPBar({ xpActual, xpSiguienteNivel, nivel }) {
    const pct = Math.min(100, Math.round((xpActual / xpSiguienteNivel) * 100));
    return (
        <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] text-neutral-500 tracking-widest uppercase font-semibold">
                    XP al nivel {nivel + 1}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400">
                    {xpActual.toLocaleString()} / {xpSiguienteNivel.toLocaleString()}
                </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function RachaBadge({ dias }) {
    const color = dias >= 7  ? 'text-amber-400 bg-amber-400/10 border-amber-500/20'
        : dias >= 3  ? 'text-orange-400 bg-orange-400/10 border-orange-500/20'
            :              'text-neutral-500 bg-neutral-800 border-neutral-700';
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg border text-xs font-bold ${color} shrink-0`}>
            <IconFlame />
            <span>{dias}d</span>
        </div>
    );
}

function LogroChip({ logro }) {
    const bloqueado = !logro.desbloqueado;
    return (
        <div
            title={logro.descripcion}
            // En móvil, ancho fijo ligeramente menor (w-[68px])
            className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-xl border text-center w-[68px] sm:w-[72px] h-[68px] sm:h-[72px] flex-shrink-0 transition-colors ${
                bloqueado
                    ? 'border-neutral-800 bg-neutral-900/50 opacity-40'
                    : 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10'
            }`}
        >
            <span className="text-xl sm:text-lg leading-none shrink-0 mb-0.5">{logro.emoji}</span>
            <span className="text-[8px] sm:text-[9px] text-neutral-400 sm:text-neutral-500 leading-tight line-clamp-2 px-0.5 w-full">
                {logro.nombre}
            </span>
            {bloqueado && <div className="absolute opacity-50"><IconLock /></div>}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GamificationPanel() {
    const { perfil, loading, error } = useGamification();

    if (loading) return (
        <div className="rounded-2xl border border-neutral-900 bg-[#0d0d0d] p-4 sm:p-5 flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-neutral-800 border-t-violet-600 rounded-full animate-spin"/>
        </div>
    );

    if (error || !perfil) return (
        <section className="rounded-2xl border border-neutral-900 bg-[#0d0d0d] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">Progresión</h2>
                    <p className="text-[9px] sm:text-[10px] text-neutral-600 tracking-wider mt-0.5">Nivel · Racha · Logros</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 py-8">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <IconTrophy />
                </div>
                <p className="text-xs text-neutral-600 tracking-wider text-center">
                    Gamificación no disponible
                </p>
            </div>
        </section>
    );

    const {
        nivel         = 1,
        xpTotal       = 0,
        xpActual      = 0,
        xpSiguienteNivel = 500,
        rachaDias     = 0,
        logros        = [],
        rangNombre    = 'Aprendiz',
    } = perfil;

    const logrosRecientes = logros.slice(0, 6);

    return (
        <section className="rounded-2xl border border-neutral-900 bg-[#0d0d0d] p-4 sm:p-5 flex flex-col gap-5 sm:gap-6">

            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">Progresión</h2>
                    <p className="text-[9px] sm:text-[10px] text-neutral-600 tracking-wider mt-0.5">Nivel · Racha · Logros</p>
                </div>
                <RachaBadge dias={rachaDias} />
            </div>

            {/* Nivel + XP */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Badge de nivel */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-violet-600/10 border border-violet-500/20 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[8px] sm:text-[9px] text-violet-400 tracking-widest uppercase font-semibold">NIV</span>
                    <span className="text-lg sm:text-xl font-black text-white leading-none">{nivel}</span>
                </div>

                {/* Info + barra */}
                <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                        <span className="text-sm font-bold text-white truncate">{rangNombre}</span>
                        <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-violet-400 font-mono">
                            <IconZap />
                            {xpTotal.toLocaleString()} XP total
                        </span>
                    </div>
                    <XPBar xpActual={xpActual} xpSiguienteNivel={xpSiguienteNivel} nivel={nivel} />
                </div>
            </div>

            {/* Logros */}
            {logrosRecientes.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
                            <IconTrophy />
                            Logros
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-700 font-mono">
                            {logros.filter(l => l.desbloqueado).length}/{logros.length}
                        </span>
                    </div>
                    {/* Scroll horizontal forzado en móviles para evitar acumulación vertical infinita */}
                    <div className="flex gap-2 sm:flex-wrap overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        {logrosRecientes.map((logro) => (
                            <LogroChip key={logro.id} logro={logro} />
                        ))}
                    </div>
                </div>
            )}

            {/* Mini-stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 sm:pt-4 border-t border-neutral-900">
                {[
                    { label: 'Sesiones', value: perfil.totalSesiones ?? '—', icon: <IconStar /> },
                    { label: 'Mejor racha', value: `${perfil.mejorRacha ?? 0}d`, icon: <IconFlame /> },
                    { label: 'Certificados', value: perfil.certificados ?? 0, icon: <IconTrophy /> },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="flex flex-col items-center justify-center gap-1 py-1 px-1 text-center bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                        <span className="text-neutral-500 mb-0.5">{icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-white tabular-nums">{value}</span>
                        <span className="text-[8px] sm:text-[9px] text-neutral-600 tracking-wider uppercase line-clamp-1 w-full">{label}</span>
                    </div>
                ))}
            </div>

            {/* CSS helper para esconder el scrollbar en webkit/móvil */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}