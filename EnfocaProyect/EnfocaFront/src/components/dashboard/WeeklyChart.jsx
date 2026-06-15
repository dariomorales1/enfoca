import { useState, useRef, useEffect } from 'react';
import { useWeeklyChart } from '../../hooks/useWeeklyChart';

const ChartSkeleton = () => (
    // Padding p-4 en móvil, p-5 en desktop
    <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between">
            <div className="flex flex-col gap-2">
                <div className="h-3 w-32 sm:w-48 bg-neutral-800/60 rounded animate-pulse" />
                <div className="h-2 w-24 sm:w-32 bg-neutral-800/60 rounded animate-pulse" />
            </div>
            <div className="flex gap-1">
                <div className="h-6 w-14 bg-neutral-800/60 rounded animate-pulse" />
                <div className="h-6 w-14 bg-neutral-800/60 rounded animate-pulse" />
            </div>
        </div>
        <div className="h-48 bg-neutral-800/30 rounded animate-pulse" />
    </div>
);

// Variables de dibujo SVG (el viewBox escalará automáticamente con CSS w-full)
const H = 160, W = 560, MAX = 6, GRID = 4, BAR_W = 20 /* Reducido de 28 para que respire en móvil */, COL_W = W / 7;

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

export default function WeeklyChart() {
    const [mode,    setMode]    = useState('CRUDO');
    const [tooltip, setTooltip] = useState(null);
    const { raw, avg, loading } = useWeeklyChart();

    // Ref para detectar clics fuera del SVG y cerrar el tooltip en móviles
    const svgRef = useRef(null);

    // Cerrar tooltip si se toca fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (svgRef.current && !svgRef.current.contains(event.target)) {
                setTooltip(null);
            }
        };
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (loading) return <ChartSkeleton />;

    const data      = mode === 'CRUDO' ? raw : avg;
    const maxCycles = Math.max(...data.map((d) => d.cycles), 1);
    const scale     = Math.ceil(maxCycles / 6) * 6 || MAX;
    const total     = data.reduce((s, d) => s + d.cycles, 0);

    const points = data.map((d, i) => ({
        x: COL_W * i + COL_W / 2,
        y: H - (d.cycles / scale) * H,
    }));

    const linePath = smoothPath(points);
    const areaPath = linePath
        ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
        : '';

    return (
        <div className="bg-[#111111] border border-neutral-800/60 rounded-xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 h-full">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-xs sm:text-sm font-bold tracking-widest text-white uppercase">
                        Actividad Semanal
                    </h3>
                    <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                        {total} sesiones esta semana
                    </p>
                </div>
                <div className="flex gap-1.5 bg-neutral-900/50 p-1 rounded-lg">
                    {['CRUDO', 'AVG'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            // Botones más grandes en móvil (py-1.5) para que el dedo acierte
                            className={`px-3 py-1.5 sm:py-1 rounded text-[10px] font-semibold tracking-wider transition-colors ${
                                mode === m
                                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                                    : 'text-neutral-600 hover:text-neutral-400 border border-transparent'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full overflow-hidden relative flex-grow flex items-end">
                {tooltip && (
                    <div
                        className="absolute z-10 pointer-events-none bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-2xl text-center transition-all"
                        style={{
                            left:      `${(tooltip.x / W) * 100}%`,
                            transform: 'translateX(-50%)',
                            top:       -10, // Subimos el tooltip para que no tape la línea
                        }}
                    >
                        <p className="text-[9px] sm:text-[10px] text-neutral-400">{tooltip.day}</p>
                        <p className="text-xs sm:text-sm font-bold text-violet-400">{tooltip.value} ses.</p>
                    </div>
                )}

                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${W} ${H + 30}`}
                    className="w-full h-auto mt-4 sm:mt-0"
                    preserveAspectRatio="xMidYMid meet"
                    onMouseLeave={() => setTooltip(null)} // Para Desktop
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"   />
                        </linearGradient>
                        <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3f3f46" />
                            <stop offset="100%" stopColor="#27272a" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="barHover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#c4b5fd" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    {/* Líneas horizontales de fondo */}
                    {Array.from({ length: GRID + 1 }).map((_, i) => (
                        <line key={i}
                              x1={0} y1={(H / GRID) * i} x2={W} y2={(H / GRID) * i}
                              stroke="#1c1c1c" strokeWidth={1}
                              strokeDasharray={i === 0 ? '0' : '3 5'} />
                    ))}

                    {/* Áreas y líneas del gráfico */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                    {linePath && (
                        <path d={linePath} fill="none" stroke="#8b5cf6"
                              strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {/* Barras y datos */}
                    {data.map((d, i) => {
                        const barH   = Math.max((d.cycles / scale) * H, d.cycles > 0 ? 4 : 0);
                        const x      = COL_W * i + COL_W / 2 - BAR_W / 2;
                        const y      = H - barH;
                        const hovered = tooltip?.index === i;
                        const fill   = hovered ? 'url(#barHover)' : d.current ? 'url(#barActive)' : 'url(#barNormal)';

                        return (
                            <g key={d.day}
                                // Reemplazamos onMouseEnter por onClick para compatibilidad táctil
                               onClick={() => setTooltip({ index: i, day: d.day, value: d.cycles, x: COL_W * i + COL_W / 2 })}
                               onMouseEnter={() => setTooltip({ index: i, day: d.day, value: d.cycles, x: COL_W * i + COL_W / 2 })}
                               style={{ cursor: 'pointer' }}
                            >
                                {/* Rectángulo invisible (COL_W) ancho completo de columna para área táctil fácil */}
                                <rect x={COL_W * i} y={0} width={COL_W} height={H + 30} fill="transparent" />

                                {barH > 0 && (
                                    <rect x={x} y={y} width={BAR_W} height={barH} rx={4} fill={fill} />
                                )}

                                {/* Número superior. Aumentado el viewBox font-size para visibilidad al encoger */}
                                {d.cycles > 0 && (
                                    <text x={COL_W * i + COL_W / 2} y={y - 8}
                                          textAnchor="middle" fontSize={14}
                                          fill={hovered || d.current ? '#c4b5fd' : '#52525b'}
                                          fontFamily="system-ui, sans-serif" fontWeight="700">
                                        {d.cycles % 1 === 0 ? d.cycles : d.cycles.toFixed(1)}
                                    </text>
                                )}

                                {/* Indicador de Día Actual */}
                                {d.current && (
                                    <circle cx={COL_W * i + COL_W / 2} cy={H + 16} r={3.5} fill="#8b5cf6" />
                                )}

                                {/* Etiqueta del Día (Lu, Ma, Mi, etc) */}
                                <text x={COL_W * i + COL_W / 2} y={H + 26}
                                      textAnchor="middle" fontSize={13}
                                      fontWeight={d.current ? '800' : '600'}
                                      fill={d.current ? '#a78bfa' : hovered ? '#a78bfa' : '#525252'}
                                      fontFamily="system-ui, sans-serif" letterSpacing="1">
                                    {d.day}
                                </text>
                            </g>
                        );
                    })}

                    {/* Puntos de la línea dibujados por encima para no quedar tapados */}
                    {points.map((p, i) => (
                        data[i].cycles > 0 && (
                            <circle key={i} cx={p.x} cy={p.y} r={4.5}
                                    fill={data[i].current || tooltip?.index === i ? '#a78bfa' : '#6d28d9'}
                                    stroke={data[i].current || tooltip?.index === i ? '#ede9fe' : '#8b5cf6'}
                                    strokeWidth={2} className="pointer-events-none" />
                        )
                    ))}
                </svg>
            </div>
        </div>
    );
}