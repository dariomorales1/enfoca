import React from 'react';
import {Link} from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="flex-1 bg-black text-white overflow-y-auto selection:bg-violet-500/30 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">

                {/* Hero */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
                    <div className="flex flex-col md:flex-row lg:flex-col gap-8 md:gap-12 lg:gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-bold tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"/>
                                Nueva era del estudio
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                                Domina el arte del <br/>
                                <span className="text-violet-500">enfoque profundo.</span>
                            </h1>
                        </div>

                        <div className="flex-1 space-y-6 md:pt-10 lg:pt-0">
                            <p className="text-neutral-400 text-lg max-w-md leading-relaxed">
                                Enfoca transforma el caos académico en claridad cognitiva. Herramientas técnicas para estados de flujo y rigor intelectual.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link to="/register"
                                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                    Comenzar <span className="text-lg">→</span>
                                </Link>
                                <button className="px-6 py-3 rounded-lg font-medium border border-neutral-700 hover:bg-neutral-900 transition-colors">
                                    Metodología
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[400px] w-full rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center">
                        <img
                            src="/landingImage.png"
                            alt="Estudiante enfocado"
                            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-50"
                        />
                        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-4 shadow-2xl flex items-center gap-4">
                            <div className="bg-violet-500/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Sesión Activa</p>
                                <p className="text-xl font-bold font-mono">24:59</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logos */}
                <section className="border-y border-neutral-900 py-12 mb-32 flex flex-col items-center">
                    <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-8">
                        Validado por instituciones de alto rendimiento
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale font-bold text-xl tracking-widest">
                        <span>STANFORD</span>
                        <span>MIT</span>
                        <span>OXFORD</span>
                        <span>HARVARD</span>
                        <span>ESADE</span>
                    </div>
                </section>

                {/* Features */}
                <section className="mb-32">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-4">Diseñado para el rigor cognitivo</h2>
                        <p className="text-neutral-400">Eliminamos las distracciones para que puedas enfocarte en lo que realmente importa: el crecimiento intelectual.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                        <div className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center">
                            <div className="relative z-10 w-2/3">
                                <h3 className="text-xl font-bold mb-4">Ciclos de Enfoque Profundo</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Basado en la técnica Pomodoro avanzada, adaptamos los intervalos a tu nivel de fatiga cognitiva detectada en tiempo real.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none">
                                <div className="w-full h-full bg-gradient-to-r from-[#0a0a0a] to-transparent absolute inset-0 z-10"/>
                                <img src="/pomodoro-bg.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-[#1e1b4b] border border-[#4a289b] rounded-2xl p-8 flex flex-col justify-between">
                            <div className="flex justify-end">
                                <img src="/landingBook.png" alt="Libro abierto" className="w-15 h-15 object-cover opacity-50"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3 text-white">Planes de Estudio con IA</h3>
                                <p className="text-sm text-violet-200 leading-relaxed">
                                    Analizamos tu programa de estudios para generar una ruta optimizada basada en repetición espaciada y carga cognitiva.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="bg-violet-500/20 text-violet-500 p-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">Certificación Digital</h3>
                            </div>
                            <p className="text-sm text-neutral-400 relative z-10">
                                Valida tus horas de concentración con credenciales criptográficas que demuestran tu disciplina ante terceros.
                            </p>
                            <div className="absolute bottom-[-20px] right-4 text-9xl opacity-5 text-white">★</div>
                        </div>

                        <div className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-8 flex items-center justify-between">
                            <div className="max-w-xs">
                                <h3 className="text-xl font-bold mb-3">Gamificación de Alto Nivel</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Convierte el esfuerzo mental en progreso tangible con un sistema de rango académico basado en mérito y constancia real.
                                </p>
                            </div>
                            <div className="hidden sm:block border border-neutral-800 bg-black rounded-lg p-4 w-48 text-center shadow-xl">
                                <p className="text-[10px] text-neutral-500 tracking-widest font-bold mb-2">NIVEL 42 — MAGÍSTER</p>
                                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 w-[70%] rounded-full"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="mb-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-neutral-900 pt-12">
                    <div>
                        <h4 className="text-5xl font-bold mb-2">+45%</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Eficiencia de Retención</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[45%] rounded-full"/>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-5xl font-bold mb-2">2.4k</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Horas de Enfoque / Mes</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[70%] rounded-full"/>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-5xl font-bold mb-2">98%</h4>
                        <p className="text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Tasa de Cumplimiento de Metas</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[98%] rounded-full"/>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#050505] border border-neutral-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden mb-0 shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-violet-900/10 blur-[100px] pointer-events-none"/>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            ¿Listo para elevar tu estándar académico?
                        </h2>
                        <p className="text-neutral-400 mb-10 text-lg">
                            Únete a la comunidad técnica de Enfoca y desata el verdadero potencial de tu mente. Sin distracciones, solo alto rendimiento.
                        </p>
                        <Link to="/register"
                              className="inline-block bg-white text-black hover:bg-neutral-200 font-bold px-8 py-4 rounded-xl transition-colors">
                            Comienza gratis hoy
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
