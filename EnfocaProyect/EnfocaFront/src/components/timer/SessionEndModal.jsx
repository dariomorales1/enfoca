import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, CalendarDays, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS_LABEL = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MONTHS     = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function DatePicker({ selectedDates, onChange }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear,  setViewYear]  = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const toKey = (d) => d.toLocaleDateString('sv-SE');

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const toggleDate = (d) => {
        const key = toKey(d);
        onChange(
            selectedDates.includes(key)
                ? selectedDates.filter(s => s !== key)
                : [...selectedDates, key]
        );
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    return (
        <div className="w-full">
            {/* Navegación mes */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                {/* Aumentamos padding de los botones (p-1.5) para pantallas táctiles */}
                <button onClick={prevMonth} className="p-1.5 text-neutral-500 hover:text-white transition-colors rounded">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wider">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="p-1.5 text-neutral-500 hover:text-white transition-colors rounded">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-1.5 sm:mb-2">
                {DAYS_LABEL.map(d => (
                    <div key={d} className="text-center text-[10px] sm:text-[11px] font-semibold text-neutral-600 uppercase py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Celdas del calendario */}
            {/* Aumentamos el gap a 1 en móvil para evitar "missclicks" */}
            <div className="grid grid-cols-7 gap-1 sm:gap-0.5">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const isPast     = day < today;
                    const isToday    = toKey(day) === toKey(today);
                    const isSelected = selectedDates.includes(toKey(day));
                    return (
                        <button
                            key={toKey(day)}
                            onClick={() => !isPast && toggleDate(day)}
                            disabled={isPast}
                            // Aumentamos ligeramente la fuente en móvil (text-sm vs text-xs)
                            className={`
                                aspect-square flex items-center justify-center text-xs sm:text-sm rounded-lg transition-all
                                ${isPast      ? 'text-neutral-800 cursor-not-allowed' : ''}
                                ${isSelected  ? 'bg-violet-600 text-white font-bold' : ''}
                                ${!isSelected && isToday && !isPast ? 'border border-violet-500/40 text-violet-400' : ''}
                                ${!isSelected && !isPast && !isToday ? 'text-neutral-300 hover:bg-neutral-800' : ''}
                            `}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Fechas seleccionadas (Etiquetas apilables) */}
            {selectedDates.length > 0 && (
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-1">
                    {selectedDates.sort().map(d => (
                        <span key={d} className="flex items-center gap-1.5 sm:gap-1 text-[10px] sm:text-[11px] bg-violet-600/20 text-violet-300 px-2 sm:px-2 py-1 sm:py-0.5 rounded-full border border-violet-500/20">
                            {d}
                            <button onClick={() => onChange(selectedDates.filter(s => s !== d))} className="hover:text-white p-0.5" aria-label="Eliminar fecha">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SessionEndModal({ isOpen, onClose, topic, onComplete, onSchedule }) {
    const [scheduleMode, setScheduleMode]   = useState('none');
    const [selectedDates, setSelectedDates] = useState([]);
    const [saving, setSaving]               = useState(false);

    if (!isOpen || !topic) return null;

    const handleSchedule = async (dates) => {
        if (!dates?.length) return;
        setSaving(true);
        try {
            await onSchedule(dates);
        } catch (e) {
            console.error('[Modal] error en onSchedule:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            await onComplete(topic.id);
        } catch (e) {
            console.error('[Modal] error en onComplete:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleRepetirManana = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        handleSchedule([tomorrow.toLocaleDateString('sv-SE')]);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0c] border border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header: px-4 py-4 en móvil para ahorrar espacio vertical, p-6 en tablet */}
                <div className="flex items-start justify-between border-b border-neutral-800 px-4 sm:px-6 py-4 sm:py-6 bg-neutral-900/20 shrink-0">
                    <div>
                        <h2 className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-1">Sesión_Finalizada</h2>
                        <h3 className="text-lg sm:text-xl font-medium text-white leading-tight">¡Buen Trabajo!</h3>
                    </div>
                    {/* Botón táctil más amigable */}
                    <button onClick={onClose} disabled={saving} className="p-1.5 sm:p-2 text-neutral-500 hover:text-white transition-colors disabled:opacity-40">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenedor escrolleable si la pantalla es muy baja */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar">

                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-neutral-400 mb-1.5 sm:mb-2">Completaste la sesión para:</p>
                        <p className="text-sm sm:text-md text-violet-400 font-medium px-2">{topic.titulo}</p>
                    </div>

                    <div className="border border-neutral-800 rounded-xl p-4 sm:p-5 bg-black/40">
                        <p className="text-sm text-white font-medium mb-4 text-center">¿Qué deseas hacer ahora?</p>
                        <div className="flex flex-col gap-3">

                            {/* Marcar completado: py-3.5 para área táctil robusta en móvil */}
                            <button
                                onClick={handleComplete}
                                disabled={saving}
                                className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-3.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                            >
                                {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                                Marcar Tema Completado
                            </button>

                            {scheduleMode === 'none' && (
                                <>
                                    <div className="relative flex items-center py-1 sm:py-2">
                                        <div className="flex-grow border-t border-neutral-800" />
                                        <span className="flex-shrink-0 mx-3 sm:mx-4 text-neutral-500 text-[10px] sm:text-xs font-mono">O CONTINUAR LUEGO</span>
                                        <div className="flex-grow border-t border-neutral-800" />
                                    </div>
                                    <button
                                        onClick={handleRepetirManana}
                                        disabled={saving}
                                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        Repetir Mañana
                                    </button>
                                    <button
                                        onClick={() => setScheduleMode('calendar')}
                                        disabled={saving}
                                        className="w-full bg-neutral-900 border border-neutral-700 hover:border-violet-500/40 hover:bg-violet-600/5 text-neutral-300 py-3.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                                    >
                                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                                        Programar en Calendario
                                    </button>
                                </>
                            )}

                            {scheduleMode === 'calendar' && (
                                <div className="flex flex-col gap-4 sm:gap-5">
                                    <DatePicker
                                        selectedDates={selectedDates}
                                        onChange={setSelectedDates}
                                    />
                                    <div className="flex gap-2 sm:gap-3">
                                        <button
                                            onClick={() => { setScheduleMode('none'); setSelectedDates([]); }}
                                            disabled={saving}
                                            className="px-4 py-3 sm:py-2.5 rounded-lg border border-neutral-700 text-neutral-400 text-xs sm:text-sm hover:text-white transition-all shrink-0"
                                        >
                                            ← Volver
                                        </button>
                                        <button
                                            onClick={() => handleSchedule(selectedDates)}
                                            disabled={selectedDates.length === 0 || saving}
                                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-3 sm:py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
                                        >
                                            {saving
                                                ? <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Guardando...</>
                                                : <><CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" /> Confirmar {selectedDates.length > 0 ? `(${selectedDates.length})` : ''}</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}