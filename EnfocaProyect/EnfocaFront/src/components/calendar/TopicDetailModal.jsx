// src/components/calendar/TopicDetailModal.jsx
import React from 'react';
import { X, Play } from 'lucide-react';

export default function TopicDetailModal({ isOpen, onClose, topic, onStartFocus }) {
    if (!isOpen || !topic) return null;

    const isCompleted = topic.completado;
    const progressPercent = topic.pomodorosEstimados > 0
        ? Math.round((topic.pomodorosCompletados / topic.pomodorosEstimados) * 100)
        : 0;

    return (
        // El contenedor principal ya tiene p-4 que actúa como margen seguro para que el modal no toque los bordes físicos del celular
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0c] border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header: Reducimos padding a p-4 en móvil, p-6 en tablet/desktop */}
                <div className="flex items-start justify-between border-b border-neutral-800 p-4 sm:p-6 bg-neutral-900/20">
                    <div className="pr-3">
                        <h2 className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-1.5 sm:mb-2">Detalle_de_Sesión</h2>
                        <h3 className="text-base sm:text-lg font-medium text-white leading-tight">{topic.titulo}</h3>
                    </div>
                    {/* Botón de cierre: p-1.5 en móvil para no robar espacio, p-2 en desktop */}
                    <button onClick={onClose} className="p-1.5 sm:p-2 text-neutral-500 hover:text-white bg-neutral-900/50 hover:bg-neutral-800 rounded-lg transition-colors shrink-0">
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Body: Ajuste de espaciados (p-4 y gap-4 en móvil) */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-grow">

                    {/* Detalles del Progreso */}
                    <div className="border border-neutral-800 rounded-xl p-3 sm:p-4 bg-black/40">
                        <div className="flex justify-between items-end mb-3 sm:mb-4 gap-3">

                            {/* min-w-0 permite que el texto largo se trunque en pantallas chicas */}
                            <div className="min-w-0">
                                <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1 truncate">
                                    Módulo: {topic.moduloTitulo}
                                </span>
                                <span className="text-xs sm:text-sm text-neutral-300">
                                    {isCompleted ? "Completado" : "Progreso actual"}
                                </span>
                            </div>

                            {/* shrink-0 evita que el contador se aplaste si el texto izquierdo crece */}
                            <div className="text-right shrink-0">
                                <span className="text-2xl sm:text-3xl font-light text-white tabular-nums">{topic.pomodorosCompletados}</span>
                                <span className="text-neutral-500 font-mono text-xs sm:text-sm">/{topic.pomodorosEstimados} Poms</span>
                            </div>
                        </div>

                        <div className="w-full h-1.5 sm:h-2 bg-neutral-900 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-violet-500'}`} style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <span className="text-[9px] sm:text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                            // Datos provenientes del registro de Pomodoro
                        </span>
                    </div>

                </div>

                {/* Footer Acciones: Aseguramos padding consistente y área táctil */}
                <div className="border-t border-neutral-800 p-4 sm:p-5 flex gap-3 bg-neutral-900/10">
                    {!isCompleted && (
                        <button
                            onClick={() => onStartFocus(topic)}
                            // py-3 garantiza altura ideal para el dedo en móviles
                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                            {topic.pomodorosCompletados > 0 ? "Retomar_Estudio" : "Iniciar_Estudio"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}