import React from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input';

export default function RegisterPage() {
    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Precision productivity for the academic mind."
                    imageSrc="/deep-work-register.png"
                    imageAlt="Setup whit focused atmosphere girl"
                />
            }

            invertOrder={true}
        >
            <div className="mb-6">
                <h1 className="text-3xl font-semibold mb-2 text-white">Create Account</h1>
                <p className="text-neutral-400 text-sm">Deep work starts here.</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <Input
                    label="Full Name"
                    type="text"
                    placeholder="Alex Rivers"
                />

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@university.edu"
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                />

                {/* Checkbox de Términos y Privacidad */}
                <div className="flex items-start gap-3 py-2">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            type="checkbox"
                            className="w-4 h-4 rounded border-neutral-800 bg-[#111111] accent-violet-600 focus:ring-violet-500"
                        />
                    </div>
                    <label htmlFor="terms" className="text-xs text-neutral-400 leading-normal">
                        I agree to the <a href="#" className="text-violet-500 hover:underline">Terms of Service</a> and <a href="#" className="text-violet-500 hover:underline">Privacy Policy</a>.
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors mt-2"
                >
                    Create Account
                </button>
            </form>

            {/* Social Register */}
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="px-4 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Or register with</span>
                <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2.5 rounded-lg text-sm font-medium text-neutral-300 transition-colors">
                    Google
                </button>
                <button className="flex justify-center items-center gap-2 bg-black border border-neutral-800 hover:bg-neutral-800 py-2.5 rounded-lg text-sm font-medium text-neutral-300 transition-colors">
                    Apple
                </button>
            </div>

            {/* Link de retorno al Login */}
            <div className="mt-8 text-center text-xs text-neutral-500">
                Already have an account?{' '}
                <a href="#" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                    Login
                </a>
            </div>
        </SplitCardLayout>
    );
}