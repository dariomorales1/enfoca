import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';
import api from '../../services/api';

// ─────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────

function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start * 10) / 10);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// ─────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────

function KPICard({ label, value, unit, badge, icon, trend }) {
    const animated = useCountUp(typeof value === 'number' ? value : 0);
    return (
        <div className="bg-[#111] border border-white/8 rounded-lg p-4 flex flex-col gap-2 hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase">
                    {label}
                </span>
                <span className="text-gray-600">{icon}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold tabular-nums text-white leading-none">
                    {typeof value === 'number' ? animated : value}
                </span>
                {unit && (
                    <span className="text-gray-500 text-sm mb-0.5">{unit}</span>
                )}
                {badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300 mb-0.5 tracking-wider">
                        {badge}
                    </span>
                )}
            </div>
            {trend && (
                <span className="text-[11px] text-emerald-400 font-medium">{trend}</span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Focus Timer (Pomodoro)
// ─────────────────────────────────────────

const POMODORO_SECS = 25 * 60;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function FocusTimer({ sessionLabel = 'Quantum_Phy_L4', totalCycles = 4 }) {
    const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECS);
    const [running, setRunning] = useState(false);
    const [cycle, setCycle] = useState(1);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft(s => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        setCycle(c => Math.min(c + 1, totalCycles));
                        return POMODORO_SECS;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, totalCycles]);

    const progress = secondsLeft / POMODORO_SECS;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    const handleToggle = () => setRunning(r => !r);
    const handleReset = () => { setRunning(false); setSecondsLeft(POMODORO_SECS); };

    return (
        <div className="bg-[#111] border border-white/8 rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase">
                    Focus Engine
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="17" y2="18"/>
                </svg>
            </div>

            {/* Círculo SVG */}
            <div className="flex justify-center">
                <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        {/* Track */}
                        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#ffffff0f" strokeWidth="4"/>
                        {/* Progreso */}
                        <circle
                            cx="60" cy="60" r={RADIUS}
                            fill="none"
                            stroke={running ? '#7c3aed' : '#4b5563'}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-2xl font-bold tabular-nums text-white tracking-tight">
                            {formatTime(secondsLeft)}
                        </span>
                        <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase ${running ? 'text-violet-400' : 'text-gray-500'}`}>
                            {running ? 'FOCUSING' : 'IDLE_MODE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Botón principal */}
            <button
                onClick={handleToggle}
                className={`w-full py-2.5 rounded-md text-sm font-bold tracking-widest transition-all duration-150 flex items-center justify-center gap-2
                    ${running
                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                        : 'bg-white text-black hover:bg-gray-100 active:bg-gray-200'
                    }`}
            >
                {running ? (
                    <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        PAUSE FOCUS
                    </>
                ) : (
                    <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                        INITIATE FOCUS
                    </>
                )}
            </button>

            {/* Metadata */}
            <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-mono truncate">Session: {sessionLabel}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {Array.from({ length: totalCycles }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i < cycle ? 'bg-violet-500' : 'bg-white/10'
                            }`}
                        />
                    ))}
                    <span className="ml-1">{String(cycle).padStart(2,'0')}/{String(totalCycles).padStart(2,'0')} Cycles</span>
                </div>
            </div>

            {/* Reset */}
            {(secondsLeft < POMODORO_SECS || running) && (
                <button
                    onClick={handleReset}
                    className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors text-center"
                >
                    Reset timer
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Weekly Chart (barras SVG nativas)
// ─────────────────────────────────────────

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function WeeklyChart({ data }) {
    const today = new Date().getDay(); // 0=Dom, 1=Lun...
    const todayIdx = today === 0 ? 6 : today - 1;
    const max = Math.max(...data, 1);

    return (
        <div className="bg-[#111] border border-white/8 rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase">
                        Weekly Intensity Distribution
                    </p>
                    <p className="text-[10px] text-gray-700 mt-0.5 tracking-wider uppercase">
                        Measured in Focus Cycles per Interval
                    </p>
                </div>
                <div className="flex gap-1.5">
                    {['W-AVG', 'RAW'].map(label => (
                        <button
                            key={label}
                            className="text-[10px] font-semibold px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors tracking-wider"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Barras */}
            <div className="flex items-end gap-2 h-28">
                {data.map((val, i) => {
                    const heightPct = (val / max) * 100;
                    const isToday = i === todayIdx;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <div className="w-full flex items-end justify-center" style={{ height: '88%' }}>
                                <div
                                    className={`w-full rounded-sm transition-all duration-700 ${
                                        isToday ? 'bg-violet-500' : 'bg-white/10'
                                    }`}
                                    style={{ height: `${heightPct}%`, minHeight: val > 0 ? '4px' : '0' }}
                                />
                            </div>
                            <span className={`text-[9px] font-semibold tracking-wider ${
                                isToday ? 'text-violet-400' : 'text-gray-600'
                            }`}>
                                {DAYS[i]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// Curriculum Card
// ─────────────────────────────────────────

function CurriculumCard({ code, name, efficiency, topic, color = '#6366f1' }) {
    return (
        <div className="bg-[#111] border border-white/8 rounded-lg p-4 flex flex-col gap-3 hover:border-white/15 transition-colors">
            <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color }}>
                    {code}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
            </div>
            <p className="text-sm font-semibold text-white leading-tight">{name}</p>
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] tracking-widest text-gray-600 uppercase">Efficiency</span>
                    <span className="text-[11px] font-bold tabular-nums text-gray-300">{efficiency}%</span>
                </div>
                <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${efficiency}%`, backgroundColor: color }}
                    />
                </div>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                <span className="text-gray-500">Topic: </span>{topic}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────
// DashboardPage principal
// ─────────────────────────────────────────

export default function DashboardPage() {
    const { user } = useContext(AuthContext);

    // Estado: métricas (vendrán del metrics-service cuando esté listo)
    const [metrics, setMetrics] = useState({
        hoursFocused: 0,
        deepWorkXP: 0,
        retentionRate: 0,
        activeStreak: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        curriculum: [],
        loading: true,
    });

    useEffect(() => {
        // Cuando el metrics-service (puerto 8086) esté disponible,
        // reemplaza este bloque con llamadas reales:
        //   const { data } = await api.get('/metrics/summary');
        // Por ahora usamos datos mock para desarrollo del UI.
        const mockLoad = setTimeout(() => {
            setMetrics({
                hoursFocused: 124.5,
                deepWorkXP: 2450,
                retentionRate: 92,
                activeStreak: 12,
                weeklyData: [3, 5, 7, 4, 6, 2, 1],
                curriculum: [
                    { code: 'MTH-402', name: 'Multivariable Integration', efficiency: 75,
                      topic: 'Triple integrals in spherical coordinates and vector fields.', color: '#818cf8' },
                    { code: 'BIO-612', name: 'CRISPR Gene Editing', efficiency: 43,
                      topic: 'Analysis of CAS9 molecular sequencing and target binding.', color: '#34d399' },
                    { code: 'HIS-101', name: 'Industrial Revolution', efficiency: 88,
                      topic: 'Socioeconomic shift and mechanization in 19th-century Europe.', color: '#fb923c' },
                ],
                loading: false,
            });
        }, 600);
        return () => clearTimeout(mockLoad);
    }, []);

    const displayName = user?.firstName || user?.username || 'Student';

    if (metrics.loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"/>
                    <span className="text-xs tracking-widest uppercase">Loading metrics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-black">

            {/* ── Top bar ── */}
            <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">Dashboard</span>
                    <span className="w-px h-4 bg-white/10"/>
                    <span className="text-xs text-gray-500">Active session: Quantum Physics</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-orange-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <span className="text-xs font-bold tracking-widest">{metrics.activeStreak} DAY STREAK</span>
                    </div>
                    <button className="text-gray-600 hover:text-white transition-colors" aria-label="Buscar">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>
                    <button className="text-gray-600 hover:text-white transition-colors" aria-label="Notificaciones">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                </div>
            </header>

            {/* ── Contenido ── */}
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-5">

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KPICard
                        label="Hours Focused"
                        value={metrics.hoursFocused}
                        trend="▲ +12% this week"
                        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    />
                    <KPICard
                        label="Deep Work XP"
                        value={metrics.deepWorkXP}
                        badge="LVL 24"
                        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>}
                    />
                    <KPICard
                        label="Retention Rate"
                        value={metrics.retentionRate}
                        unit="%"
                        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                    />
                    <KPICard
                        label="Active Streak"
                        value={metrics.activeStreak}
                        unit="days"
                        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                    />
                </div>

                {/* Gráfico + Timer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2">
                        <WeeklyChart data={metrics.weeklyData} />
                    </div>
                    <div>
                        <FocusTimer sessionLabel="Quantum_Phy_L4" totalCycles={4} />
                    </div>
                </div>

                {/* Active Curriculum */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm font-semibold text-white tracking-wide">Active Curriculum</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">Core study plans and modular progress</p>
                        </div>
                        <button className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 tracking-wider">
                            VIEW REGISTRY
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {metrics.curriculum.map(course => (
                            <CurriculumCard key={course.code} {...course} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-auto pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                            <span className="text-[9px] font-bold text-gray-400">E</span>
                        </div>
                        <span className="text-[10px] text-gray-600 tracking-[0.2em] uppercase">Enfoca OS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {['MANIFESTO', 'ARCHITECTURE', 'NODES'].map(link => (
                            <button key={link} className="text-[10px] text-gray-700 hover:text-gray-400 tracking-widest transition-colors">
                                {link}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono tracking-wider">
                        V2.4.0-STABLE // BUILD_804471
                    </span>
                </footer>
            </div>
        </div>
    );
}