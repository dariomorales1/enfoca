import React from 'react';
import MainLayout from '../layouts/MainLayout';
import MainTimerCard from '../components/timer/MainTimerCard';

export default function PomodoroPage() {
    return (
        <MainLayout>
            <div className="h-full flex flex-col text-white font-sans selection:bg-violet-500/30">

                {/* --- HEADER --- */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4">
                    <h1 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                        Active_Terminal
                    </h1>
                    <div className="hidden md:flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span className="text-violet-400 cursor-pointer">Focus_Session</span>
                        <span className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">Library</span>
                        <span className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">Metrics</span>
                    </div>
                </div>

                {/* --- GRILLA PRINCIPAL --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-grow">

                    {/* --- COLUMNA IZQUIERDA --- */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        {/* CARD RELOJ */}
                        <MainTimerCard />

                        {/* GRILLA INFERIOR: AUDIO & PERFORMANCE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* AUDIO ENGINE CARD */}
                            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4">
                                <h2 className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                    <div className="w-1 h-2.5 bg-violet-500 rounded-full"></div>
                                    Audio_Engine
                                </h2>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border border-neutral-700 bg-neutral-900/50 p-2 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">🌧️</span>
                                            <span className="text-[10px] font-mono tracking-widest">SOFT_RAIN</span>
                                        </div>
                                        <div className="w-16 h-1 bg-neutral-800 rounded-full relative">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-violet-500 rounded-full"></div>
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-violet-400 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border border-neutral-800 p-2 rounded-xl opacity-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">〰️</span>
                                            <span className="text-[10px] font-mono tracking-widest">WHITE_NOISE</span>
                                        </div>
                                        <span className="text-[10px]">▶</span>
                                    </div>
                                </div>
                            </div>

                            {/* PERFORMANCE INDEX CARD */}
                            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col">
                                <h2 className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-2 flex items-center gap-2">
                                    <div className="w-1 h-2.5 bg-violet-500 rounded-full"></div>
                                    Performance_Index
                                </h2>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-light tabular-nums">92.0</span>
                                    <span className="text-violet-500 font-mono text-xs">%</span>
                                </div>
                                <div className="flex items-end gap-1.5 h-10 mt-2">
                                    {[20, 30, 40, 80, 60, 20].map((h, i) => (
                                        <div key={i} style={{ height: `${h}%` }} className={`w-full rounded-sm ${h > 50 ? 'bg-[#9d84fd]' : 'bg-neutral-800'}`}></div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA --- */}
                    <div className="lg:col-span-4 flex flex-col gap-5 self-stretch">

                        {/* JOB QUEUE CARD */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col flex-grow lg:h-0 lg:min-h-0 overflow-hidden">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <h2 className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase">Job_Queue</h2>
                                <button className="w-5 h-5 rounded border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 hover:bg-neutral-800 transition-colors">+</button>
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-1 flex-grow min-h-0 custom-scrollbar">
                                <div className="border border-neutral-700 bg-neutral-900/30 p-3 rounded-xl flex gap-3">
                                    <div className="w-3.5 h-3.5 rounded border border-violet-500 bg-violet-500/20 mt-0.5"></div>
                                    <h3 className="text-xs font-medium text-neutral-200">Cognitive Psychology Review</h3>
                                </div>
                            </div>

                            <div className="mt-4 border border-neutral-800 p-3 rounded-xl bg-black/50 flex-shrink-0">
                                <p className="text-[10px] font-mono text-neutral-500 italic leading-tight">
                                    "// Focus is the new IQ."
                                </p>
                            </div>
                        </div>

                        {/* RUNTIME METRICS CARD */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex-shrink-0">
                            <h2 className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase mb-4">Runtime_Metrics</h2>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full border-2 border-neutral-800 flex items-center justify-center">
                                    <span className="text-[20px] font-medium text-white">75%</span>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white">3H 20M ACTIVE</h3>
                                    <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Goal: 60m rem</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}