import React, { useState } from 'react';
import SplitCardLayout from '../layouts/SplitCardLayout.jsx';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // ✅ Ruta correcta

// (Iconos se mantienen intactos)
const IconEye = ({ open }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
);

function errorMessage(status, backendMsg) {
    if (status === 404) return 'No existe una cuenta con ese correo electrónico.';
    if (status === 401 || status === 403) return 'Contraseña incorrecta. Verifica tus credenciales.';
    if (status >= 500) return 'Error del servidor. Intenta de nuevo más tarde.';
    if (status === 0) return 'No se pudo conectar. Verifica tu conexión.';
    return backendMsg || 'Credenciales incorrectas.';
}

export default function LoginPage() {
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [showPass, setShowPass]     = useState(false);
    const [isLoading, setIsLoading]   = useState(false);
    const [error, setError]           = useState('');

    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login({ email, password });
            if (result?.success) {
                navigate('/dashboard');
            } else {
                setError(errorMessage(result?.status, result?.error));
                setIsLoading(false);
            }
        } catch {
            setError('No se pudo conectar. Verifica tu conexión.');
            setIsLoading(false);
        }
    };

    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Elimina las distracciones."
                    imageSrc="/deep-work.png"
                    imageAlt="Espacio de trabajo enfocado"
                />
            }
            invertOrder={false}
        >
            {/* Agregamos py-4 en móvil para que respire, ya que el Layout permite altura dinámica */}
            <div className="flex flex-col justify-center h-full py-4 sm:py-0 w-full max-w-sm mx-auto">

                <div className="mb-6 sm:mb-8 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-semibold mb-1.5 text-white tracking-tight">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Retoma tu sesión de trabajo profundo.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                        <span className="mt-px flex-shrink-0"><IconAlert /></span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Cambiamos los gaps rígidos por gap-4 (1rem) estándar para estabilidad con teclado */}
                <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
                    <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Campo contraseña con toggle */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[11px] sm:text-xs font-medium text-neutral-400">
                                Contraseña
                            </label>
                            <Link
                                to="/recover"
                                className="text-[11px] sm:text-xs text-violet-500 hover:text-violet-400 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                /* Clases nativas de Tailwind en lugar de clamp() para evitar saltos de teclado */
                                className="w-full bg-[#111111] border border-neutral-800 rounded-lg
                                           px-3 py-2.5 sm:py-3 pr-10
                                           text-sm
                                           text-white placeholder-neutral-700 focus:outline-none
                                           focus:border-violet-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                                tabIndex={-1}
                                aria-label={showPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                                <IconEye open={showPass} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        /* py-3 (12px) es el tamaño mínimo recomendado por Apple/Google para botones touch */
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 sm:py-3 rounded-lg transition-all mt-2 sm:mt-4 flex justify-center items-center text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>

                <div className="mt-6 sm:mt-8 text-center text-sm text-neutral-500">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                        Regístrate
                    </Link>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-neutral-600 italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                    Acceso Académico Seguro
                </div>
            </div>
        </SplitCardLayout>
    );
}