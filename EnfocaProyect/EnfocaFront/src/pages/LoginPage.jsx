import React, {useState} from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
import {authService} from '../services/api';

export default function LoginPage() {
    // 1. Estados para el formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 2. Hooks de Auth y Navegación
    const {login} = useAuth();
    const navigate = useNavigate();

    // 3. Manejador del envío
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Llamada al servicio de Axios que creamos
            const response = await authService.login({email, password});

            // Si el backend devuelve el token y los datos del usuario
            const {token, user} = response.data;

            // Guardamos en el Contexto (esto actualiza toda la app)
            login(token, user);

            // Redirigimos al dashboard o página principal
            navigate('/');
        } catch (err) {
            // Manejo de errores (ej: credenciales incorrectas)
            const message = err.response?.data?.message || 'Connection failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Eliminate distractions."
                    imageSrc="/deep-work.png"
                    imageAlt="Setup with focused atmosphere"
                />
            }
            invertOrder={false}
        >
            {/* Envolvemos todo en un flex-col que ocupe el alto disponible y distribuya el espacio */}
            <div className="flex flex-col justify-center h-full">

                {/* Cabecera con márgenes ajustados */}
                <div className="mb-[clamp(1rem,2.5vh,2rem)]">
                    <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-white tracking-tight">Welcome back</h1>
                    <p className="text-neutral-400 text-xs lg:text-sm">Resume your deep work session.</p>
                </div>

                {/* Mostrar mensaje de error si existe */}
                {error && (
                    <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {error}
                    </div>
                )}

                {/* Formulario con gap dinámico en lugar de space-y fijo */}
                <form className="flex flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)]" onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        rightElement={
                            <Link to="/recover"
                                  className="text-[10px] lg:text-xs text-violet-500 hover:text-violet-400 transition-colors">
                                Forgot Password?
                            </Link>
                        }
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-[clamp(0.6rem,1.2vh,0.875rem)] rounded-lg transition-colors mt-2 flex justify-center items-center text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Divisor más compacto */}
                <div className="flex items-center my-[clamp(1rem,2.5vh,2rem)]">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="px-4 text-[9px] uppercase tracking-widest text-neutral-500">Or continue with</span>
                    <div className="flex-grow border-t border-neutral-800"></div>
                </div>

                {/* Botones sociales ajustados */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2 rounded-lg text-xs font-medium text-neutral-300 transition-colors">
                        Google
                    </button>
                    <button
                        className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2 rounded-lg text-xs font-medium text-neutral-300 transition-colors">
                        Apple
                    </button>
                </div>

                {/* Enlaces inferiores pegados al final */}
                <div className="mt-[clamp(1rem,2.5vh,2rem)] text-center text-xs text-neutral-500">
                    Don't have an account?{' '}
                    <Link to="/register"
                          className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                        Sign up
                    </Link>
                </div>

                <div
                    className="mt-4 flex items-center justify-center gap-2 text-[10px] lg:text-xs text-neutral-600 italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-600"></div>
                    Secure Academic Gateway
                </div>
            </div>
        </SplitCardLayout>
    );
}