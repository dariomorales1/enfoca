import React from 'react';

const IconTrash = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
    </svg>
);

export default function DetailedDayView({ dayData, onTopicClick, onDelete }) {

    const formatearTituloLocal = (fechaStr) => {
        if (!fechaStr) return '';
        const [year, month, day] = fechaStr.split('-');
        return new Date(year, month - 1, day)
            .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
            .toUpperCase();
    };

    return (
        // Reducimos el padding en móvil (p-4) y lo mantenemos amplio en desktop (sm:p-6)
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto w-full">
            <div className="border-b border-neutral-800 pb-3 sm:pb-4 mb-4 sm:mb-6">
                <span className="text-[9px] font-mono text-violet-400 tracking-widest uppercase">Focus_Target_Day</span>
                {/* Ajustamos la tipografía del título: text-xl en móvil, text-2xl desde tablet */}
                <h2 className="text-xl sm:text-2xl font-light mt-1">{formatearTituloLocal(dayData.fecha)}</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {dayData.temas && dayData.temas.length > 0 ? (
                    dayData.temas.map((tema) => {
                        const pct = tema.pomodorosEstimados > 0
                            ? Math.round((tema.pomodorosCompletados / tema.pomodorosEstimados) * 100)
                            : 0;
                        return (
                            <div
                                key={tema.id}
                                // Cambiamos el breakpoint a sm: (tablet pequeña) en lugar de md: para que aproveche el espacio antes
                                className="border border-neutral-800 bg-black/40 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-violet-500/30 transition-all group"
                            >
                                <div
                                    className="space-y-1.5 flex-grow cursor-pointer"
                                    onClick={() => onTopicClick(tema)}
                                >
                                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 inline-block">
                                        {tema.moduloTitulo}
                                    </span>
                                    {/* Ajuste de tipografía en el título del tema */}
                                    <h3 className="text-sm sm:text-base font-medium text-white group-hover:text-violet-400 transition-colors pt-0.5 leading-snug">
                                        {tema.titulo}
                                    </h3>
                                </div>

                                {/* Bloque de progreso y acciones: w-full en móvil para que no se comprima hacia un lado */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto sm:min-w-[220px] pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/50 sm:border-transparent">

                                    {/* Barra de progreso: ocupa el espacio disponible en móvil (flex-1) o un ancho fijo en escritorio (sm:w-32) */}
                                    <div className="flex-1 sm:flex-none sm:w-32 space-y-1">
                                        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-neutral-500">
                                            <span>PROGRESS</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
                                            <div style={{ width: `${pct}%` }} className="h-full bg-violet-500 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Contadores */}
                                    <div className="bg-neutral-900 border border-neutral-800 px-2 sm:px-3 py-1.5 rounded-lg text-center font-mono shrink-0">
                                        <div className="text-[9px] sm:text-[10px] text-neutral-500">POMS</div>
                                        <div className="text-[11px] sm:text-xs text-white">{tema.pomodorosCompletados}/{tema.pomodorosEstimados}</div>
                                    </div>

                                    {/* Botón Eliminar: Aumentamos el padding en móvil a p-2.5 para mejor área táctil */}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(tema.id, dayData.fecha); }}
                                            title="Eliminar del calendario"
                                            className="flex-shrink-0 p-2.5 sm:p-2 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/20 transition-all"
                                        >
                                            <IconTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 sm:py-12 border border-dashed border-neutral-800 rounded-xl px-4">
                        <p className="text-xs sm:text-sm text-neutral-500">No hay temas programados para este día</p>
                    </div>
                )}
            </div>
        </div>
    );
}