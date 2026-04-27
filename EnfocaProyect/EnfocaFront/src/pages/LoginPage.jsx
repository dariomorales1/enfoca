import React from 'react';
import SplitCardLayout from '../components/common/SplitCardLayout';
import AuthSidebarGraphic from '../components/auth/AuthSidebarGraphic';
import Input from '../components/common/Input'; // Asumiendo que reutilizas tu Input

export default function LoginPage() {
    return (
        <SplitCardLayout
            graphicContent={
                <AuthSidebarGraphic
                    headlineText="Eliminate distractions."
                    imageSrc="/deep-work.png"
                    imageAlt="Setup whit focused atmosphere"
                />
            }
            invertOrder={false}
        >
            <h1 className="text-3xl font-semibold mb-2 text-white">Welcome back</h1>
            <p className="text-neutral-400 text-sm mb-8">Resume your deep work session.</p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@university.edu"
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    rightElement={
                        <a href="#" className="text-xs text-violet-500 hover:text-violet-400 transition-colors">
                            Forgot Password?
                        </a>
                    }
                />

                <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors mt-4"
                >
                    Sign In
                </button>
            </form>

            <div className="flex items-center my-8">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="px-4 text-[10px] uppercase tracking-widest text-neutral-500">Or continue with</span>
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

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-600"></div>
                Secure Academic Gateway
            </div>
        </SplitCardLayout>
    );
}