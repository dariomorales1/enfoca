export default function StatCard({ label, value, unit, badge, badgeColor = 'neutral', icon, accent }) {
    const badgeColors = {
        green: 'text-emerald-400',
        neutral: 'text-neutral-400',
        violet: 'text-violet-400',
        amber: 'text-amber-400',
    };

    return (
        // Padding responsivo: p-3.5 en móvil, p-4 en tablet, p-5 en desktop
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-3.5 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3 h-full">

            <div className="flex items-start justify-between gap-2">
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-neutral-500 uppercase line-clamp-2">
                    {label}
                </span>
                {/* shrink-0 evita que el icono se aplaste si el label es de 2 líneas */}
                <span className={`flex-shrink-0 ${accent || 'text-neutral-600'}`}>{icon}</span>
            </div>

            {/* mt-auto empuja el contenido hacia abajo. flex-wrap salva el diseño si el contenido es muy ancho */}
            <div className="flex items-end flex-wrap gap-1.5 sm:gap-2 mt-auto pt-1">
                {/* Escalado tipográfico y números tabulares */}
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-none tabular-nums">
                    {value}
                </span>

                {unit && (
                    <span className="text-xs sm:text-sm lg:text-base font-semibold text-neutral-400 mb-0.5">
                        {unit}
                    </span>
                )}

                {badge && (
                    <span className={`text-[10px] sm:text-xs font-semibold mb-0.5 mt-1 sm:mt-0 ${badgeColors[badgeColor]}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
}