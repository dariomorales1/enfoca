// src/components/calendar/MonthView.jsx
import React from 'react';

export default function MonthView({ days, onDayClick, onTopicClick }) {
    const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    return (
        // Reducimos padding en móvil (p-3) y mantenemos p-4 en tablet/desktop
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col overflow-hidden">

            {/* Contenedor con scroll horizontal para salvar la grilla de 7 columnas en móviles */}
            <div className="w-full overflow-x-auto custom-scrollbar pb-2">

                {/* Forzamos un ancho mínimo para evitar que el texto se aplaste */}
                <div className="min-w-[600px] md:min-w-full">

                    {/* Cabecera de días */}
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-neutral-500 mb-2">
                        {weekDays.map(d => <div key={d} className="py-1">{d}</div>)}
                    </div>

                    {/* Grilla de Días: Ajustamos la altura de fila para dar más espacio táctil */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 auto-rows-[85px] sm:auto-rows-[90px] lg:auto-rows-[100px]">
                        {days.map((day, idx) => {
                            if (day.padding) {
                                return <div key={`pad-${idx}`} className="bg-neutral-900/10 rounded-lg border border-transparent"></div>;
                            }

                            return (
                                <div
                                    key={day.fecha}
                                    onClick={() => onDayClick(day.fecha)}
                                    // p-1 en móvil para ganar espacio útil dentro del cuadro, p-1.5 en desktop
                                    className="bg-black/40 border border-neutral-900 hover:border-neutral-700 p-1 sm:p-1.5 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors group overflow-hidden"
                                >
                                    <span className="text-[10px] sm:text-xs font-mono text-neutral-500 group-hover:text-white transition-colors pl-1 pt-0.5">
                                        {day.dayNumber}
                                    </span>

                                    <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                                        {day.temas?.map(tema => (
                                            <div
                                                key={tema.id}
                                                onClick={(e) => {
                                                    // Evita que el clic en el tema dispare el clic del día completo
                                                    e.stopPropagation();
                                                    onTopicClick(tema);
                                                }}
                                                style={{ borderColor: tema.color, backgroundColor: `${tema.color}15` }}
                                                // Fuentes adaptables: text-[9px] en móvil, text-[11px] sm en adelante
                                                className="text-[9px] sm:text-[11px] font-mono p-1 rounded border truncate text-white hover:brightness-125 transition-all"
                                            >
                                                {tema.titulo}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}