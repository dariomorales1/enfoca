import React, {useState} from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {login} = useAuth(); // Usamos el login del Contexto
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login({email, password});

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Invalid credentials');
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
            <div className="flex flex-col justify-center h-full">
                <div className="mb-[clamp(1rem,2.5vh,2rem)]">
                    <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-white tracking-tight">Welcome back</h1>
                    <p className="text-neutral-400 text-xs lg:text-sm">Resume your deep work session.</p>
                </div>

                {error && (
                    <div
                        className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in duration-300">
                        {error}
                    </div>
                )}

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
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-[clamp(0.6rem,1.2vh,0.875rem)] rounded-lg transition-all mt-2 flex justify-center items-center text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="flex items-center my-[clamp(1rem,2.5vh,2rem)]">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="px-4 text-[9px] uppercase tracking-widest text-neutral-500">Or continue with</span>
                    <div className="flex-grow border-t border-neutral-800"></div>
                </div>

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