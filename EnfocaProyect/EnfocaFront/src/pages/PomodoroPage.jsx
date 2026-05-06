import React from 'react';
// Importamos el reloj que ya construimos
import MainTimerCard from '../components/timer/MainTimerCard';

export default function FocusModePage() {
    return (
        // Contenedor principal de la página (El Sidebar y el Header globales irán por fuera en el Layout)
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10 font-sans selection:bg-violet-500/30">

            {/* Header específico de esta vista (ACTIVE_TERMINAL) */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
                <h1 className="text-xs font-mono text-neutral-400 tracking-widest uppercase">
                    Active_Terminal
                </h1>
                <div className="hidden md:flex gap-6 text-xs font-mono tracking-widest uppercase">
                    <span className="text-violet-400 cursor-pointer">Focus_Session</span>
                    <span
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">Library</span>
                    <span
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">Metrics</span>
                </div>
            </div>

            {/* Grilla Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- COLUMNA IZQUIERDA (Reloj + Paneles inferiores) --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Componente del Reloj (El que ya programamos) */}
                    <MainTimerCard/>

                    {/* Grilla inferior (Audio Engine & Performance Index) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Audio Engine Card */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6">
                            <h2 className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-6 flex items-center gap-2">
                                <div className="w-1 h-3 bg-violet-500 rounded-full"></div>
                                Audio_Engine
                            </h2>

                            <div className="space-y-3">
                                {/* Opción activa */}
                                <div
                                    className="flex items-center justify-between border border-neutral-700 bg-neutral-900/50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-violet-400">🌧️</span>
                                        <span className="text-xs font-mono tracking-widest">SOFT_RAIN</span>
                                    </div>
                                    {/* Slider simulado */}
                                    <div className="w-20 h-1 bg-neutral-800 rounded-full relative">
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-violet-500 rounded-full"></div>
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Otras opciones */}
                                <div
                                    className="flex items-center justify-between border border-neutral-800 hover:border-neutral-700 p-3 rounded-xl cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3 opacity-50">
                                        <span>〰️</span>
                                        <span className="text-xs font-mono tracking-widest">WHITE_NOISE</span>
                                    </div>
                                    <span className="text-neutral-600">▶</span>
                                </div>
                                <div
                                    className="flex items-center justify-between border border-neutral-800 hover:border-neutral-700 p-3 rounded-xl cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3 opacity-50">
                                        <span>🌲</span>
                                        <span className="text-xs font-mono tracking-widest">FOREST_ATM</span>
                                    </div>
                                    <span className="text-neutral-600">▶</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Index Card */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 flex flex-col">
                            <h2 className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                <div className="w-1 h-3 bg-violet-500 rounded-full"></div>
                                Performance_Index
                            </h2>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-light tabular-nums">92.0</span>
                                <span className="text-violet-500 font-mono">%</span>
                            </div>
                            <p className="text-xs text-neutral-500 italic mb-auto">
                                // Concentration peak detected at interval: 10:00 - 11:00.
                            </p>

                            {/* Gráfico de barras simulado */}
                            <div className="flex items-end gap-2 h-16 mt-4">
                                <div className="w-1/6 bg-neutral-800 rounded-sm h-[20%]"></div>
                                <div className="w-1/6 bg-neutral-800 rounded-sm h-[30%]"></div>
                                <div className="w-1/6 bg-[#4a357a] rounded-sm h-[40%]"></div>
                                <div className="w-1/6 bg-[#9d84fd] rounded-sm h-[80%]"></div>
                                <div className="w-1/6 bg-[#7c5ff0] rounded-sm h-[60%]"></div>
                                <div className="w-1/6 bg-neutral-800 rounded-sm h-[20%]"></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- COLUMNA DERECHA (Queue + Metrics) --- */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Job Queue Card */}
                    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">Job_Queue</h2>
                            <button
                                className="w-6 h-6 rounded border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                +
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Tarea Activa */}
                            <div className="border border-neutral-700 bg-neutral-900/30 p-4 rounded-xl flex gap-3">
                                <div className="mt-1">
                                    <div
                                        className="w-4 h-4 rounded border border-violet-500 flex items-center justify-center bg-violet-500/20">
                                        <div className="w-2 h-2 bg-violet-400 rounded-sm"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Literature Review: Cognitive
                                        Psychology</h3>
                                    <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Status:
                                        In_Progress</p>
                                </div>
                            </div>

                            {/* Tarea Pendiente */}
                            <div className="border border-transparent p-4 flex gap-3 opacity-60">
                                <div className="mt-1">
                                    <div className="w-4 h-4 rounded border border-neutral-700"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-300 mb-2">Refine Research
                                        Methodology</h3>
                                    <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Queued</p>
                                </div>
                            </div>

                            {/* Tarea Completada */}
                            <div className="border border-transparent p-4 flex gap-3 opacity-30 line-through">
                                <div className="mt-1">
                                    <div
                                        className="w-4 h-4 rounded border border-neutral-600 flex items-center justify-center">
                                        ✓
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-400 mb-2">Bibliography sync with
                                        Zotero</h3>
                                </div>
                            </div>
                        </div>

                        {/* Quote inferior */}
                        <div className="mt-8 border border-neutral-800 p-4 rounded-xl bg-black/50">
                            <p className="text-xs font-mono text-neutral-500 italic leading-relaxed">
                                "// Concentration is the root of all higher abilities."
                            </p>
                        </div>
                    </div>

                    {/* Runtime Metrics Card */}
                    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6">
                        <h2 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase mb-6">Runtime_Metrics</h2>

                        <div className="flex items-center gap-6">
                            {/* Círculo de progreso simulado */}
                            <div
                                className="relative w-16 h-16 rounded-full border-[3px] border-neutral-800 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3"
                                            fill="transparent" className="text-[#9d84fd]" strokeDasharray="188"
                                            strokeDashoffset="47"/>
                                </svg>
                                <span className="text-xs font-bold text-white relative z-10">75%</span>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">3H 20M ACTIVE</h3>
                                <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Rem_to_goal:
                                    60m</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}