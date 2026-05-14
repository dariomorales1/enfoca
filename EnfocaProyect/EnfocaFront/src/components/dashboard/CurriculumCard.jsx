const accentMap = {
    violet: { code: 'text-violet-400', bar: 'bg-violet-500' },
    emerald: { code: 'text-emerald-400', bar: 'bg-emerald-500' },
    amber: { code: 'text-amber-400', bar: 'bg-amber-500' },
};

export default function CurriculumCard({ code, title, efficiency, topic, accent = 'violet', icon }) {
    const colors = accentMap[accent] || accentMap.violet;

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-4">
            <div>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${colors.code}`}>{code}</span>
            </div>

            <h4 className="text-sm font-semibold text-white leading-tight">{title}</h4>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">Eficiencia</span>
                    <span className="text-xs font-bold text-neutral-300">{efficiency}%</span>
                </div>
                <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                        style={{ width: `${efficiency}%` }}
                    />
                </div>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed">{topic}</p>
        </div>
    );
}
