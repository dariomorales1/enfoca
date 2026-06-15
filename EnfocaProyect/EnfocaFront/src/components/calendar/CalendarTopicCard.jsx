// src/components/calendar/CalendarTopicCard.jsx
import React from 'react';
import { CheckCircle2, CircleDashed, Clock, Play } from 'lucide-react';

export default function CalendarTopicCard({ topic, onClick, onStartFocus }) {
    const isCompleted = topic.completado;
    const isPending = !isCompleted && topic.pomodorosCompletados === 0;
    const isInProgress = !isCompleted && topic.pomodorosCompletados > 0;

    let stateClasses = "";
    let Icon = Clock;
    let iconColor = "";

    if (isCompleted) {
        stateClasses = "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50";
        Icon = CheckCircle2;
        iconColor = "text-green-500";
    } else if (isPending) {
        stateClasses = "bg-transparent border-dashed border-neutral-300 dark:border-neutral-700 opacity-70 hover:opacity-100";
        Icon = CircleDashed;
        iconColor = "text-neutral-400";
    } else if (isInProgress) {
        stateClasses = "bg-white dark:bg-[#111111] border-violet-200 dark:border-violet-800/50 shadow-sm";
        Icon = Clock;
        iconColor = "text-violet-500";
    }

    const planColor = topic.planColor ?? '#8b5cf6';

    return (
        <div
            onClick={() => onClick(topic)}
            // Aumentamos levemente el padding base a p-3 en móvil para facilitar el tacto
            className={`w-full text-left p-3 lg:p-2.5 rounded-lg border transition-all hover:shadow-md cursor-pointer group flex flex-col gap-1.5 relative ${stateClasses}`}
            style={!isCompleted ? { borderLeftColor: planColor, borderLeftWidth: '3px' } : {}}
        >
            {/* Cabecera (Título e Icono) */}
            <div className="flex items-start justify-between gap-2">
                <h4 className={`text-xs font-medium leading-tight line-clamp-2 pr-1 ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    {topic.titulo}
                </h4>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            </div>

            {/* Módulo y Contador de Pomodoros */}
            <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider truncate max-w-[70%]" style={{ color: planColor + '99' }}>
                    {topic.moduloTitulo}
                </span>

                <span className={`text-[10px] font-mono px-1.5 rounded shrink-0 ${
                    isCompleted
                        ? 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                    {topic.pomodorosCompletados}/{topic.pomodorosEstimados}
                </span>
            </div>

            {/* Fila Inferior: Etiqueta del Plan + Barra de Progreso + Botón Play */}
            {/* Reemplazamos el 'absolute' del Play por un contenedor flex para evitar solapamientos */}
            <div className="flex items-end justify-between gap-3 mt-1">

                {/* Contenedor izquierdo: Plan + Progress */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {topic.planTitulo && (
                        <span
                            className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase truncate max-w-full inline-block"
                            style={{ backgroundColor: planColor + '22', color: planColor }}
                        >
                            {topic.planTitulo}
                        </span>
                    )}

                    {isInProgress && (
                        <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${(topic.pomodorosCompletados / topic.pomodorosEstimados) * 100}%`,
                                    backgroundColor: planColor
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* BOTÓN PLAY RÁPIDO */}
                {/* Móvil: visible siempre (opacity-100). Desktop (lg): solo en hover (opacity-0 -> 100) */}
                {!isCompleted && onStartFocus && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Evita abrir el modal
                            onStartFocus(topic);
                        }}
                        // p-2 en móvil para mayor área táctil, p-1.5 original en desktop
                        className="shrink-0 p-2 lg:p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md shadow-sm transition-all opacity-100 lg:opacity-0 translate-y-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
                        title="Iniciar Pomodoro"
                    >
                        {/* El icono crece sutilmente en móvil para equilibrar */}
                        <Play className="w-3.5 h-3.5 lg:w-3 lg:h-3 fill-current" />
                    </button>
                )}
            </div>
        </div>
    );
}