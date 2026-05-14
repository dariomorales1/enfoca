import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/api';
import Sidebar from '../components/common/Sidebar';

const AUTORES_MOCK = ['Alex M.', 'Sarah K.', 'David L.', 'María R.'];
const BG_MOCK      = ['from-amber-900/40', 'from-blue-900/40', 'from-emerald-900/40', 'from-orange-900/40'];
const MOCK_PLANES  = [
    { tag: 'ALTA DENSIDAD', titulo: 'Dominio del Cálculo III',      modulos: 12, rating: 4.9, bg: 'from-amber-900/40' },
    { tag: 'EXPLORATORIO',  titulo: 'Psicología Cognitiva 101',     modulos: 8,  rating: 4.7, bg: 'from-blue-900/40' },
    { tag: 'VÍA RÁPIDA',    titulo: 'Estructuras de Datos',         modulos: 15, rating: 4.8, bg: 'from-emerald-900/40' },
    { tag: 'COMPRENSIVO',   titulo: 'Estática Arquitectónica',      modulos: 20, rating: 5.0, bg: 'from-orange-900/40' },
    { tag: 'INTENSIVO',     titulo: 'Álgebra Lineal Avanzada',      modulos: 10, rating: 4.6, bg: 'from-violet-900/40' },
    { tag: 'EXPLORATORIO',  titulo: 'Introducción a la Filosofía',  modulos: 6,  rating: 4.5, bg: 'from-rose-900/40' },
    { tag: 'VÍA RÁPIDA',    titulo: 'Física Cuántica Básica',       modulos: 9,  rating: 4.8, bg: 'from-cyan-900/40' },
    { tag: 'COMPRENSIVO',   titulo: 'Historia del Arte Moderno',    modulos: 14, rating: 4.4, bg: 'from-amber-900/40' },
];

const UserIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

export default function LibraryPage() {
    const navigate = useNavigate();
    const [catalogo, setCatalogo] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        planService.catalogo()
            .then(r => setCatalogo(r.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const abrirPlan = (plan) => {
        navigate('/study-plan', { state: { planSeleccionado: plan } });
    };

    const planesToMostrar = catalogo.length > 0 ? catalogo : null;

    return (
        <div className="flex h-screen bg-[#0c0c0c] overflow-hidden">
            <Sidebar />

            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col gap-8">

                {/* Comunidad */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Biblioteca Comunitaria</h2>
                            <p className="text-neutral-500 text-sm mt-1">Blueprints curados por IA desde la colectividad.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden animate-pulse">
                                    <div className="h-36 bg-neutral-800/40"/>
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="h-3 bg-neutral-800 rounded w-3/4"/>
                                        <div className="h-2 bg-neutral-800 rounded w-1/2"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : planesToMostrar ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {planesToMostrar.map((plan, i) => (
                                <button
                                    key={plan.id}
                                    onClick={() => abrirPlan(plan)}
                                    className="group text-left bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-0.5"
                                >
                                    <div className={`h-40 bg-gradient-to-b ${BG_MOCK[i % BG_MOCK.length]} to-neutral-900 relative flex items-end p-3`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                        <span className="relative z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-violet-600 text-white">
                                            COMUNIDAD
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors leading-tight line-clamp-2">
                                            {plan.titulo}
                                        </h4>
                                        <span className="text-[10px] text-neutral-600">
                                            {plan.modulos?.length ?? 0} Módulos
                                            <span className="mx-1.5 text-neutral-800">•</span>
                                            <span className="text-amber-500/80">★</span> {Math.round((plan.ratioValidaciones ?? 0) * 50) / 10}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                                                <UserIcon />
                                            </div>
                                            <span className="text-[11px] text-neutral-500">{AUTORES_MOCK[i % AUTORES_MOCK.length]}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {MOCK_PLANES.map((p, i) => (
                                <div key={p.titulo} className="bg-[#111111] border border-neutral-800/60 rounded-xl overflow-hidden opacity-60">
                                    <div className={`h-40 bg-gradient-to-b ${p.bg} to-neutral-900 relative flex items-end p-3`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"/>
                                        <span className="relative z-10 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                                            {p.tag}
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <h4 className="text-sm font-semibold text-neutral-400 leading-tight">{p.titulo}</h4>
                                        <span className="text-[10px] text-neutral-700">
                                            {p.modulos} Módulos
                                            <span className="mx-1.5 text-neutral-800">•</span>
                                            ★ {p.rating}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                                                <UserIcon />
                                            </div>
                                            <span className="text-[11px] text-neutral-600">{AUTORES_MOCK[i % AUTORES_MOCK.length]}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
