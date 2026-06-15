// src/components/calendar/WeeklyGrid.jsx
import React from 'react';
import CalendarTopicCard from './CalendarTopicCard';

export default function WeeklyGrid({ days, onDayClick, onTopicClick, onStartFocus }) {

    // Función segura para obtener la fecha de hoy en formato local YYYY-MM-DD
    const getTodayLocalStr = () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getTodayLocalStr();

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            {/* MÓVIL: 1 columna (lista vertical), gap-4 para separar los días.
              ESCRITORIO (lg): 7 columnas, gap-1, forzamos min-w-[1050px] para que no se aplaste
            */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-1 h-full min-w-full lg:min-w-[1050px]">
                {days.map((day) => {
                    const isToday = todayStr === day.fecha;

                    // Forzamos la hora local reemplazando los guiones por barras
                    const dateObj = new Date(day.fecha.replace(/-/g, '\/'));

                    return (
                        <div
                            key={day.fecha}
                            // MÓVIL: h-auto para que se adapte al contenido. ESCRITORIO: min-h-[420px]
                            className={`flex flex-col h-auto lg:h-full lg:min-h-[420px] border rounded-xl overflow-hidden bg-black/20 ${
                                isToday ? 'border-violet-500/40 bg-violet-500/[0.02]' : 'border-neutral-800'
                            }`}
                        >
                            {/* Cabecera del día */}
                            <div
                                onClick={() => onDayClick(day.fecha)}
                                // MÓVIL: Fila (flex-row) con px-4. ESCRITORIO: Columna (flex-col) centrada.
                                className="px-4 lg:px-0 py-3 lg:py-3 flex flex-row lg:flex-col items-center justify-between lg:justify-center border-b border-neutral-900 bg-neutral-900/20 cursor-pointer hover:bg-neutral-900/50 transition-colors shrink-0"
                            >
                                <div className="flex items-center gap-2 lg:gap-0 lg:flex-col">
                                    <span className="text-xs lg:text-[14px] font-mono uppercase tracking-widest text-neutral-500">
                                        {dateObj.toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </span>
                                    <span className={`text-base lg:text-xl font-light lg:mt-0.5 ${isToday ? 'text-violet-400 font-medium' : 'text-white'}`}>
                                        {dateObj.getDate()}
                                    </span>
                                </div>

                                {/* Indicador rápido de temas: Solo visible en móvil para dar contexto */}
                                <span className="lg:hidden text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                                    {day.temas?.length || 'Libre'}
                                </span>
                            </div>

                            {/* Contenedor de las tarjetas de temas */}
                            <div className="flex-grow p-3 lg:p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                {day.temas && day.temas.length > 0 ? (
                                    day.temas.map((tema) => (
                                        <CalendarTopicCard
                                            key={tema.id}
                                            topic={{ ...tema, fecha: day.fecha }} // Inyectamos la fecha
                                            onClick={onTopicClick}
                                            onStartFocus={onStartFocus}
                                        />
                                    ))
                                ) : (
                                    /* Estado vacío en móvil para que el usuario sepa que no hay nada */
                                    <div className="lg:hidden text-center text-xs text-neutral-600 py-1 italic">
                                        No hay temas programados
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}