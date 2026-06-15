// src/components/calendar/WeeklySummarySidebar.jsx
import React from 'react';
import { Target, CheckSquare, Clock, TrendingUp } from 'lucide-react';

export default function WeeklySummarySidebar({ summary, isLoading }) {
    if (isLoading) {
        return (
            // Reducimos el min-h a 250px en móvil, recuperando los 400px en lg
            <div className="bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 h-auto min-h-[250px] lg:h-full lg:min-h-[400px] flex items-center justify-center w-full">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                    <div className="w-24 h-3 sm:w-32 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
            </div>
        );
    }

    const data = summary || {
        totalTemas: 0,
        temasCompletados: 0,
        porcentajeAvance: 0,
        horasPlanificadas: 0
    };

    return (
        // MÓVIL: h-auto (crece según el contenido). ESCRITORIO: h-full y sticky.
        <div className="bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 lg:sticky lg:top-6 h-auto lg:h-[calc(100vh-8rem)] lg:max-h-[800px] flex flex-col w-full">

            <h2 className="text-xs sm:text-sm font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Resumen de la Semana
            </h2>

            {/* space-y más ajustado en móvil para que no se sienta estirado */}
            <div className="space-y-3 sm:space-y-6 flex-grow flex flex-col">

                {/* El lg:flex-grow hace que este bloque grande empuje el resto solo en escritorio */}
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800/50 lg:flex-grow">
                    <div className="text-4xl sm:text-5xl font-light tabular-nums text-violet-600 dark:text-violet-400">
                        {data.porcentajeAvance}<span className="text-xl sm:text-2xl text-neutral-400">%</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1.5 sm:mt-3 text-center">
                        Avance Semanal
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-3 sm:p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg flex flex-col justify-center">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 mb-1.5 sm:mb-2" />
                        <div className="text-xl sm:text-2xl font-semibold">{data.totalTemas}</div>
                        <div className="text-[8px] sm:text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">Planificados</div>
                    </div>

                    <div className="p-3 sm:p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg flex flex-col justify-center">
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mb-1.5 sm:mb-2" />
                        <div className="text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400">{data.temasCompletados}</div>
                        <div className="text-[8px] sm:text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">Completados</div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                        <span className="text-[11px] sm:text-xs font-medium">Tiempo Estimado</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold font-mono">
                        {data.horasPlanificadas} <span className="text-neutral-500 font-normal text-xs sm:text-sm">hrs</span>
                    </span>
                </div>
            </div>

            {/* El mt-4 en móvil evita que la frase quede flotando si el contenedor no es muy alto */}
            <div className="mt-4 lg:mt-auto pt-4 sm:pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <p className="text-[9px] sm:text-[10px] font-mono italic text-neutral-500">
                    "La constancia es la clave del progreso."
                </p>
            </div>
        </div>
    );
}