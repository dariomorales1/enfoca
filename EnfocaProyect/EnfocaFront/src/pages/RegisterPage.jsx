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
            setError('You must agree to the Terms of Service.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const registerData = {
                nombre,
                email,
                password
            };

            await authService.register(registerData);

            navigate('/login', {state: {message: 'Account created! Please log in.'}});

        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Check your data.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Precision productivity for the academic mind."
                    imageSrc="/deep-work-register.png"
                    imageAlt="Student focusing in a library"
                />
            }
            invertOrder={true}
        >
            <div className="flex flex-col justify-center h-full">
                <div className="mb-[clamp(0.75rem,2vh,1.5rem)]">
                    <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-white tracking-tight">Create
                        Account</h1>
                    <p className="text-neutral-400 text-xs lg:text-sm">Deep work starts here.</p>
                </div>

                {error && (
                    <div
                        className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-pulse">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-[clamp(0.5rem,1.2vh,1rem)]" onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="Alex Rivers"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="alex@university.edu"
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
                            I agree to the <a href="#"
                                              className="text-violet-500 hover:text-violet-400 transition-colors">Terms
                            of Service</a> and <a href="#"
                                                  className="text-violet-500 hover:text-violet-400 transition-colors">Privacy
                            Policy</a>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-[clamp(0.6rem,1.2vh,0.875rem)] rounded-lg transition-all mt-1 flex justify-center items-center text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <div
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="flex items-center my-[clamp(0.75rem,2vh,1.5rem)]">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="px-4 text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Or register with</span>
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

                <div className="mt-[clamp(0.75rem,2vh,1.5rem)] text-center text-xs text-neutral-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </SplitCardLayout>
    );
}