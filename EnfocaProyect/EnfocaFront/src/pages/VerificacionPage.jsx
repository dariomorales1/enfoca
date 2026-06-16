import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certService } from '../services/api.jsx';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const IconShield  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconCheck   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function VerificacionPage() {
    const { codigo } = useParams();
    const [cert, setCert]     = useState(null);
    const [estado, setEstado] = useState('cargando'); // cargando | valido | invalido

    useEffect(() => {
        certService.verificar(codigo)
            .then(({ data }) => { setCert(data); setEstado('valido'); })
            .catch(() => setEstado('invalido'));
    }, [codigo]);

    const fechaFormateada = cert?.emitidoEn
        ? new Date(cert.emitidoEn).toLocaleDateString('es-CL', {
              day: '2-digit', month: 'long', year: 'numeric'
          })
        : null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-16">
            <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">

                {/* Logo / Marca */}
                <Link to="/" className="text-2xl font-black tracking-tight text-white mb-2">
                    enfo<span className="text-violet-500">ca</span>
                </Link>

                {estado === 'cargando' && (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"/>
                        <p className="text-neutral-500 text-sm">Verificando certificado...</p>
                    </div>
                )}

                {estado === 'invalido' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                            <IconX />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white mb-1">Certificado no encontrado</h1>
                            <p className="text-neutral-500 text-sm">El código de verificación no corresponde a ningún certificado válido.</p>
                        </div>
                        <Link to="/" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            Volver al inicio
                        </Link>
                    </div>
                )}

                {estado === 'valido' && cert && (
                    <>
                        {/* Estado: válido */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <IconShield />
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                                <span className="text-emerald-400"><IconCheck /></span>
                                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Certificado válido</span>
                            </div>
                        </div>

                        {/* Datos del certificado */}
                        <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">Plan de estudio</p>
                                <p className="text-white font-bold text-lg leading-snug">{cert.planTitulo}</p>
                            </div>

                            <div className="h-px bg-neutral-800"/>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">Puntuación</p>
                                    <p className="text-white font-bold">{cert.puntaje}<span className="text-neutral-500 font-normal">/10</span></p>
                                </div>
                                {fechaFormateada && (
                                    <div>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">Emitido el</p>
                                        <p className="text-white text-sm">{fechaFormateada}</p>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-neutral-800"/>

                            <div className="text-left">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">Código de verificación</p>
                                <p className="text-xs font-mono text-neutral-400 break-all">{cert.codigoVerificacion}</p>
                            </div>
                        </div>

                        {/* QR de verificación */}
                        <div className="flex flex-col items-center gap-2">
                            <img
                                src={`${API_URL}/certificacion/verificar/${codigo}/qr`}
                                alt="QR de verificación"
                                className="w-32 h-32 rounded-xl border border-neutral-800 bg-white p-1"
                            />
                            <p className="text-[10px] text-neutral-600">Escanea para compartir este certificado</p>
                        </div>

                        {/* Open Badge link */}
                        <a
                            href={`${API_URL}/certificacion/assertions/${cert.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-500 hover:text-violet-400 transition-colors"
                        >
                            Ver Open Badge (IMS Open Badges 2.0) →
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
