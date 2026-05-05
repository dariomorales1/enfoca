export default function StatCard({ label, value, unit, badge, badgeColor = 'neutral', icon, accent }) {
    const badgeColors = {
        green: 'text-emerald-400',
        neutral: 'text-neutral-400',
        violet: 'text-violet-400',
        amber: 'text-amber-400',
    };

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
                    {label}
                </span>
                <span className={accent || 'text-neutral-600'}>{icon}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight text-white leading-none">{value}</span>
                {unit && (
                    <span className="text-base font-semibold text-neutral-400 mb-0.5">{unit}</span>
                )}
                {badge && (
                    <span className={`text-xs font-semibold mb-0.5 ${badgeColors[badgeColor]}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
}
