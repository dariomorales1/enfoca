import React, {useState} from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import {Link} from 'react-router-dom';
import {authService} from '../services/api';

export default function RecoverAccountPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({type: '', message: ''}); // 'success' o 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({type: '', message: ''});

        try {
            await authService.forgotPassword(email);

            setStatus({
                type: 'success',
                message: 'Instructions have been sent to your email.'
            });
            setEmail(''); // Limpiamos el input tras el éxito
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setStatus({type: 'error', message: errorMsg});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Regain access to your focused workspace."
                    imageSrc="/recovery.png"
                    imageAlt="Abstract secure connection graphic"
                />
            }
            invertOrder={false}
        >
            <div className="flex flex-col justify-center h-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">Recover Account</h1>
                    <p className="text-neutral-400 text-sm">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {status.message && (
                    <div className={`mb-6 p-3 rounded-lg text-xs border ${
                        status.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        {status.message}
                    </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || status.type === 'success'}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || status.type === 'success'}
                        className={`w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-all flex justify-center items-center ${
                            (isLoading || status.type === 'success') ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'
                        }`}
                    >
                        {isLoading ? (
                            <div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="mt-12 flex flex-col items-center gap-4 text-xs">
                    <p className="text-neutral-500">
                        Already have an account?{' '}
                        <Link to="/login"
                              className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                            Login
                        </Link>
                    </p>

                    <div className="flex items-center gap-2 text-neutral-600 italic">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        Secure Academic Gateway
                    </div>
                </div>
            </div>
        </SplitCardLayout>
    );
}