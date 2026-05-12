import './AnalyticsPage.css';
import { metricsService } from '../services/api.jsx';
import { useEffect, useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';


// ── Heatmap helpers ──────────────────────────────────────────────
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

// ── Tooltip custom ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="tooltip-label">{label}</p>
            <p className="tooltip-value">{payload[0].value} min</p>
        </div>
    );
}

// ── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ label, value, sub }) {
    return (
        <div className="kpi-card">
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">{value}</span>
            {sub && <span className="kpi-sub">{sub}</span>}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────
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
        <div className="analytics-loading">
            <div className="skeleton skeleton-heading" />
            <div className="skeleton-row">
                {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-kpi" />)}
            </div>
            <div className="skeleton skeleton-chart" />
        </div>
    );

    const hoursTotal = summary ? (summary.focusedMinutesTotal / 60).toFixed(1) : '—';
    const hoursWeek  = summary ? (summary.focusedMinutesWeek  / 60).toFixed(1) : '—';

    return (
        <div className="analytics-page">

            {/* ── Header ── */}
            <div className="analytics-header">
                <h1 className="analytics-title">Analytics</h1>
                <span className="analytics-sub">PERFORMANCE OVERVIEW</span>
            </div>

            {/* ── KPIs ── */}
            <div className="kpi-grid">
                <KpiCard label="HOURS TOTAL"   value={hoursTotal}                        sub="acumulado" />
                <KpiCard label="HOURS / WEEK"  value={hoursWeek}                         sub="esta semana" />
                <KpiCard label="RETENTION"     value={`${summary?.retentionRate ?? 0}%`} sub="últimos 30 días" />
                <KpiCard label="STREAK"        value={`${summary?.currentStreak ?? 0}`}  sub="días consecutivos" />
            </div>

            {/* ── Gráfico línea — 7 días ── */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <span className="chart-title">ACTIVIDAD DIARIA</span>
                    <span className="chart-sub">ÚLTIMOS 7 DÍAS — MINUTOS DE ENFOQUE</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
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

            {/* ── Gráfico barras — 4 semanas ── */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <span className="chart-title">DISTRIBUCIÓN SEMANAL</span>
                    <span className="chart-sub">ÚLTIMAS 4 SEMANAS — MINUTOS TOTALES</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262523" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#797876', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="min" fill="#5c3fa8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Heatmap ── */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <span className="chart-title">HEATMAP MENSUAL</span>
                    <span className="chart-sub">
            {now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}
          </span>
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

            {/* ── AI Insight ── */}
            {insight && (
                <div className="insight-card">
                    <div className="insight-badge">AI INSIGHT</div>
                    <p className="insight-text">{insight.insightText}</p>
                    <span className="insight-week">Semana del {insight.weekStart}</span>
                </div>
            )}

        </div>
    );
}