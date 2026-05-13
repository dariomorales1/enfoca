import { useState } from 'react';
import { useWeeklyChart } from '../../hooks/useWeeklyChart';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const ChartSkeleton = () => (
    <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex justify-between">
            <div className="flex flex-col gap-2">
                <div className="h-3 w-48 bg-neutral-800/60 rounded animate-pulse" />
                <div className="h-2 w-32 bg-neutral-800/60 rounded animate-pulse" />
            </div>
            <div className="flex gap-1">
                <div className="h-6 w-14 bg-neutral-800/60 rounded animate-pulse" />
                <div className="h-6 w-14 bg-neutral-800/60 rounded animate-pulse" />
            </div>
        </div>
        <div className="h-48 bg-neutral-800/30 rounded animate-pulse" />
    </div>
);

// ── Constantes SVG (sin cambios) ──────────────────────────────────────────────
const H = 160, W = 560, MAX = 6, GRID = 4, BAR_W = 28, COL_W = W / 7;

function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1], curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function WeeklyChart() {
    const [mode, setMode] = useState('CRUDO');
    const { raw, avg, loading } = useWeeklyChart();

    if (loading) return <ChartSkeleton />;

    const data      = mode === 'CRUDO' ? raw : avg;
    const maxCycles = Math.max(...data.map((d) => d.cycles), 1); // evita div/0
    const scale     = Math.ceil(maxCycles / 6) * 6 || MAX;       // escala dinámica

    const points = data.map((d, i) => ({
        x: COL_W * i + COL_W / 2,
        y: H - (d.cycles / scale) * H,
    }));

    const linePath = smoothPath(points);
    const areaPath = linePath
        ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
        : '';

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-[11px] font-bold tracking-widest text-white uppercase">
                        Distribución de Intensidad Semanal
                    </h3>
                    <p className="text-[10px] text-neutral-600 tracking-wider uppercase mt-0.5">
                        Medido en ciclos de enfoque por intervalo
                    </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    {['PROM', 'CRUDO'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-3 py-1 text-[10px] font-semibold tracking-wider rounded border transition-colors ${
                                mode === m
                                    ? 'bg-neutral-800 border-neutral-600 text-white'
                                    : 'border-neutral-800 text-neutral-600 hover:text-neutral-400'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* SVG — idéntico al original, solo cambia `MAX` → `scale` */}
            <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"   />
                        </linearGradient>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="1"   />
                            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.7" />
                        </linearGradient>
                        <linearGradient id="barMuted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3f3f46" stopOpacity="1"   />
                            <stop offset="100%" stopColor="#27272a" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {Array.from({ length: GRID + 1 }).map((_, i) => (
                        <line key={i} x1={0} y1={(H / GRID) * i} x2={W} y2={(H / GRID) * i}
                              stroke="#1f1f1f" strokeWidth={1}
                              strokeDasharray={i === 0 ? '0' : '4 4'} />
                    ))}

                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                    {linePath && <path d={linePath} fill="none" stroke="#7c3aed"
                                       strokeWidth={1.5} strokeLinecap="round"
                                       strokeLinejoin="round" opacity={0.6} />}

                    {data.map((d, i) => {
                        const barH = Math.max((d.cycles / scale) * H, d.cycles > 0 ? 4 : 0);
                        const x = COL_W * i + COL_W / 2 - BAR_W / 2;
                        const y = H - barH;
                        return (
                            <g key={d.day}>
                                {barH > 0 && (
                                    <rect x={x} y={y} width={BAR_W} height={barH} rx={4}
                                          fill={d.current ? 'url(#barGrad)' : 'url(#barMuted)'} />
                                )}
                                {d.cycles > 0 && (
                                    <text x={COL_W * i + COL_W / 2} y={y - 6}
                                          textAnchor="middle" fontSize={9}
                                          fill={d.current ? '#a78bfa' : '#52525b'}
                                          fontFamily="monospace">
                                        {d.cycles % 1 === 0 ? d.cycles : d.cycles.toFixed(1)}
                                    </text>
                                )}
                                {d.current && (
                                    <circle cx={COL_W * i + COL_W / 2} cy={H + 18}
                                            r={2.5} fill="#7c3aed" />
                                )}
                                <text x={COL_W * i + COL_W / 2} y={H + 22}
                                      textAnchor="middle" fontSize={9}
                                      fontWeight={d.current ? '700' : '400'}
                                      fill={d.current ? '#a78bfa' : '#3f3f46'}
                                      fontFamily="monospace" letterSpacing="1">
                                    {d.day}
                                </text>
                            </g>
                        );
                    })}

                    {points.map((p, i) => (
                        data[i].cycles > 0 && (
                            <circle key={i} cx={p.x} cy={p.y} r={3}
                                    fill={data[i].current ? '#7c3aed' : '#3f3f46'}
                                    stroke={data[i].current ? '#a78bfa' : 'transparent'}
                                    strokeWidth={1.5} />
                        )
                    ))}
                </svg>
            </div>
        </div>
    );
}