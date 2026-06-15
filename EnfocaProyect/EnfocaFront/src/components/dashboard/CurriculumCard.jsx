const accentMap = {
    violet: { code: 'text-violet-400', bar: 'bg-violet-500' },
    emerald: { code: 'text-emerald-400', bar: 'bg-emerald-500' },
    amber: { code: 'text-amber-400', bar: 'bg-amber-500' },
};

export default function CurriculumCard({ code, title, efficiency, topic, accent = 'violet', icon }) {
    const colors = accentMap[accent] || accentMap.violet;

    return (
        // h-full garantiza alturas simétricas. Reducimos el padding a p-4 en móvil.
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 h-full">

            {/* Header: Ahora sí renderizamos el icono en la esquina superior derecha */}
            <div className="flex items-start justify-between gap-2">
                <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase ${colors.code}`}>
                    {code}
                </span>
                {icon && (
                    <span className={`flex-shrink-0 opacity-80 ${colors.code}`}>
                        {icon}
                    </span>
                )}
            </div>

            {/* Título: line-clamp-2 previene que títulos enormes rompan la tarjeta */}
            <h4 className="text-sm sm:text-base font-semibold text-white leading-tight line-clamp-2">
                {title}
            </h4>

            {/* Progress bar: mt-auto la empuja hacia abajo para alinear todas las tarjetas */}
            <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
                        Eficiencia
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-300 tabular-nums">
                        {efficiency}%
                    </span>
                </div>
                {/* h-1 es más visible en pantallas móviles que h-0.5 */}
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                        style={{ width: `${efficiency}%` }}
                    />
                </div>
            </div>

            {/* Topic: limitamos a 2 líneas y adaptamos el tamaño de fuente */}
            <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-relaxed line-clamp-2">
                {topic}
            </p>
        </div>
    );
}