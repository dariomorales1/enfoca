// src/components/calendar/DayCard.jsx
import React from 'react';
import CalendarTopicCard from './CalendarTopicCard';

export default function DayCard({ dayData }) {
    // Nombres de los días en español para asegurar consistencia
    const getDayName = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    const getDayNumber = (dateString) => {
        const date = new Date(dateString);
        return date.getDate();
    };

    // Determinar si este día es "hoy" para resaltarlo
    const isToday = new Date().toISOString().split('T')[0] === dayData.fecha;

    // Función que manejará el clic en el tema
    const handleTopicClick = (topic) => {
        console.log("Abrir modal para el tema:", topic.titulo);
        // TODO: Sincronizar con el estado del modal en WeeklyCalendarPage
    };

    return (
        // Liberamos la altura en móvil (h-auto min-h-[100px]) y preservamos min-h-[400px] en lg
        <div className={`flex flex-col h-auto lg:h-full min-h-[100px] lg:min-h-[400px] border rounded-xl overflow-hidden transition-colors ${
            isToday
                ? 'border-violet-500/50 bg-violet-50/30 dark:bg-violet-900/10'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0c]'
        }`}>
            {/* Encabezado del Día */}
            {/* MÓVIL: Fila con px-4. ESCRITORIO: Columna centrada */}
            <div className={`py-3 px-4 lg:px-0 flex flex-row lg:flex-col items-center justify-between lg:justify-center border-b shrink-0 ${
                isToday
                    ? 'border-violet-500/30 text-violet-700 dark:text-violet-400'
                    : 'border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400'
            }`}>
                <div className="flex items-center gap-2 lg:gap-0 lg:flex-col">
                    <span className="text-xs lg:text-[10px] font-mono uppercase tracking-widest lg:mb-1">
                        {getDayName(dayData.fecha)}
                    </span>
                    <span className={`text-base lg:text-2xl font-light ${isToday ? 'font-medium' : ''}`}>
                        {getDayNumber(dayData.fecha)}
                    </span>
                </div>

                {/* Indicador de temas en móvil para contexto rápido */}
                {dayData.temas?.length > 0 && (
                    <span className="lg:hidden text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        {dayData.temas.length} {dayData.temas.length === 1 ? 'Tema' : 'Temas'}
                    </span>
                )}
            </div>

            {/* Contenedor de Temas */}
            <div className="flex-grow p-3 lg:p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {dayData.temas && dayData.temas.length > 0 ? (
                    dayData.temas.map((tema) => (
                        <CalendarTopicCard
                            key={tema.id}
                            topic={tema}
                            onClick={handleTopicClick}
                        />
                    ))
                ) : (
                    // Estado Vacío: Visible en móvil siempre, oculto por defecto en escritorio (lg:opacity-0)
                    <div className="h-full flex items-center justify-center opacity-100 lg:opacity-0 hover:opacity-100 transition-opacity cursor-pointer group py-2 lg:py-0">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-3 lg:p-2 w-full group-hover:border-violet-500 group-hover:text-violet-500 transition-colors">
                            + Planificar
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}