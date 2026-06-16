import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { profileService, gamificationService, metricsService, certService } from '../services/api';
import { Flame, Clock, BookOpen, Trophy, Shield, Settings, LayoutDashboard } from 'lucide-react';

import StatCard       from '../components/profile/StatCard';
import BadgeGenerator from '../components/badges/BadgeGenerator';

const IconPdf      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconLinkedin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const IconTwitter  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconCopy     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconVerify   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ── Componentes del formulario ──────────────────────────────────────
const IconEye = ({ open }) => open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

const PASSWORD_RULES = [
    { id: 'len',    label: 'Mínimo 8 caracteres',  test: v => v.length >= 8 },
    { id: 'letter', label: 'Al menos una letra',   test: v => /[a-zA-Z]/.test(v) },
    { id: 'num',    label: 'Al menos un número',   test: v => /\d/.test(v) },
];

function Field({ label, value, onChange, type = 'text', placeholder, disabled }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="bg-neutral-900/60 border border-neutral-800 focus:border-neutral-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"/>
        </div>
    );
}

function PasswordField({ label, value, onChange, show, onToggle, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">{label}</label>
            <div className={`flex items-center bg-neutral-900/60 border rounded-lg px-3 py-2.5 transition-colors ${error ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-neutral-600'}`}>
                <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
                    className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none" autoComplete="new-password"/>
                <button type="button" onClick={onToggle} tabIndex={-1} className="text-neutral-600 hover:text-neutral-400 transition-colors">
                    <IconEye open={show}/>
                </button>
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>
    );
}

// ── Skeleton ────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`bg-neutral-800/60 rounded-lg animate-pulse ${className}`}/>;

