import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, certService } from '../services/api';
import { getPlanImage } from '../utils/planImage';

const NIVEL_LABEL = { BASICO: 'Básico', INTERMEDIO: 'Intermedio', AVANZADO: 'Avanzado' };
const NIVEL_COLOR = { BASICO: 'bg-emerald-600', INTERMEDIO: 'bg-amber-600', AVANZADO: 'bg-violet-600' };

const IconPlay    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const IconChevron = ({ open }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>;
const IconCheck   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const IconBack    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const IconTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconAdd     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconWand    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/></svg>;
const IconCert    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IconUsers   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const UMBRAL_VOTOS = 50;

const MOTIVOS = [
    { value: 'MUY_BASICO',       label: 'Muy básico para mi nivel' },
    { value: 'MUY_AVANZADO',     label: 'Demasiado avanzado' },
    { value: 'MAL_ESTRUCTURADO', label: 'Mal estructurado / sin orden lógico' },
    { value: 'MUY_EXTENSO',      label: 'Demasiado extenso' },
    { value: 'FUERA_DE_TEMA',    label: 'Se desvió del tema' },
    { value: 'OTRO',             label: 'Otro motivo' },
];

function MejoraModal({ planId, onClose, onMejorado }) {
    const [motivo, setMotivo]       = useState('');
    const [detalle, setDetalle]     = useState('');
    const [enviando, setEnviando]   = useState(false);
    const [error, setError]         = useState('');

    const handleEnviar = async () => {
        if (!motivo) { setError('Selecciona un motivo.'); return; }
        setEnviando(true);
        setError('');
        try {
            const { data } = await planService.feedback(planId, { motivo, detalle: detalle.trim() || null });
            onMejorado(data);
            onClose();
        } catch (e) {
            setError(e.response?.data?.mensaje || e.response?.data?.message || 'Error al procesar la mejora.');
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-[#111] border border-neutral-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5">
                <div>
                    <h3 className="text-base font-bold text-white">Solicitar mejora del plan</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        La IA mejorará tu copia según tu feedback. Tu reporte también ayuda a mejorar el plan maestro para toda la comunidad.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-neutral-400">¿Qué no te funcionó?</p>
                    {MOTIVOS.map(m => (
                        <button
                            key={m.value}
                            onClick={() => setMotivo(m.value)}
                            className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                                motivo === m.value
                                    ? 'border-violet-500/50 bg-violet-600/10 text-white'
                                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <div>
                    <p className="text-xs font-semibold text-neutral-400 mb-1.5">Detalle adicional (opcional)</p>
                    <textarea
                        value={detalle}
                        onChange={e => setDetalle(e.target.value)}
                        placeholder="Cuéntanos más sobre el problema..."
                        maxLength={500}
                        rows={3}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 resize-none"
                    />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={enviando}
                        className="px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 text-sm hover:text-white transition-all disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || !motivo}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {enviando
                            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Mejorando...</>
                            : 'Mejorar con IA'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function StarRating({ value, onChange, disabled }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => !disabled && setHover(star)}
                    onMouseLeave={() => !disabled && setHover(0)}
                    className="transition-transform disabled:cursor-default active:scale-90"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24"
                        fill={(hover || value) >= star ? '#f59e0b' : 'none'}
                        stroke={(hover || value) >= star ? '#f59e0b' : '#404040'}
                        strokeWidth="1.5"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </button>
            ))}
        </div>
    );
}

function ValoracionSection({ plan, planMaestroId, onVotoEnviado }) {
    const [puntaje, setPuntaje]     = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando]   = useState(false);
    const [mensaje, setMensaje]     = useState('');
    const [error, setError]         = useState('');

    const yaVoto    = plan.yaVoto;
    const ratio     = plan.ratioValidaciones ?? 0;
    const total     = plan.totalValidaciones ?? 0;
    const pctVotos  = Math.min(Math.round((total / UMBRAL_VOTOS) * 100), 100);
    const estrellas = Math.round(ratio * 5 * 10) / 10;

    const handleEnviar = async () => {
        if (puntaje === 0) { setError('Selecciona una puntuación.'); return; }
        setEnviando(true);
        setError('');
        try {
            await planService.validar(planMaestroId, { puntaje, comentario: comentario.trim() || null });
            setMensaje('¡Gracias por tu valoración!');
            onVotoEnviado();
        } catch (e) {
            const msg = e.response?.data?.mensaje || e.response?.data?.message || 'Error al enviar valoración.';
            setError(msg);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl px-5 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">Valoración de la comunidad</p>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="font-mono text-amber-400 font-bold">{estrellas > 0 ? `★ ${estrellas.toFixed(1)}` : '—'}</span>
                    <span>{total} {total === 1 ? 'valoración' : 'valoraciones'}</span>
                </div>
            </div>

            {/* Barra de progreso hacia 50 votos */}
            {total < UMBRAL_VOTOS && (
                <div>
                    <div className="flex justify-between text-[9px] font-mono text-neutral-600 mb-1">
                        <span>Progreso para indexar en comunidad</span>
                        <span>{total}/{UMBRAL_VOTOS} votos</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pctVotos}%` }}/>
                    </div>
                    <p className="text-[9px] text-neutral-700 mt-1">
                        Si alcanza {UMBRAL_VOTOS} votos con ≥90% de valoraciones positivas (4-5 ★), el plan entra a la biblioteca.
                    </p>
                </div>
            )}

            {/* Sección de voto */}
            {mensaje ? (
                <p className="text-sm text-emerald-400 font-medium">{mensaje}</p>
            ) : yaVoto ? (
                <p className="text-sm text-neutral-500">Ya valoraste este plan.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    <div>
                        <p className="text-xs text-neutral-400 mb-2">Tu valoración</p>
                        <StarRating value={puntaje} onChange={setPuntaje} disabled={enviando} />
                        {puntaje > 0 && (
                            <p className="text-[10px] text-neutral-600 mt-1">
                                {puntaje >= 4 ? 'Positiva — suma al ratio de congelado' : 'Negativa — no suma al ratio'}
                            </p>
                        )}
                    </div>
                    <textarea
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                        placeholder="Comentario opcional..."
                        maxLength={500}
                        rows={2}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-violet-600/50 resize-none"
                    />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || puntaje === 0}
                        className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {enviando ? 'Enviando...' : 'Enviar valoración'}
                    </button>
                </div>
            )}
        </div>
    );
}

function ModuleSection({ modulo }) {
    const [open, setOpen] = useState(true);
    const done  = modulo.temas?.filter(t => t.completado).length ?? 0;
    const total = modulo.temas?.length ?? 0;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-900/40 transition-colors text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${pct === 100 ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                        M{String(modulo.orden).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{modulo.titulo}</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">{done}/{total} temas · {pct}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="w-20 h-1 bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : '#8b5cf6' }} />
                    </div>
                    <IconChevron open={open} />
                </div>
            </button>

            {open && (
                <div className="border-t border-neutral-800/60 divide-y divide-neutral-800/40">
                    {modulo.temas?.map((tema, i) => (
                        <div key={tema.id} className="px-5 py-3 hover:bg-neutral-900/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${tema.completado ? 'bg-violet-600' : 'border border-neutral-700'}`}>
                                    {tema.completado ? <IconCheck /> : <span className="text-[9px] text-neutral-600">{i + 1}</span>}
                                </div>
                                <span className={`text-sm flex-1 font-medium ${tema.completado ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                                    {tema.titulo}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-700 flex-shrink-0">
                                    {tema.pomodorosEstimados}🍅
                                </span>
                            </div>
                            {tema.subtemas?.length > 0 && (
                                <div className="mt-1.5 ml-8 flex flex-col gap-0.5">
                                    {tema.subtemas.map((sub, j) => (
                                        <div key={j} className="flex items-start gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-violet-500/50 flex-shrink-0 mt-1.5"/>
                                            <span className={`text-[11px] leading-snug ${tema.completado ? 'text-neutral-700' : 'text-neutral-500'}`}>
                                                {sub}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PlanDetailPage() {
    const { planId } = useParams();
    const navigate   = useNavigate();
    const [plan, setPlan]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [clonando, setClonando]     = useState(false);
    const [showMejora, setShowMejora] = useState(false);
    const [iniciandoCert, setIniciandoCert] = useState(false);
    const [yaConCertificado, setYaConCertificado] = useState(false);

    useEffect(() => {
        planService.obtener(planId)
            .then(r => {
                const p = r.data;
                setPlan(p);
                // Verificar si ya existe certificado para este plan
                const maestroId = p.originalPlanId ?? p.id;
                certService.certificados()
                    .then(cr => {
                        const tiene = (cr.data ?? []).some(
                            c => c.planMaestroId === maestroId
                        );
                        setYaConCertificado(tiene);
                    })
                    .catch(() => {});
            })
            .catch(() => navigate('/library'))
            .finally(() => setLoading(false));
    }, [planId]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin"/>
        </div>
    );
    if (!plan) return null;

    const temas      = plan.modulos?.flatMap(m => m.temas) ?? [];
    const completados = temas.filter(t => t.completado).length;
    const progreso   = temas.length > 0 ? Math.round(completados / temas.length * 100) : 0;
    const allDone    = temas.length > 0 && completados === temas.length;

    const iniciarPomodoro = () => navigate('/pomodoro', { state: { plan, openConfig: true } });

    const eliminar = async () => {
        if (!window.confirm('¿Eliminar este plan?')) return;
        await planService.eliminar(plan.id).catch(() => {});
        navigate('/library');
    };

    const agregarAMisPlanes = async () => {
        setClonando(true);
        try {
            const { data } = await planService.clonar(plan.id);
            navigate(`/plan-detail/${data.id}`);
        } catch {
            setClonando(false);
        }
    };

    const totalPomodoros = temas.reduce((s, t) => s + (t.pomodorosEstimados ?? 0), 0);

    const obtenerCertificado = async () => {
        setIniciandoCert(true);
        try {
            const maestroId = plan.originalPlanId ?? plan.id;
            const modulos = plan.modulos?.map(m => ({
                titulo: m.titulo,
                temas: m.temas?.map(t => t.titulo) ?? [],
            })) ?? [];
            const { data } = await certService.iniciar({
                planMaestroId: maestroId,
                planTitulo: plan.titulo,
                modulos,
            });
            navigate(`/examen/${data.id}`, { state: { examen: data, planTitulo: plan.titulo } });
        } catch (e) {
            const msg = e.response?.data?.message || e.response?.data?.mensaje || 'Error al iniciar el examen.';
            alert(msg);
            setIniciandoCert(false);
        }
    };

    return (
        <>
        <div className="flex flex-col min-h-screen bg-[#0a0a0a]">

            {/* ── Banner ── */}
            <div className="relative h-64 md:h-80 overflow-hidden flex-shrink-0">
                <img
                    src={getPlanImage(plan.titulo)}
                    alt={plan.titulo}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-[#0a0a0a]"/>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"/>

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs hover:bg-black/60 transition-all border border-white/10"
                >
                    <IconBack /> Volver
                </button>

                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-10">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded text-white ${NIVEL_COLOR[plan.nivel] ?? 'bg-neutral-700'}`}>
                            {NIVEL_LABEL[plan.nivel] ?? plan.nivel}
                        </span>
                        {plan.esComunitario && (
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-violet-700 text-white">
                                <IconUsers /> Comunidad
                            </span>
                        )}
                        {allDone && !plan.esComunitario && (
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded text-white ${yaConCertificado ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                                {yaConCertificado
                                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                                    : '✓'
                                }
                                {yaConCertificado ? 'Certificado' : 'Completado'}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">
                        {plan.titulo}
                    </h1>
                    <p className="text-sm text-neutral-400">
                        {plan.modulos?.length ?? 0} módulos · {temas.length} temas · {totalPomodoros} pomodoros estimados
                        {!plan.esComunitario && ` · ${progreso}% completado`}
                    </p>
                </div>
            </div>

            {/* ── Barra de progreso (solo planes propios) ── */}
            {!plan.esComunitario && (
                <div className="h-1 w-full bg-neutral-800">
                    <div className="h-full transition-all" style={{ width: `${progreso}%`, backgroundColor: allDone ? '#10b981' : '#8b5cf6' }} />
                </div>
            )}

            {/* ── Acciones + contenido ── */}
            <div className="flex-1 px-4 md:px-10 py-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">

                {/* Botones de acción */}
                {plan.esComunitario ? (
                    <div className="flex flex-wrap gap-3 items-center">
                        <button
                            onClick={agregarAMisPlanes}
                            disabled={clonando}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                        >
                            {clonando
                                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Agregando...</>
                                : <><IconAdd /> Agregar a mis planes</>
                            }
                        </button>
                        <p className="text-xs text-neutral-600">
                            Se creará una copia en tus planes para que puedas estudiar y registrar tu progreso.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={iniciarPomodoro}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${allDone ? 'bg-rose-700 hover:bg-rose-600' : 'bg-violet-600 hover:bg-violet-500'}`}
                        >
                            <IconPlay /> {allDone ? 'Repasar' : 'Iniciar Pomodoro'}
                        </button>

                        {allDone && (
                            yaConCertificado ? (
                                <button
                                    disabled
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40 text-neutral-600 text-sm font-bold cursor-not-allowed"
                                    title="Ya obtuviste el certificado para este plan"
                                >
                                    <IconCert /> Ya Obtenido
                                </button>
                            ) : (
                                <button
                                    onClick={obtenerCertificado}
                                    disabled={iniciandoCert}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-400 text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {iniciandoCert
                                        ? <><div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"/> Preparando examen...</>
                                        : <><IconCert /> Obtener Certificado</>
                                    }
                                </button>
                            )
                        )}

                        <button
                            onClick={() => setShowMejora(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-violet-500/30 hover:bg-violet-600/5 text-neutral-500 hover:text-violet-300 text-sm transition-all"
                            title="Solicitar mejora con IA"
                        >
                            <IconWand /> Mejorar plan
                        </button>
                        <button
                            onClick={eliminar}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/5 text-neutral-600 hover:text-red-400 text-sm transition-all ml-auto"
                            title="Eliminar plan"
                        >
                            <IconTrash /> Eliminar
                        </button>
                    </div>
                )}

                {/* Objetivo */}
                {plan.objetivo && (
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl px-5 py-4">
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Objetivo</p>
                        <p className="text-sm text-neutral-300 leading-relaxed">{plan.objetivo}</p>
                    </div>
                )}

                {/* Valoración — planes comunitarios o en revisión con originalPlanId */}
                {/* Valoración: siempre en planes comunitarios, o al terminar un plan clonado */}
                {(plan.esComunitario || (plan.originalPlanId && allDone)) && (
                    <div className="flex flex-col gap-2">
                        {plan.originalPlanId && allDone && !plan.esComunitario && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                <p className="text-xs text-emerald-400 font-medium">
                                    ¡Completaste el plan! Valora tu experiencia para ayudar a la comunidad.
                                </p>
                            </div>
                        )}
                        <ValoracionSection
                            plan={plan}
                            planMaestroId={plan.originalPlanId ?? plan.id}
                            onVotoEnviado={() =>
                                planService.obtener(planId).then(r => setPlan(r.data)).catch(() => {})
                            }
                        />
                    </div>
                )}

                {/* Módulos */}
                <div>
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        Contenido del Plan
                    </h2>
                    <div className="flex flex-col gap-2">
                        {plan.modulos?.map(m => <ModuleSection key={m.id} modulo={m} />)}
                    </div>
                </div>
            </div>
        </div>

        {showMejora && (
            <MejoraModal
                planId={plan.id}
                onClose={() => setShowMejora(false)}
                onMejorado={planMejorado => setPlan(planMejorado)}
            />
        )}
        </>
    );
}
