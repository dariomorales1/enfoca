import React from 'react';
import {Link} from 'react-router-dom';

export default function LandingPage() {
    return (
        // Agregamos pb-24 aquí para evitar que el Footer corte la última tarjeta
        <div className="flex-1 bg-black text-white overflow-y-auto selection:bg-violet-500/30 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">

                {/* --- HERO SECTION --- */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">

                    {/* Izquierda: Texto */}
                    {/* flex-col en móvil, flex-row en tablet (md), y flex-col de nuevo en desktop (lg) */}
                    <div className="flex flex-col md:flex-row lg:flex-col gap-8 md:gap-12 lg:gap-8">

                        {/* Columna 1: Badge y Título */}
                        <div className="flex-1 space-y-6">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-bold tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                New Era of Studying
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                                Master the art of <br/>
                                <span className="text-violet-500">deep focus.</span>
                            </h1>
                        </div>

                        {/* Columna 2: Párrafo y Botones */}
                        {/* md:pt-10 alinea mejor el texto de la derecha con el título de la izquierda en tablets */}
                        <div className="flex-1 space-y-6 md:pt-10 lg:pt-0">
                            <p className="text-neutral-400 text-lg max-w-md leading-relaxed">
                                Enfoca transforms academic chaos into cognitive clarity. Technical tools for flow states
                                and intellectual rigor.
                            </p>

                            {/* flex-wrap previene que los botones se desborden en pantallas medianas ajustadas */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link to="/register"
                                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                    Get started <span className="text-lg">→</span>
                                </Link>
                                <button
                                    className="px-6 py-3 rounded-lg font-medium border border-neutral-700 hover:bg-neutral-900 transition-colors">
                                    Methodology
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Derecha: Imagen Hero */}
                    <div
                        className="relative h-[400px] w-full rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center">

                        {/* Imagen principal con object-top para priorizar el slogan superior */}
                        <img
                            src="/landingImage.png"
                            alt="Student focused"
                            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-50"
                        />

                        {/* Tarjeta Flotante "Sesión Activa" */}
                        <div
                            className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-4 shadow-2xl flex items-center gap-4">
                            <div className="bg-violet-500/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">
                                    Active Session
                                </p>
                                <p className="text-xl font-bold font-mono">24:59</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- LOGOS SECTION --- */}
                <section className="border-y border-neutral-900 py-12 mb-32 flex flex-col items-center">
                    <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-8">
                        Validated by high-performance institutions
                    </p>
                    <div
                        className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale font-bold text-xl tracking-widest">
                        <span>STANFORD</span>
                        <span>MIT</span>
                        <span>OXFORD</span>
                        <span>HARVARD</span>
                        <span>ESADE</span>
                    </div>
                </section>

                {/* --- BENTO GRID SECTION --- */}
                <section className="mb-32">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-4">Designed for cognitive rigor</h2>
                        <p className="text-neutral-400">We eliminate distractions so you can focus on what truly
                            matters: intellectual growth.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                        {/* Card 1 (Ancha) */}
                        <div
                            className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center">
                            <div className="relative z-10 w-2/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-xl font-bold">Deep Focus Cycles</h3>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Based on advanced Pomodoro technique, we adapt intervals to your cognitive fatigue
                                    level detected in real-time.
                                </p>
                            </div>
                            {/* Pomodoro Image bg */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none">
                                <div
                                    className="w-full h-full bg-gradient-to-r from-[#0a0a0a] to-transparent absolute inset-0 z-10"></div>
                                <img src="/pomodoro-bg.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                        </div>

                        {/* Card 2 (Alta, Morada) */}
                        <div
                            className="md:col-span-1 bg-[#1e1b4b] border border-[#4a289b] rounded-2xl p-8 flex flex-col justify-between">
                            <div className="flex justify-end">
                                {/* Corregido: removido 'flex justify-content-end' del img */}
                                <img
                                    src="/landingBook.png"
                                    alt="Open Book"
                                    className="w-15 h-15 object-cover opacity-50"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3 text-white">AI Study Plans</h3>
                                <p className="text-sm text-violet-200 leading-relaxed">
                                    We analyze your syllabus to generate an optimized study route based on spaced
                                    repetition and cognitive load.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 (Cuadrada) */}
                        <div
                            className="md:col-span-1 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="bg-violet-500/20 text-violet-500 p-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">Digital Certification</h3>
                            </div>
                            <p className="text-sm text-neutral-400 relative z-10">
                                Validate your concentration hours with cryptographic credentials that prove your
                                discipline to third parties.
                            </p>
                            <div className="absolute bottom-[-20px] right-4 text-9xl opacity-5 text-white">★</div>
                        </div>

                        {/* Card 4 (Ancha) */}
                        <div
                            className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 flex items-center justify-between">
                            <div className="max-w-xs">
                                <h3 className="text-xl font-bold mb-3">High-Level Gamification</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Turn mental effort into tangible progress with an academic rank system based on real
                                    merit and consistency.
                                </p>
                            </div>
                            <div
                                className="hidden sm:block border border-neutral-800 bg-black rounded-lg p-4 w-48 text-center shadow-xl">
                                <p className="text-[10px] text-neutral-500 tracking-widest font-bold mb-2">LEVEL 42 —
                                    MAGÍSTER</p>
                                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 w-[70%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- STATS SECTION --- */}
                <section className="mb-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-neutral-900 pt-12">
                    <div>
                        <h4 className="text-5xl font-bold mb-2">+45%</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Retention
                            Efficiency</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[45%] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-5xl font-bold mb-2">2.4k</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Focus Hours
                            / Month</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[70%] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-5xl font-bold mb-2">98%</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Goal
                            Completion Rate</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[98%] rounded-full"></div>
                        </div>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                {/* Cambiado: mb-0 porque el espacio inferior lo da el pb-24 del contenedor principal */}
                <section
                    className="bg-[#050505] border border-neutral-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden mb-0 shadow-2xl">
                    {/* Decorative gradients */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-violet-900/10 blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to elevate your
                            academic standard?</h2>
                        <p className="text-neutral-400 mb-10 text-lg">
                            Join the technical community of Enfoca and unleash your mind's true potential. No
                            distractions, just high performance.
                        </p>
                        <Link to="/register"
                              className="inline-block bg-white text-black hover:bg-neutral-200 font-bold px-8 py-4 rounded-xl transition-colors">
                            Start for free today
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}