export default function ProfilePage() {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // ── Datos reales ────────────────────────────────────────────────
    const [gamif,    setGamif]    = useState(null);
    const [metrics,  setMetrics]  = useState(null);
    const [certs,    setCerts]    = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        Promise.all([
            gamificationService.getPerfil().then(r => r.data).catch(() => null),
            metricsService.getSummary().then(r => r.data).catch(() => null),
            certService.certificados().then(r => r.data ?? []).catch(() => []),
        ]).then(([g, m, c]) => {
            setGamif(g);
            setMetrics(m);
            setCerts(c);
        }).finally(() => setLoadingData(false));
    }, []);

    // ── Acciones certificados ────────────────────────────────────────
    const [descargandoId, setDescargandoId] = useState(null);
    const [copiadoId,     setCopiadoId]     = useState(null);

    const handleDownloadPdf = async (cert) => {
        setDescargandoId(cert.id);
        try {
            const nombre = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Participante';
            const res = await certService.descargarPdf(cert.id, nombre);
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a   = document.createElement('a');
            a.href     = url;
            a.download = `certificado-enfoca-${cert.codigoVerificacion}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error descargando PDF', e);
        } finally {
            setDescargandoId(null);
        }
    };

    const handleCopyLink = async (cert) => {
        const url = `https://enfoca.online/verificar/${cert.codigoVerificacion}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiadoId(cert.id);
            setTimeout(() => setCopiadoId(null), 2000);
        } catch { /* fallback silencioso */ }
    };

    const shareLinkedin = (cert) => {
        const url = `https://enfoca.online/verificar/${cert.codigoVerificacion}`;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    };

    const shareTwitter = (cert) => {
        const url  = `https://enfoca.online/verificar/${cert.codigoVerificacion}`;
        const text = encodeURIComponent(`Obtuve mi certificado en "${cert.planTitulo}" con @EnfocaApp 🎓`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    };

    // ── Formulario perfil ────────────────────────────────────────────
    const [nombre,    setNombre]    = useState(user?.first_name ?? user?.nombre    ?? '');
    const [lastName,  setLastName]  = useState(user?.last_name  ?? user?.lastName  ?? '');
    const [email]                   = useState(user?.email ?? '');
    const [profileStatus, setProfileStatus] = useState(null);

    const [currentPw, setCurrentPw] = useState('');
    const [newPw,     setNewPw]     = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCur,   setShowCur]   = useState(false);
    const [showNew,   setShowNew]   = useState(false);
    const [showCon,   setShowCon]   = useState(false);
    const [pwErrors,  setPwErrors]  = useState({});
    const [pwStatus,  setPwStatus]  = useState(null);
    const [pwCountdown, setPwCountdown] = useState(3);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileStatus('loading');
        try {
            await profileService.updateProfile({ first_name: nombre, last_name: lastName });
            setProfileStatus('success');
        } catch { setProfileStatus('error'); }
    };

    const validatePw = () => {
        const e = {};
        if (!currentPw) e.current = 'Ingresa tu contraseña actual.';
        if (!newPw) e.newPw = 'Ingresa la nueva contraseña.';
        else if (!PASSWORD_RULES.every(r => r.test(newPw))) e.newPw = 'La contraseña no cumple los requisitos.';
        if (newPw && confirmPw !== newPw) e.confirm = 'Las contraseñas no coinciden.';
        else if (!confirmPw) e.confirm = 'Confirma la nueva contraseña.';
        return e;
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const errs = validatePw();
        setPwErrors(errs);
        if (Object.keys(errs).length) return;
        setPwStatus('loading');
        try {
            await profileService.changePassword({ currentPassword: currentPw, newPassword: newPw });
            setPwStatus('success');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            let secs = 3; setPwCountdown(secs);
            const t = setInterval(() => {
                secs -= 1; setPwCountdown(secs);
                if (secs <= 0) { clearInterval(t); navigate('/login'); }
            }, 1000);
        } catch (err) {
            setPwErrors({ current: err.response?.data?.message || 'Contraseña actual incorrecta.' });
            setPwStatus('error');
        }
    };

    const firstName  = nombre.split(' ')[0] || 'Usuario';
    const initial    = firstName.charAt(0).toUpperCase();

    // ── Datos de gamificación ────────────────────────────────────────
    const xpTotal       = gamif?.xpTotal ?? 0;
    const nivel         = gamif?.nivel ?? 1;
    const xpNivelActual = gamif?.xpNivelActual ?? 0;
    const xpSiguiente   = gamif?.xpSiguienteNivel ?? 100;
    const xpProgreso    = gamif?.xpProgreso ?? 0;
    const xpPct         = xpSiguiente > 0 ? Math.min(100, Math.round((xpProgreso / xpSiguiente) * 100)) : 0;
    const titulo        = nivelTitulo(nivel);

    // ── Métricas ────────────────────────────────────────────────────
    const focusHours    = metrics ? Math.round((metrics.focusedMinutesTotal ?? 0) / 60) : 0;
    const streak        = metrics?.currentStreak ?? 0;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center text-2xl font-bold text-violet-300">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-2xl font-light tracking-tight text-white mb-1">{nombre || 'Mi perfil'}</h1>
                            <p className="text-sm text-neutral-500 font-mono">{email}</p>
                        </div>
                    </div>
                </header>

                {/* Pestañas */}
                <div className="flex items-center gap-6 border-b border-neutral-800">
                    <button onClick={() => setActiveTab('dashboard')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-violet-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                        <LayoutDashboard className="w-4 h-4"/> Gamificación
                    </button>
                    <button onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'settings' ? 'border-violet-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                        <Settings className="w-4 h-4"/> Ajustes de Cuenta
                    </button>
                </div>

                {/* ── GAMIFICACIÓN ── */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Progreso XP */}
                        <section className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full"/>
                            <div className="flex-1 w-full relative z-10">
                                {loadingData ? (
                                    <div className="flex flex-col gap-3">
                                        <Skeleton className="h-4 w-48"/>
                                        <Skeleton className="h-1.5 w-full"/>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-violet-400 text-sm font-mono tracking-widest uppercase mb-6">
                                            <Shield className="w-4 h-4"/>
                                            {titulo} (Nivel {nivel})
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs text-neutral-500 font-mono mb-2">
                                                <span>{xpTotal.toLocaleString()} XP total</span>
                                                <span>{xpSiguiente.toLocaleString()} XP para Nivel {nivel + 1}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                                    style={{ width: `${xpPct}%` }}/>
                                            </div>
                                            <p className="text-[10px] text-neutral-600 mt-1 font-mono">{xpProgreso.toLocaleString()} / {xpSiguiente.toLocaleString()} XP en este nivel</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Stats */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {loadingData ? (
                                [0,1,2].map(i => <Skeleton key={i} className="h-32"/>)
                            ) : (
                                <>
                                    <StatCard icon={Clock} label="Horas de Enfoque" value={focusHours} subtext="Tiempo total acumulado" color="blue"/>
                                    <StatCard icon={Flame} label="Racha Actual" value={`${streak} Días`} subtext={streak >= 7 ? '¡Racha increíble!' : '¡No rompas la cadena!'} color="amber"/>
                                    <StatCard icon={BookOpen} label="Certificados" value={certs.length} subtext={certs.length > 0 ? `Último: ${certs[0]?.planTitulo ?? ''}` : 'Completa tu primer plan'} color="emerald"/>
                                </>
                            )}
                        </section>

                        {/* Vitrina */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
                                <Trophy className="w-5 h-5 text-violet-400"/>
                                <h2 className="text-lg font-medium text-white">Vitrina de Logros</h2>
                                {certs.length > 0 && (
                                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                                        {certs.length} certificado{certs.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {loadingData ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[0,1,2].map(i => <Skeleton key={i} className="h-48"/>)}
                                </div>
                            ) : certs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {certs.map(cert => (
                                        <div key={cert.id}
                                            className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-5 flex gap-5 hover:border-violet-500/30 transition-all">

                                            {/* Badge */}
                                            <div className="w-24 shrink-0 self-start">
                                                <BadgeGenerator title={cert.planTitulo}/>
                                            </div>

                                            {/* Info + acciones */}
                                            <div className="flex flex-col justify-between flex-1 min-w-0 gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                                                        {cert.planTitulo}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 mt-1">
                                                        {cert.puntaje}/10 &nbsp;·&nbsp;
                                                        {new Date(cert.emitidoEn).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                {/* Botones de acción */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadPdf(cert)}
                                                        disabled={descargandoId === cert.id}
                                                        title="Descargar PDF"
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium hover:bg-amber-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        <IconPdf/> {descargandoId === cert.id ? '...' : 'PDF'}
                                                    </button>
                                                    <button
                                                        onClick={() => shareLinkedin(cert)}
                                                        title="Compartir en LinkedIn"
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#5BA4F5] text-[10px] font-medium hover:bg-[#0A66C2]/20 transition-all"
                                                    >
                                                        <IconLinkedin/> LinkedIn
                                                    </button>
                                                    <button
                                                        onClick={() => shareTwitter(cert)}
                                                        title="Compartir en X / Twitter"
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-medium hover:bg-neutral-700 transition-all"
                                                    >
                                                        <IconTwitter/> X
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyLink(cert)}
                                                        title="Copiar enlace de verificación"
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-medium hover:bg-neutral-700 transition-all"
                                                    >
                                                        <IconCopy/> {copiadoId === cert.id ? '¡Copiado!' : 'Enlace'}
                                                    </button>
                                                </div>

                                                {/* Enlace de verificación */}
                                                <Link
                                                    to={`/verificar/${cert.codigoVerificacion}`}
                                                    className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-400 transition-colors w-fit"
                                                >
                                                    <IconVerify/> Ver verificación pública
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-neutral-800 rounded-2xl gap-3">
                                    <Trophy className="w-8 h-8 text-neutral-700"/>
                                    <p className="text-sm text-neutral-500">Aún no tienes certificados</p>
                                    <p className="text-xs text-neutral-700 text-center max-w-xs">
                                        Completa un plan de estudio al 100% y aprueba el examen para obtener tu primera chapita
                                    </p>
                                    <button onClick={() => navigate('/library')}
                                        className="mt-2 px-4 py-2 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs hover:bg-violet-600/20 transition-all">
                                        Ver biblioteca
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* ── AJUSTES ── */}
                {activeTab === 'settings' && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
                            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Datos personales</h2>
                            {profileStatus === 'success' && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">Perfil actualizado correctamente.</div>}
                            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Nombre"   value={nombre}    onChange={e => setNombre(e.target.value)}    placeholder="Felipe"/>
                                    <Field label="Apellido" value={lastName}  onChange={e => setLastName(e.target.value)}  placeholder="Ulloa"/>
                                </div>
                                <Field label="Correo electrónico" value={email} disabled/>
                                <button type="submit" disabled={profileStatus === 'loading'}
                                    className="self-end px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                                    {profileStatus === 'loading' ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </form>
                        </section>

                        <section className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
                            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Cambiar contraseña</h2>
                            {pwStatus === 'success' && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">Contraseña actualizada. Redirigiendo en <span className="font-bold">{pwCountdown}s</span>...</div>}
                            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                                <PasswordField label="Contraseña actual"   value={currentPw} onChange={e => setCurrentPw(e.target.value)} show={showCur} onToggle={() => setShowCur(v => !v)} error={pwErrors.current}/>
                                <div className="flex flex-col gap-1.5">
                                    <PasswordField label="Nueva contraseña" value={newPw}     onChange={e => setNewPw(e.target.value)}     show={showNew} onToggle={() => setShowNew(v => !v)} error={pwErrors.newPw}/>
                                    {newPw.length > 0 && (
                                        <div className="flex flex-col gap-1 mt-1">
                                            {PASSWORD_RULES.map(r => {
                                                const ok = r.test(newPw);
                                                return (
                                                    <div key={r.id} className={`flex items-center gap-2 text-[11px] ${ok ? 'text-emerald-400' : 'text-neutral-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-400' : 'bg-neutral-700'}`}/>
                                                        {r.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <PasswordField label="Confirmar contraseña" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} show={showCon} onToggle={() => setShowCon(v => !v)} error={pwErrors.confirm}/>
                                <button type="submit" disabled={pwStatus === 'loading' || pwStatus === 'success'}
                                    className="self-end px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                                    {pwStatus === 'loading' ? 'Actualizando...' : 'Actualizar contraseña'}
                                </button>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

function nivelTitulo(nivel) {
    if (nivel <= 3)  return 'Explorador';
    if (nivel <= 7)  return 'Estudiante Dedicado';
    if (nivel <= 12) return 'Erudito Socrático';
    if (nivel <= 20) return 'Maestro del Enfoque';
    if (nivel <= 30) return 'Sabio Académico';
    return 'Leyenda del Conocimiento';
}
