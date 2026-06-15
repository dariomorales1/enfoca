import { useState } from 'react';

const IconSearch = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);
const IconDiff = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18M3 12h18"/>
    </svg>
);
const IconQuestion = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);
const IconChevron = ({ open }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

export default function SocraticGuidePanel({ guiaSocratica, temaActivo }) {
    const [open, setOpen] = useState(false);

    if (!guiaSocratica || !temaActivo) return null;

    let guia = null;
    try {
        guia = typeof guiaSocratica === 'string' ? JSON.parse(guiaSocratica) : guiaSocratica;
    } catch {
        return null;
    }

    const { que_investigar = [], diferencias_clave = [], preguntas_guia = [] } = guia;

    return (
        <div className="bg-[#0c0c0c] border border-violet-500/20 rounded-xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setOpen(v => !v)}
                // py-4 en móvil asegura un toque cómodo sin fallar; text-left evita que el texto se centre extraño si envuelve
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 sm:py-3 hover:bg-violet-600/5 transition-colors text-left"
            >
                {/* pr-4 evita que el título choque contra la flecha desplegable en pantallas angostas */}
                <div className="flex items-center gap-2.5 pr-4">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
                    <span className="text-[10px] sm:text-xs font-semibold text-violet-300 tracking-wider uppercase leading-snug">
                        Guía Socrática — {temaActivo.titulo}
                    </span>
                </div>
                <div className="shrink-0 text-violet-400">
                    <IconChevron open={open} />
                </div>
            </button>

            {open && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-5 sm:gap-4 border-t border-violet-500/10 pt-3 sm:pt-4">
                    <p className="text-[9px] sm:text-[10px] text-neutral-500 italic leading-relaxed">
                        No busques la respuesta directa — usa estas guías para construir tu propio entendimiento.
                    </p>

                    {que_investigar.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                                <IconSearch /> Investiga por tu cuenta
                            </div>
                            <ul className="flex flex-col gap-2 sm:gap-1.5">
                                {que_investigar.map((item, i) => (
                                    <li key={i} className="text-[11px] sm:text-xs text-neutral-300 flex items-start gap-2 leading-relaxed">
                                        {/* shrink-0 evita que la flecha se aplaste si el texto es muy largo */}
                                        <span className="text-violet-500 mt-0.5 shrink-0">›</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {diferencias_clave.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                                <IconDiff /> Diferencias clave
                            </div>
                            <ul className="flex flex-col gap-2 sm:gap-1.5">
                                {diferencias_clave.map((item, i) => (
                                    <li key={i} className="text-[11px] sm:text-xs text-amber-400/80 flex items-start gap-2 leading-relaxed">
                                        {/* shrink-0 aquí también */}
                                        <span className="mt-0.5 shrink-0">⇄</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {preguntas_guia.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                                <IconQuestion /> Preguntas de autoexamen
                            </div>
                            <ol className="flex flex-col gap-2.5 sm:gap-2">
                                {preguntas_guia.map((preg, i) => (
                                    <li key={i} className="text-[11px] sm:text-xs text-neutral-300 bg-neutral-900/50 rounded-lg p-3 sm:p-2.5 border border-neutral-800 flex items-start gap-2 leading-relaxed">
                                        <span className="text-violet-400 font-mono shrink-0 mt-[1px]">{i + 1}.</span>
                                        <span>{preg}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}