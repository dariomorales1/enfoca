import './AnalyticsPage.css';
import { metricsService } from '../services/api.jsx';
import { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const INTENSITY_COLORS = ['#1a1a2e', '#3b2f6e', '#5c3fa8', '#7c54d4', '#a86fdf'];

function HeatmapGrid({ data }) {
    if (!data?.length) return <div className="heatmap-empty">Sin datos este mes</div>;
    return (
        <div className="heatmap-grid">
            {data.map((entry) => (
                <div
                    key={entry.date}
                    className="heatmap-cell"
                    style={{ background: INTENSITY_COLORS[entry.intensity ?? 0] }}
                    title={`${entry.date} — ${entry.focusedMinutes} min`}
                />
            ))}
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="tooltip-label">{label}</p>
            <p className="tooltip-value">{payload[0].value} min</p>
        </div>
    );
}

function KpiCard({ label, value, sub }) {
    return (
        <div className="bg-[#1c1b19] border border-[#262523] rounded-xl p-5 flex flex-col gap-1.5">
            <span className="text-[0.65rem] text-[#797876] tracking-widest uppercase">{label}</span>
            <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
            {sub && <span className="text-[0.7rem] text-[#5a5957]">{sub}</span>}
        </div>
    );
}

export default function AnalyticsPage() {
    const [summary,  setSummary]  = useState(null);
    const [daily,    setDaily]    = useState([]);
    const [weekly,   setWeekly]   = useState([]);
    const [heatmap,  setHeatmap]  = useState([]);
    const [insight,  setInsight]  = useState(null);
    const [loading,  setLoading]  = useState(true);

    const now = new Date();

    useEffect(() => {
        Promise.all([
            metricsService.getSummary(),
            metricsService.getLast7Days(),
            metricsService.getLast4Weeks(),
            metricsService.getHeatmap(now.getFullYear(), now.getMonth() + 1),
            metricsService.getInsight(),
        ])
            .then(([s, d, w, h, i]) => {
                setSummary(s.data);
                setDaily(d.data.map(e => ({
                    name: new Date(e.date).toLocaleDateString('es-CL', { weekday: 'short' }),
                    min: e.focusedMinutes,
                })));
                setWeekly(w.data.map((e, idx) => ({
                    name: `S${idx + 1}`,
                    min: e.totalFocusedMinutes,
                })));
                setHeatmap(h.data);
                setInsight(i.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-screen bg-[#0c0c0c]">
            <Sidebar />
            <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="skeleton skeleton-heading" />
                <div className="flex gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-kpi flex-1" />)}
                </div>
                <div className="skeleton skeleton-chart flex-1" />
            </div>
        </div>
    );

    const hoursTotal = summary ? (summary.focusedMinutesTotal / 60).toFixed(1) : '—';
    const hoursWeek  = summary ? (summary.focusedMinutesWeek  / 60).toFixed(1) : '—';

    return (
        <div className="flex h-screen bg-[#0c0c0c] overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">

                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Análisis</h1>
                    <span className="text-[0.7rem] text-[#797876] tracking-widest uppercase">Resumen de rendimiento</span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    <KpiCard label="Horas Totales"  value={hoursTotal}                        sub="acumulado" />
                    <KpiCard label="Horas / Semana" value={hoursWeek}                         sub="esta semana" />
                    <KpiCard label="Retención"      value={`${summary?.retentionRate ?? 0}%`} sub="últimos 30 días" />
                    <KpiCard label="Racha"          value={`${summary?.currentStreak ?? 0}`}  sub="días consecutivos" />
                </div>

                {/* Fila 1: Actividad diaria (2/3) + Distribución semanal (1/3) */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-[#1c1b19] border border-[#262523] rounded-xl p-5 flex flex-col">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-[#cdccca] tracking-widest uppercase">Actividad Diaria</p>
                            <p className="text-[0.65rem] text-[#797876] tracking-widest uppercase mt-0.5">Últimos 7 días — minutos de enfoque</p>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#7c54d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#7c54d4" stopOpacity={0}   />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262523" />
                                <XAxis dataKey="name" tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="min" stroke="#a86fdf" strokeWidth={2} fill="url(#gradDaily)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#1c1b19] border border-[#262523] rounded-xl p-5 flex flex-col">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-[#cdccca] tracking-widest uppercase">Distribución Semanal</p>
                            <p className="text-[0.65rem] text-[#797876] tracking-widest uppercase mt-0.5">Últimas 4 semanas — minutos totales</p>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262523" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                <Bar dataKey="min" fill="#5c3fa8" radius={[4, 4, 0, 0]} activeBar={{ fill: '#7c54d4' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fila 2: Mapa de calor (2/3) + Análisis IA (1/3) */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-[#1c1b19] border border-[#262523] rounded-xl p-5">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-[#cdccca] tracking-widest uppercase">Mapa de Calor Mensual</p>
                            <p className="text-[0.65rem] text-[#797876] tracking-widest uppercase mt-0.5">
                                {now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}
                            </p>
                        </div>
                        <HeatmapGrid data={heatmap} />
                        <div className="heatmap-legend">
                            {INTENSITY_COLORS.map((c, i) => (
                                <div key={i} className="legend-item">
                                    <div className="legend-dot" style={{ background: c }} />
                                    <span>{i === 0 ? 'Sin actividad' : i === 4 ? 'Máximo' : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#201f1d] border border-[#393836] rounded-xl p-5 flex flex-col gap-3">
                        <span className="text-[0.65rem] text-[#a86fdf] tracking-widest font-semibold uppercase">Análisis IA</span>
                        {insight ? (
                            <>
                                <p className="text-sm text-[#cdccca] leading-relaxed flex-1">{insight.summary}</p>
                                {insight.bestDay && (
                                    <p className="text-xs text-[#a86fdf]">Mejor día: {insight.bestDay}</p>
                                )}
                                {insight.recommendation && (
                                    <p className="text-[0.7rem] text-[#797876] italic leading-relaxed">{insight.recommendation}</p>
                                )}
                                <span className="text-[0.7rem] text-[#5a5957]">Semana del {insight.weekStart}</span>
                            </>
                        ) : (
                            <p className="text-sm text-[#5a5957]">Sin análisis disponible esta semana.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
