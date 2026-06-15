// src/pages/AnalyticsPage.jsx
import { useEffect, useState } from 'react';
import { metricsService } from '../services/api.jsx';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// ── Heatmap helpers ──────────────────────────────────────────────
const INTENSITY_COLORS = ['#1a1a2e', '#3b2f6e', '#5c3fa8', '#7c54d4', '#a86fdf'];

function HeatmapGrid({ data }) {
    if (!data?.length) {
        return <div className="text-[0.8rem] text-neutral-500 py-2 font-mono uppercase tracking-widest">// Sin datos este mes</div>;
    }
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-1.5 sm:gap-1">
            {data.map((entry) => (
                <div
                    key={entry.date}
                    className="w-[18px] h-[18px] rounded-[3px] transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ background: INTENSITY_COLORS[entry.intensity ?? 0] }}
                    title={`${entry.date} — ${entry.focusedMinutes} min`}
                />
            ))}
        </div>
    );
}

// ── Tooltip custom ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#201f1d] border border-neutral-700 rounded-lg py-2 px-3 shadow-xl">
            <p className="text-[0.7rem] text-neutral-400 mb-1">{label}</p>
            <p className="text-[0.95rem] font-semibold text-violet-400">{payload[0].value} min</p>
        </div>
    );
}

// ── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ label, value, sub }) {
    return (
        // Reducimos el padding en móvil (p-3) y lo subimos en tablet/desktop (sm:p-4)
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1 sm:mb-2">{label}</span>
            {/* Fuente dinámica para que los números grandes no rompan la caja en móvil */}
            <span className="text-2xl sm:text-3xl font-light text-violet-400 tabular-nums">{value}</span>
            {sub && <span className="text-[9px] sm:text-[10px] text-neutral-600 mt-1 font-mono">{sub}</span>}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [daily, setDaily] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            // Quitamos min-h-screen y paddings fijos. Delegamos layout padre.
            <div className="w-full flex flex-col gap-6 sm:gap-8">
                <div className="animate-pulse bg-neutral-800/50 h-8 w-[200px] rounded-lg" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse bg-neutral-800/50 h-[90px] sm:h-[100px] rounded-xl" />
                    ))}
                </div>
                <div className="animate-pulse bg-neutral-800/50 h-[250px] rounded-xl w-full" />
            </div>
        );
    }

    const hoursTotal = summary ? (summary.focusedMinutesTotal / 60).toFixed(1) : '—';
    const hoursWeek = summary ? (summary.focusedMinutesWeek / 60).toFixed(1) : '—';

    return (
        // Quitamos min-h-screen y paddings rígidos, reemplazándolos con el flujo w-full y gaps
        <div className="w-full flex flex-col gap-6 sm:gap-8 text-white">

            {/* ── Header ── */}
            <div className="flex flex-col border-b border-neutral-800 pb-3 sm:pb-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Analytics</h1>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
                    Performance Overview
                </span>
            </div>

            {/* ── KPIs ── */}
            {/* 2 columnas en móvil, 4 en pantallas grandes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <KpiCard label="HOURS TOTAL" value={hoursTotal} sub="Acumulado" />
                <KpiCard label="HOURS / WEEK" value={hoursWeek} sub="Esta semana" />
                <KpiCard label="RETENTION" value={`${summary?.retentionRate ?? 0}%`} sub="Últimos 30 días" />
                <KpiCard label="STREAK" value={`${summary?.currentStreak ?? 0}`} sub="Días consecutivos" />
            </div>

            {/* ── Gráficos Contenedor ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* ── Gráfico línea — 7 días ── */}
                {/* Padding dinámico p-4 sm:p-6 para ganar espacio en móvil */}
                <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col mb-4 sm:mb-6">
                        <span className="text-sm font-semibold text-white">ACTIVIDAD DIARIA</span>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Últimos 7 días — Minutos de enfoque</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c54d4" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#7c54d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#797876', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#797876', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="min" stroke="#a86fdf" strokeWidth={2} fill="url(#gradDaily)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Gráfico barras — 4 semanas ── */}
                <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col mb-4 sm:mb-6">
                        <span className="text-sm font-semibold text-white">DISTRIBUCIÓN SEMANAL</span>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Últimas 4 semanas — Minutos totales</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#797876', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#797876', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="min" fill="#5c3fa8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Heatmap ── */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col mb-4 sm:mb-6">
                    <span className="text-sm font-semibold text-white">HEATMAP MENSUAL</span>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                        {now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                    </span>
                </div>

                <HeatmapGrid data={heatmap} />

                {/* Heatmap Legend: Añadido flex-wrap para que se acomode si la pantalla es muy chica */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 sm:mt-4">
                    {INTENSITY_COLORS.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500">
                                {i === 0 ? 'Vacío' : i === 4 ? 'Máx' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── AI Insight ── */}
            {insight && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="text-[9px] font-mono bg-violet-600 text-white px-2 py-0.5 rounded w-fit uppercase tracking-widest shadow-sm shadow-violet-500/20">
                        AI_Insight
                    </div>
                    <p className="text-sm text-neutral-200 mt-1 leading-relaxed">{insight.insightText}</p>
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 mt-1 sm:mt-2">
                        Semana del {insight.weekStart}
                    </span>
                </div>
            )}

        </div>
    );
}