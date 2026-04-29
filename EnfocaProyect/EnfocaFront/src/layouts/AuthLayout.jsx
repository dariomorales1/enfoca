import React from 'react';

export default function AuthLayout({children, illustrationStr, title}) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-violet-500/30">

            <header className="flex items-center justify-between p-6 lg:px-12 w-full">
                <div className="text-xl font-bold tracking-tight">Enfoca</div>
                <div className="text-sm text-neutral-400 flex items-center gap-4">
                    <span className="hidden sm:inline">Don't have an account?</span>
                    <button
                        className="bg-[#1a1a1a] hover:bg-[#222222] text-white px-4 py-2 rounded-md font-medium transition-colors border border-neutral-800">
                        Sign Up
                    </button>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 lg:px-12 items-center">

                <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
                    {children}
                </div>

                <div
                    className="hidden lg:flex flex-col justify-end relative rounded-[2rem] overflow-hidden h-[85vh] min-h-[600px] bg-neutral-900 border border-neutral-800/50">
                    <img
                        src="/deep-work.png"
                        alt="Deep work illustration"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="relative p-12 z-10">
                        <p className="text-violet-500 text-xs font-bold tracking-widest uppercase mb-3">
                            Deep Work Protocol
                        </p>
                        <h2 className="text-4xl font-bold text-white mb-2">
                            {title || "Eliminate distractions."}
                        </h2>
                    </div>
                </div>
            </main>

            <footer
                className="p-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-600">
                <p>© 2026 Enfoca Productivity Obsidian Design System.</p>
                <div className="flex gap-6 mt-4 sm:mt-0">
                    <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-neutral-400 transition-colors">Support</a>
                </div>
            </footer>
        </div>
    );
}