import React from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom'

export default function RecoverAccountPage() {
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
            {/* Cabecera del Formulario */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2 text-white">Recover Account</h1>
                <p className="text-neutral-400 text-sm">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@university.edu"
                />

                <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors"
                >
                    Send Reset Link
                </button>
            </form>

            <div className="mt-12 flex flex-col items-center gap-4 text-xs">
                <p className="text-neutral-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                        Login
                    </Link>
                </p>

                <div className="flex items-center gap-2 text-neutral-600 italic">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Academic Gateway
                </div>
            </div>
        </SplitCardLayout>
    );
}