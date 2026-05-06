import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import MainTimerCard from '../../components/timer/MainTimerCard';

export default function FocusModePage() {
    return (
        <MainLayout>
            {/* h-[calc(100vh-theme(spacing.16))] asegura que ocupe el alto disponible restando paddings */}
            <div
                className="h-full max-h-[calc(100vh-80px)] flex flex-col text-white font-sans selection:bg-violet-500/30 overflow-hidden">

                {/* Header (Mantenemos mb-4 para no apretar demasiado) */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4 flex-shrink-0">
                    <h1 className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                        Active_Terminal
                    </h1>
                    <div className="hidden md:flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span className="text-violet-400">Focus_Session</span>
                        <span className="text-neutral-500">Library</span>
                        <span className="text-neutral-500">Metrics</span>
                    </div>
                </div>

                {/* Grilla Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow overflow-hidden">

                    {/* COLUMNA IZQUIERDA (Alineada al 100% del ancho disponible) */}
                    <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                        <MainTimerCard/>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Audio Engine */}
                            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4">
                                <h2 className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                                    <div className="w-1 h-2.5 bg-violet-500 rounded-full"></div>
                                    Audio_Engine
                                </h2>
                                {/* ... contenido compacto ... */}
                            </div>

                            {/* Performance Index */}
                            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col">
                                <h2 className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-2 flex items-center gap-2">
                                    <div className="w-1 h-2.5 bg-violet-500 rounded-full"></div>
                                    Performance_Index
                                </h2>
                                {/* ... contenido compacto ... */}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (Comprimida verticalmente) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 h-100 overflow-hidden">

                        {/* Job Queue - Usamos flex-grow y overflow-auto para que no crezca más allá de la pantalla */}
                        <div
                            className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex-grow flex flex-col min-h-0">
                            <h2 className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase mb-4">Job_Queue</h2>

                            <div className="flex-grow overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {/* Tareas... */}
                                <div className="border border-neutral-700 bg-neutral-900/30 p-3 rounded-xl flex gap-3">
                                    <div
                                        className="w-3.5 h-3.5 rounded border border-violet-500 bg-violet-500/20 mt-0.5"></div>
                                    <h3 className="text-xs font-medium">Cognitive Psychology Review</h3>
                                </div>
                            </div>
                        </div>

                        {/* Runtime Metrics - Se mantiene al final sin ser empujado fuera */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex-shrink-0">
                            <h2 className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase mb-3">Runtime_Metrics</h2>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-[#9d84fd] flex items-center justify-center text-[10px] font-bold">75%
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white">3H 20M ACTIVE</h3>
                                    <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Goal:
                                        60m rem</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}