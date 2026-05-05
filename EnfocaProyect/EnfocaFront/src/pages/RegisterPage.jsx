import React, {useState} from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import {Link, useNavigate} from 'react-router-dom';
import {authService} from '../services/api';

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setError('Debes aceptar los Términos de servicio para continuar.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const registerData = {
                firstName: nombre,
                email,
                password
            };

            await authService.register(registerData);
            navigate('/login', {state: {message: '¡Cuenta creada! Inicia sesión para continuar.'}});

        } catch (err) {
            if (err.response?.status === 409) {
                setError('Este correo ya está registrado.');
            } else {
                const message = err.response?.data?.message || 'Error al registrar. Verifica tus datos.';
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Productividad de precisión para la mente académica."
                    imageSrc="/deep-work-register.png"
                    imageAlt="Estudiante enfocado en biblioteca"
                />
            }
            invertOrder={true}
        >
            <div className="flex flex-col justify-center h-full">
                <div className="mb-[clamp(0.75rem,2vh,1.5rem)]">
                    <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-white tracking-tight">Crear cuenta</h1>
                    <p className="text-neutral-400 text-xs lg:text-sm">El trabajo profundo comienza aquí.</p>
                </div>

                {error && (
                    <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-[clamp(0.5rem,1.2vh,1rem)]" onSubmit={handleSubmit}>
                    <Input
                        label="Nombre completo"
                        type="text"
                        placeholder="Alejandro Ríos"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="nombre@universidad.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex items-start gap-2.5 py-1">
                        <div className="flex items-center mt-0.5">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-neutral-800 bg-[#111111] accent-violet-600 focus:ring-violet-500 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="terms" className="text-[10px] lg:text-xs text-neutral-400 leading-tight">
                            Acepto los{' '}
                            <a href="#" className="text-violet-500 hover:text-violet-400 transition-colors">Términos de servicio</a>
                            {' '}y la{' '}
                            <a href="#" className="text-violet-500 hover:text-violet-400 transition-colors">Política de privacidad</a>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-[clamp(0.6rem,1.2vh,0.875rem)] rounded-lg transition-all mt-1 flex justify-center items-center text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        ) : (
                            'Crear cuenta'
                        )}
                    </button>
                </form>

                <div className="flex items-center my-[clamp(0.75rem,2vh,1.5rem)]">
                    <div className="flex-grow border-t border-neutral-800"/>
                    <span className="px-4 text-[9px] uppercase tracking-widest text-neutral-500 font-bold">O regístrate con</span>
                    <div className="flex-grow border-t border-neutral-800"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2 rounded-lg text-xs font-medium text-neutral-300 transition-colors">
                        Google
                    </button>
                    <button className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2 rounded-lg text-xs font-medium text-neutral-300 transition-colors">
                        Apple
                    </button>
                </div>

                <div className="mt-[clamp(0.75rem,2vh,1.5rem)] text-center text-xs text-neutral-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </SplitCardLayout>
    );
}
