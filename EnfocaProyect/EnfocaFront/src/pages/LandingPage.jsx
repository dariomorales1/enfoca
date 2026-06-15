import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="flex-1 bg-black text-white overflow-y-auto selection:bg-violet-500/30 pb-20 md:pb-24">
            {/* Ajuste de márgenes laterales: px-4 en móvil, px-6 en tablet, px-12 en desktop */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 md:pt-16">

                {/* Hero Section */}
                {/* Reducimos el margen inferior en móvil (mb-20) y lo subimos en desktop (md:mb-32) */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center mb-20 md:mb-32">
                    <div className="flex flex-col md:flex-row lg:flex-col gap-6 md:gap-12 lg:gap-8">
                        <div className="flex-1 space-y-4 md:space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"/>
                                Nueva era del estudio
                            </div>
                            {/* Tipografía escalable: 4xl móvil, 5xl tablet, 6xl escritorio */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                                Domina el arte del <br/>
                                <span className="text-violet-500">enfoque profundo.</span>
                            </h1>
                        </div>

                        <div className="flex-1 space-y-6 md:pt-10 lg:pt-0">
                            <p className="text-neutral-400 text-base sm:text-lg max-w-md leading-relaxed">
                                Enfoca transforma el caos académico en claridad cognitiva. Herramientas técnicas para estados de flujo y rigor intelectual.
                            </p>
                            {/* Botones expandidos en móvil (w-full) y lado a lado en sm */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
                                <Link to="/register"
                                      className="flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3.5 sm:py-3 rounded-lg font-medium transition-colors w-full sm:w-auto">
                                    Comenzar <span className="text-lg">→</span>
                                </Link>
                                <a href="#metodologia" className="text-center px-6 py-3.5 sm:py-3 rounded-lg font-medium border border-neutral-700 hover:bg-neutral-900 transition-colors w-full sm:w-auto">
                                    Metodología
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Imagen Hero: Altura menor en móvil (300px) y original en sm (400px) */}
                    <div className="relative h-[300px] sm:h-[400px] w-full rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center mt-6 lg:mt-0">
                        <img
                            src="/landingImage.png"
                            alt="Estudiante enfocado"
                            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-50"
                        />
                        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-2xl flex items-center gap-3 sm:gap-4">
                            <div className="bg-violet-500/20 p-2 rounded-lg">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Sesión Activa</p>
                                <p className="text-lg sm:text-xl font-bold font-mono">24:59</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logos */}
                <section className="border-y border-neutral-900 py-10 md:py-12 mb-20 md:mb-32 flex flex-col items-center">
                    <p className="text-[9px] sm:text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-6 md:mb-8 text-center">
                        Validado por instituciones de alto rendimiento
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-24 opacity-40 grayscale font-bold text-base sm:text-xl tracking-widest px-4">
                        <span>STANFORD</span>
                        <span>MIT</span>
                        <span>OXFORD</span>
                        <span>HARVARD</span>
                        <span>ESADE</span>
                    </div>
                </section>

                {/* Metodología */}
                <section id="metodologia" className="mb-20 md:mb-32 scroll-mt-8">
                    <div className="mb-10 md:mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"/>
                            Metodología
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Diseñado para el rigor cognitivo</h2>
                        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                            Enfoca combina las técnicas de estudio más efectivas respaldadas por la neurociencia con herramientas digitales de alto rendimiento. Nuestra metodología está basada en tres pilares fundamentales.
                        </p>
                    </div>

                    {/* Pilares */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 text-xl">⏱</div>
                            <h3 className="text-white font-bold mb-2">Deep Work</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">Bloques de enfoque intenso sin interrupciones, basados en el método Pomodoro extendido. De 25 a 50 minutos de concentración máxima seguidos de pausas estratégicas.</p>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 text-xl">🧠</div>
                            <h3 className="text-white font-bold mb-2">Planes de Estudio con IA</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">Generamos hojas de ruta personalizadas según tu materia, nivel y tiempo disponible. La inteligencia artificial estructura el contenido para una retención óptima a largo plazo.</p>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 text-xl">📊</div>
                            <h3 className="text-white font-bold mb-2">Análisis de Rendimiento</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">Métricas detalladas de tus sesiones, rachas activas y tasa de retención. Visualiza tu progreso y ajusta tu estrategia de estudio con datos reales.</p>
                        </div>
                    </div>

                    {/* Bento Grid: Liberamos la altura en móvil (auto-rows-auto) y mantenemos 280px desde md */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto md:auto-rows-[280px]">

                        <div className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center min-h-[220px] md:min-h-0">
                            {/* Ajuste de z-index y anchos para que el texto gane a la imagen en móvil */}
                            <div className="relative z-20 w-full sm:w-2/3">
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Ciclos de Enfoque Profundo</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Basado en la técnica Pomodoro avanzada, adaptamos los intervalos a tu nivel de fatiga cognitiva detectada en tiempo real.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-10 sm:opacity-30 pointer-events-none z-10">
                                <div className="w-full h-full bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 sm:via-transparent to-transparent absolute inset-0 z-10"/>
                                <img src="/pomodoro-bg.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-[#1e1b4b] border border-[#4a289b] rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[220px] md:min-h-0">
                            <div className="flex justify-end mb-4 md:mb-0">
                                <img src="/landingBook.png" alt="Libro abierto" className="w-12 h-12 sm:w-15 sm:h-15 object-cover opacity-50"/>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">Planes de Estudio</h3>
                                <p className="text-sm text-violet-200 leading-relaxed">
                                    Analizamos tu programa para generar una ruta optimizada basada en repetición espaciada.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-6 sm:p-8 relative overflow-hidden min-h-[220px] md:min-h-0">
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="bg-violet-500/20 text-violet-500 p-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold">Certificación Digital</h3>
                            </div>
                            <p className="text-sm text-neutral-400 relative z-10">
                                Valida tus horas de concentración con credenciales criptográficas ante terceros.
                            </p>
                            <div className="absolute bottom-[-20px] right-4 text-8xl sm:text-9xl opacity-5 text-white pointer-events-none">★</div>
                        </div>

                        <div className="md:col-span-2 bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-6 sm:p-8 flex items-center justify-between min-h-[220px] md:min-h-0">
                            <div className="max-w-full sm:max-w-xs">
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Gamificación de Alto Nivel</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Convierte el esfuerzo mental en progreso tangible con un sistema de rango académico basado en mérito y constancia real.
                                </p>
                            </div>
                            <div className="hidden sm:block border border-neutral-800 bg-black rounded-lg p-4 w-48 text-center shadow-xl flex-shrink-0">
                                <p className="text-[10px] text-neutral-500 tracking-widest font-bold mb-2">NIVEL 42 — MAGÍSTER</p>
                                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 w-[70%] rounded-full"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="mb-20 md:mb-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 border-t border-neutral-900 pt-10 md:pt-12">
                    <div className="text-center sm:text-left">
                        <h4 className="text-4xl sm:text-5xl font-bold mb-2">+45%</h4>
                        <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Eficiencia de Retención</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[45%] rounded-full"/>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="text-4xl sm:text-5xl font-bold mb-2">2.4k</h4>
                        <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Horas de Enfoque / Mes</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[70%] rounded-full"/>
                        </div>
                    </div>
                    <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
                        <h4 className="text-4xl sm:text-5xl font-bold mb-2">98%</h4>
                        <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-widest font-bold uppercase mb-4">Tasa de Cumplimiento</p>
                        <div className="h-1 w-full bg-neutral-900 rounded-full">
                            <div className="h-full bg-violet-600 w-[98%] rounded-full"/>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#050505] border border-neutral-800 rounded-3xl p-8 sm:p-12 md:p-20 text-center relative overflow-hidden mb-0 shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-violet-900/10 blur-[100px] pointer-events-none"/>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
                            ¿Listo para elevar tu estándar académico?
                        </h2>
                        <p className="text-neutral-400 mb-8 sm:mb-10 text-sm sm:text-lg">
                            Únete a la comunidad técnica de Enfoca y desata el verdadero potencial de tu mente. Sin distracciones, solo alto rendimiento.
                        </p>
                        <Link to="/register"
                              className="inline-block bg-white text-black hover:bg-neutral-200 font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl transition-colors w-full sm:w-auto">
                            Comienza gratis hoy
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}