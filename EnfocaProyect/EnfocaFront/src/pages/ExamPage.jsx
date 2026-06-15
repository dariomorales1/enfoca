import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { certService } from '../services/api';

const LETRAS = ['A', 'B', 'C', 'D'];

const IconBack    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

export default function ExamPage() {
    const { examenId } = useParams();
    const { state }    = useLocation();
    const navigate     = useNavigate();

    const examen     = state?.examen;
    const preguntas  = examen?.preguntas ?? [];
    const planTitulo = state?.planTitulo ?? 'Plan de estudio';

    const [actual, setActual]       = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [enviando, setEnviando]   = useState(false);
    const [error, setError]         = useState('');

    if (!examen) {
        navigate('/library');
        return null;
    }

    const pregunta      = preguntas[actual];
    const totalRespondidas = Object.keys(respuestas).length;
    const todasRespondidas = totalRespondidas === preguntas.length;

    const seleccionar = (preguntaId, opcionIdx) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: opcionIdx }));
    };

    const enviar = async () => {
        if (!todasRespondidas) return;
        setEnviando(true);
        setError('');
        try {
            const { data } = await certService.responder(examenId, { respuestas });
            navigate(`/examen/${examenId}/resultado`, {
                state: { resultado: data, planTitulo }
            });
        } catch (e) {
            setError(e.response?.data?.message || 'Error al enviar el examen.');
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

            {/* Header: Paddings adaptativos y flex-1 para el contenedor central */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 sm:gap-1.5 text-neutral-500 hover:text-white text-[11px] sm:text-xs transition-colors shrink-0"
                >
                    <IconBack /> <span className="hidden sm:inline">Volver</span>
                </button>
                <div className="text-center flex-1 mx-3 min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase truncate">Examen de certificación</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full mx-auto">{planTitulo}</p>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-500 shrink-0">
                    Intento {examen.intento}/2
                </span>
            </div>

            {/* Progreso: Reducción de gaps en móvil */}
            <div className="px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
                <div className="flex gap-1 sm:gap-1.5 flex-1">
                    {preguntas.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setActual(i)}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                i === actual ? 'bg-amber-400' :
                                    respuestas[p.id] !== undefined ? 'bg-amber-400/40' :
                                        'bg-neutral-800'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 flex-shrink-0">
                    {actual + 1}/{preguntas.length}
                </span>
            </div>

            {/* Pregunta: Márgenes internos dinámicos */}
            <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 gap-5 sm:gap-6">

                {pregunta && (
                    <>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-2 sm:mb-3">
                                Pregunta {actual + 1}
                            </p>
                            <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                                {pregunta.texto}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {pregunta.opciones?.map((opcion, oi) => {
                                const seleccionada = respuestas[pregunta.id] === oi;
                                return (
                                    <button
                                        key={oi}
                                        onClick={() => seleccionar(pregunta.id, oi)}
                                        // py-3.5 es ideal para áreas táctiles
                                        className={`flex items-center gap-3 px-3 sm:px-4 py-3.5 rounded-xl border text-left text-sm transition-all ${
                                            seleccionada
                                                ? 'border-amber-500/60 bg-amber-500/10 text-white'
                                                : 'border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white'
                                        }`}
                                    >
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                            seleccionada ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-500'
                                        }`}>
                                            {seleccionada ? <IconCheck /> : LETRAS[oi]}
                                        </span>
                                        {opcion}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navegación Anterior/Siguiente */}
                        <div className="flex justify-between mt-2 sm:mt-4">
                            <button
                                onClick={() => setActual(p => Math.max(0, p - 1))}
                                disabled={actual === 0}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border border-neutral-800 text-neutral-400 text-xs sm:text-sm hover:border-neutral-600 hover:text-white hover:bg-neutral-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                ← Anterior
                            </button>
                            {actual < preguntas.length - 1 ? (
                                <button
                                    onClick={() => setActual(p => p + 1)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border border-amber-500/40 text-amber-400 text-xs sm:text-sm hover:border-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
                                >
                                    Siguiente →
                                </button>
                            ) : <div />} {/* Div vacío para mantener el "Anterior" a la izquierda si no hay "Siguiente" */}
                        </div>
                    </>
                )}
            </div>

            {/* Footer con envío: Apilable en móvil para botón full width */}
            <div className="border-t border-neutral-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                <p className="text-xs text-neutral-600 w-full sm:w-auto text-center sm:text-left">
                    {totalRespondidas} de {preguntas.length} respondidas
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    <button
                        onClick={enviar}
                        disabled={!todasRespondidas || enviando}
                        // w-full en móvil para asegurar que el usuario no falle el toque
                        className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {enviando
                            ? <><div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Calificando...</>
                            : 'Enviar examen'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}