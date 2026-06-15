import { useLocation, useNavigate } from 'react-router-dom';
import BadgeGenerator from '../components/badges/BadgeGenerator';

const IconCheck  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconRepeat = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const IconHome   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

export default function ExamResultPage() {
    const { state }  = useLocation();
    const navigate   = useNavigate();
    const resultado  = state?.resultado;
    const planTitulo = state?.planTitulo ?? 'Plan de estudio';

    if (!resultado) { navigate('/library'); return null; }

    const { aprobado, puntaje, total, intentosRestantes, temasARepasar, codigoVerificacion } = resultado;
    const porcentaje = Math.round((puntaje / total) * 100);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg flex flex-col items-center gap-6 sm:gap-8 text-center sm:-mt-10">

                {aprobado ? (
                    <>
                        {/* Badge: Escala para no saturar la pantalla del teléfono */}
                        <div className="w-36 sm:w-48">
                            <BadgeGenerator title={planTitulo} />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">¡Certificado obtenido!</h1>
                            <p className="text-neutral-400 text-xs sm:text-sm">
                                Completaste el examen con <span className="text-emerald-400 font-bold">{puntaje}/{total}</span> respuestas correctas ({porcentaje}%)
                            </p>
                        </div>

                        {/* Código verificación */}
                        {codigoVerificacion && (
                            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl px-4 sm:px-5 py-3 sm:py-4 w-full">
                                <p className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-1">Código de verificación</p>
                                <p className="text-xs font-mono text-neutral-300 break-all">{codigoVerificacion}</p>
                                <p className="text-[9px] sm:text-[10px] text-neutral-600 mt-1.5">
                                    Compartible en: enfoca.online/verificar/{codigoVerificacion}
                                </p>
                            </div>
                        )}

                        {/* Botones: Se apilan en móvil (flex-col) y w-full para mejor área táctil */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center mt-2">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all"
                            >
                                Ver en mi perfil
                            </button>
                            <button
                                onClick={() => navigate('/library')}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 text-sm transition-all"
                            >
                                <IconHome /> Ir a biblioteca
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Resultado reprobado: Círculo adaptable */}
                        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex items-center justify-center text-3xl sm:text-4xl font-black ${
                            porcentaje >= 50 ? 'border-amber-500/50 text-amber-400' : 'border-red-500/40 text-red-400'
                        }`}>
                            {porcentaje}%
                        </div>

                        <div className="flex flex-col gap-1.5 sm:gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-white">No alcanzaste el mínimo</h1>
                            <p className="text-neutral-400 text-xs sm:text-sm">
                                Obtuviste <span className="font-bold text-white">{puntaje}/{total}</span> — necesitas al menos 7 para aprobar
                            </p>
                        </div>

                        {/* Temas a repasar */}
                        {temasARepasar?.length > 0 && (
                            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl px-4 sm:px-5 py-3 sm:py-4 w-full text-left">
                                <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2 sm:mb-3">Temas a repasar</p>
                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                    {temasARepasar.map((tema, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5"/>
                                            <span className="leading-snug">{tema}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {intentosRestantes > 0 ? (
                            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full mt-2">
                                <p className="text-[11px] sm:text-xs text-neutral-500">
                                    Te queda <span className="text-white font-bold">{intentosRestantes}</span> intento más
                                </p>
                                <button
                                    onClick={() => navigate(-2)}
                                    className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all"
                                >
                                    <IconRepeat /> Intentar de nuevo
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 w-full mt-2">
                                <p className="text-xs text-amber-400/80 px-4">
                                    Agotaste los 2 intentos. Repasa los temas indicados y genera un nuevo plan para volver a intentarlo.
                                </p>
                                <button
                                    onClick={() => navigate('/library')}
                                    className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-sm transition-all"
                                >
                                    <IconHome /> Ir a biblioteca
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}