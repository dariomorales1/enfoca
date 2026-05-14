import { useState } from 'react';

const FALLBACK = [
    { day: 'LUN', cycles: 0 },
    { day: 'MAR', cycles: 0 },
    { day: 'MIÉ', cycles: 0 },
    { day: 'JUE', cycles: 0, current: true },
    { day: 'VIE', cycles: 0 },
    { day: 'SÁB', cycles: 0 },
    { day: 'DOM', cycles: 0 },
];

const H      = 90;
const W      = 560;
const BAR_W  = 28;
const COL_W  = W / 7;

function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX  = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

export default function WeeklyChart({ data: dataProp }) {
    const data  = dataProp ?? FALLBACK;
    const max   = Math.max(...data.map(d => d.cycles ?? d.minutes ?? 0), 1);
    const total = data.reduce((s, d) => s + (d.cycles ?? d.minutes ?? 0), 0);

    const [tooltip, setTooltip] = useState(null);

    const getValue = (d) => d.cycles ?? d.minutes ?? 0;

    const points = data.map((d, i) => ({
        x: COL_W * i + COL_W / 2,
        y: H - (getValue(d) / max) * H,
    }));

    const linePath = smoothPath(points);
    const areaPath = linePath
        ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
        : '';

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase">
                        Actividad Semanal
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {total} sesiones esta semana
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-violet-500"/>
                    <span className="text-[10px] text-neutral-500">Sesiones de enfoque</span>
                </div>
            </div>

            <div className="w-full overflow-hidden relative">
                {/* Tooltip flotante */}
                {tooltip && (
                    <div
                        className="absolute z-10 pointer-events-none bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 shadow-2xl text-center"
                        style={{
                            left:      `${(tooltip.x / W) * 100}%`,
                            transform: 'translateX(-50%)',
                            top:       0,
                        }}
                    >
                        <p className="text-[10px] text-neutral-400">{tooltip.day}</p>
                        <p className="text-sm font-bold text-violet-400">{tooltip.value} sesiones</p>
                    </div>
                )}

                <svg
                    viewBox={`0 0 ${W} ${H + 30}`}
                    className="w-full"
                    preserveAspectRatio="xMidYMid meet"
                    onMouseLeave={() => setTooltip(null)}
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"    />
                        </linearGradient>
                        <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="barHover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#c4b5fd" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    {/* Grid */}
                    {[0.25, 0.5, 0.75, 1].map((pct, i) => (
                        <line key={i}
                            x1={0} y1={H * (1 - pct)}
                            x2={W} y2={H * (1 - pct)}
                            stroke="#1c1c1c" strokeWidth={1} strokeDasharray="3 5"
                        />
                    ))}

                    {/* Área */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                    {/* Línea */}
                    {linePath && (
                        <path d={linePath} fill="none"
                            stroke="#8b5cf6" strokeWidth={2}
                            strokeLinecap="round" strokeLinejoin="round"
                        />
                    )}

                    {/* Barras */}
                    {data.map((d, i) => {
                        const val  = getValue(d);
                        const barH = val > 0 ? Math.max((val / max) * H, 6) : 0;
                        const x    = COL_W * i + COL_W / 2 - BAR_W / 2;
                        const y    = H - barH;
                        const hovered = tooltip?.index === i;
                        const fill = hovered ? 'url(#barHover)' : d.current ? 'url(#barActive)' : 'url(#barNormal)';

                        return (
                            <g key={d.day}
                                onMouseEnter={() => setTooltip({ index: i, day: d.day, value: val, x: COL_W * i + COL_W / 2 })}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Zona hover invisible para días sin barra */}
                                <rect
                                    x={COL_W * i} y={0}
                                    width={COL_W} height={H}
                                    fill="transparent"
                                />

                                {barH > 0 && (
                                    <rect x={x} y={y} width={BAR_W} height={barH} rx={5} fill={fill} />
                                )}

                                {val > 0 && (
                                    <text
                                        x={COL_W * i + COL_W / 2} y={y - 5}
                                        textAnchor="middle" fontSize={9}
                                        fill={hovered ? '#c4b5fd' : d.current ? '#c4b5fd' : '#7c3aed'}
                                        fontFamily="system-ui, sans-serif" fontWeight="600"
                                    >
                                        {val}
                                    </text>
                                )}

                                {d.current && (
                                    <circle cx={COL_W * i + COL_W / 2} cy={H + 16} r={2.5} fill="#8b5cf6" />
                                )}

                                <text
                                    x={COL_W * i + COL_W / 2} y={H + 22}
                                    textAnchor="middle" fontSize={9}
                                    fontWeight={d.current ? '700' : '400'}
                                    fill={d.current ? '#a78bfa' : hovered ? '#a78bfa' : '#525252'}
                                    fontFamily="system-ui, sans-serif"
                                    letterSpacing="1"
                                >
                                    {d.day}
                                </text>
                            </g>
                        );
                    })}

                    {/* Puntos en la línea */}
                    {points.map((p, i) => getValue(data[i]) > 0 && (
                        <circle key={i} cx={p.x} cy={p.y} r={3.5}
                            fill={data[i].current || tooltip?.index === i ? '#a78bfa' : '#6d28d9'}
                            stroke={data[i].current || tooltip?.index === i ? '#ede9fe' : '#8b5cf6'}
                            strokeWidth={1.5}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
