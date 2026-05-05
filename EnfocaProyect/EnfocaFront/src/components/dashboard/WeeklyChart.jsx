import { useState } from 'react';

const RAW = [
    { day: 'LUN', cycles: 2 },
    { day: 'MAR', cycles: 1 },
    { day: 'MIÉ', cycles: 4, current: true },
    { day: 'JUE', cycles: 0 },
    { day: 'VIE', cycles: 0 },
    { day: 'SÁB', cycles: 0 },
    { day: 'DOM', cycles: 0 },
];

const W_AVG = [
    { day: 'LUN', cycles: 3.8 },
    { day: 'MAR', cycles: 3.2 },
    { day: 'MIÉ', cycles: 4.5, current: true },
    { day: 'JUE', cycles: 4.1 },
    { day: 'VIE', cycles: 3.7 },
    { day: 'SÁB', cycles: 2.4 },
    { day: 'DOM', cycles: 1.6 },
];

const H = 160;
const W = 560;
const MAX = 6;
const GRID = 4;
const BAR_W = 28;
const COL_W = W / 7;

function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

export default function WeeklyChart() {
    const [mode, setMode] = useState('CRUDO');
    const data = mode === 'CRUDO' ? RAW : W_AVG;

    const points = data.map((d, i) => ({
        x: COL_W * i + COL_W / 2,
        y: H - (d.cycles / MAX) * H,
    }));

    const linePath = smoothPath(points);
    const areaPath = linePath
        ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
        : '';

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-5 flex flex-col gap-4">
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

            <div className="w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${W} ${H + 30}`}
                    className="w-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="1" />
                            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.7" />
                        </linearGradient>
                        <linearGradient id="barMuted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3f3f46" stopOpacity="1" />
                            <stop offset="100%" stopColor="#27272a" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {Array.from({ length: GRID + 1 }).map((_, i) => {
                        const y = (H / GRID) * i;
                        return (
                            <line key={i} x1={0} y1={y} x2={W} y2={y}
                                  stroke="#1f1f1f" strokeWidth={1}
                                  strokeDasharray={i === 0 ? '0' : '4 4'} />
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#areaGrad)" />
                    )}

                    {/* Smooth line */}
                    {linePath && (
                        <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth={1.5}
                              strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
                    )}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const barH = Math.max((d.cycles / MAX) * H, d.cycles > 0 ? 4 : 0);
                        const x = COL_W * i + COL_W / 2 - BAR_W / 2;
                        const y = H - barH;
                        const isCurrent = d.current;

                        return (
                            <g key={d.day}>
                                {barH > 0 && (
                                    <rect
                                        x={x} y={y}
                                        width={BAR_W} height={barH}
                                        rx={4}
                                        fill={isCurrent ? 'url(#barGrad)' : 'url(#barMuted)'}
                                    />
                                )}

                                {/* Value label */}
                                {d.cycles > 0 && (
                                    <text
                                        x={COL_W * i + COL_W / 2}
                                        y={y - 6}
                                        textAnchor="middle"
                                        fontSize={9}
                                        fill={isCurrent ? '#a78bfa' : '#52525b'}
                                        fontFamily="monospace"
                                    >
                                        {d.cycles % 1 === 0 ? d.cycles : d.cycles.toFixed(1)}
                                    </text>
                                )}

                                {/* Day dot for current */}
                                {isCurrent && (
                                    <circle
                                        cx={COL_W * i + COL_W / 2}
                                        cy={H + 18}
                                        r={2.5}
                                        fill="#7c3aed"
                                    />
                                )}

                                {/* Day label */}
                                <text
                                    x={COL_W * i + COL_W / 2}
                                    y={H + 22}
                                    textAnchor="middle"
                                    fontSize={9}
                                    fontWeight={isCurrent ? '700' : '400'}
                                    fill={isCurrent ? '#a78bfa' : '#3f3f46'}
                                    fontFamily="monospace"
                                    letterSpacing="1"
                                >
                                    {d.day}
                                </text>
                            </g>
                        );
                    })}

                    {/* Dots on line */}
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
