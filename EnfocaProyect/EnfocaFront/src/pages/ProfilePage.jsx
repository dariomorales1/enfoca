import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import { profileService } from '../services/api';

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
    { id: 'len',    label: 'Mínimo 8 caracteres',  test: (v) => v.length >= 8 },
    { id: 'letter', label: 'Al menos una letra',   test: (v) => /[a-zA-Z]/.test(v) },
    { id: 'num',    label: 'Al menos un número',   test: (v) => /\d/.test(v) },
];

function Field({ label, value, onChange, type = 'text', placeholder, disabled }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="bg-neutral-900/60 border border-neutral-800 focus:border-neutral-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
        </div>
    );
}

function PasswordField({ label, value, onChange, show, onToggle, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">{label}</label>
            <div className={`flex items-center bg-neutral-900/60 border rounded-lg px-3 py-2.5 transition-colors ${error ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-neutral-600'}`}>
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none"
                    autoComplete="new-password"
                />
                <button type="button" onClick={onToggle} tabIndex={-1} className="text-neutral-600 hover:text-neutral-400 transition-colors">
                    <IconEye open={show} />
                </button>
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate  = useNavigate();

    const [nombre,    setNombre]    = useState(user?.first_name ?? user?.nombre    ?? '');
    const [lastName,  setLastName]  = useState(user?.last_name  ?? user?.lastName  ?? '');
    const [email]                   = useState(user?.email      ?? '');

    const [profileStatus, setProfileStatus] = useState(null);

    const [currentPw,  setCurrentPw]  = useState('');
    const [newPw,      setNewPw]      = useState('');
    const [confirmPw,  setConfirmPw]  = useState('');
    const [showCur,    setShowCur]    = useState(false);
    const [showNew,    setShowNew]    = useState(false);
    const [showCon,    setShowCon]    = useState(false);
    const [pwErrors,   setPwErrors]   = useState({});
    const [pwStatus,   setPwStatus]   = useState(null);
    const [pwCountdown, setPwCountdown] = useState(3);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileStatus('loading');
        try {
            await profileService.updateProfile({ first_name: nombre, last_name: lastName });
            setProfileStatus('success');
        } catch {
            setProfileStatus('error');
        }
    };

    const validatePw = () => {
        const e = {};
        if (!currentPw)                      e.current = 'Ingresa tu contraseña actual.';
        if (!newPw)                          e.newPw   = 'Ingresa la nueva contraseña.';
        else if (!PASSWORD_RULES.every(r => r.test(newPw))) e.newPw = 'La contraseña no cumple los requisitos.';
        if (newPw && confirmPw !== newPw)    e.confirm = 'Las contraseñas no coinciden.';
        else if (!confirmPw)                 e.confirm = 'Confirma la nueva contraseña.';
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
            let secs = 3;
            setPwCountdown(secs);
            const t = setInterval(() => {
                secs -= 1; setPwCountdown(secs);
                if (secs <= 0) { clearInterval(t); navigate('/login'); }
            }, 1000);
        } catch (err) {
            setPwErrors({ current: err.response?.data?.message || 'Contraseña actual incorrecta.' });
            setPwStatus('error');
        }
    };


    const firstName = nombre.split(' ')[0] || 'Usuario';
    const initial   = firstName.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen bg-[#0c0c0c] overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-auto p-6 md:p-8">
                <div className="max-w-xl mx-auto flex flex-col gap-8">

                    {/* Avatar + nombre */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center text-2xl font-bold text-violet-300">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{nombre || 'Mi perfil'}</h1>
                            <p className="text-sm text-neutral-500">{email}</p>
                        </div>
                    </div>

                    {/* Datos personales */}
                    <section className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
                        <h2 className="text-xs font-bold tracking-widest text-white uppercase">Datos personales</h2>

                        {profileStatus === 'success' && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                Perfil actualizado correctamente.
                            </div>
                        )}

                        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Felipe" />
                                <Field label="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ulloa" />
                            </div>
                            <Field label="Correo electrónico" value={email} disabled />
                            <button
                                type="submit"
                                disabled={profileStatus === 'loading'}
                                className="self-end px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {profileStatus === 'loading' ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>
                    </section>

                    {/* Cambiar contraseña */}
                    <section className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
                        <h2 className="text-xs font-bold tracking-widest text-white uppercase">Cambiar contraseña</h2>

                        {pwStatus === 'success' && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                Contraseña actualizada. Redirigiendo en <span className="font-bold">{pwCountdown}s</span>...
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                            <PasswordField label="Contraseña actual" value={currentPw} onChange={e => setCurrentPw(e.target.value)} show={showCur} onToggle={() => setShowCur(v => !v)} error={pwErrors.current} />

                            <div className="flex flex-col gap-1.5">
                                <PasswordField label="Nueva contraseña" value={newPw} onChange={e => setNewPw(e.target.value)} show={showNew} onToggle={() => setShowNew(v => !v)} error={pwErrors.newPw} />
                                {newPw.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        {PASSWORD_RULES.map(r => {
                                            const ok = r.test(newPw);
                                            return (
                                                <div key={r.id} className={`flex items-center gap-2 text-[11px] ${ok ? 'text-emerald-400' : 'text-neutral-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                                                    {r.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <PasswordField label="Confirmar contraseña" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} show={showCon} onToggle={() => setShowCon(v => !v)} error={pwErrors.confirm} />

                            <button
                                type="submit"
                                disabled={pwStatus === 'loading' || pwStatus === 'success'}
                                className="self-end px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {pwStatus === 'loading' ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </form>
                    </section>


                </div>
            </div>
        </div>
    );
}
