import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full bg-black border-t border-neutral-900 px-6 lg:px-12 py-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Izquierda: Logo y Copyright */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Enfoca" className="h-10 w-auto object-contain" />
                        </div>
                    <span className="text-xs text-neutral-600">
            © 2026 ENFOCA. BUILT FOR HIGH PERFORMANCE.
          </span>
                </div>

                {/* Derecha: Enlaces */}
                <div className="flex items-center gap-6 text-xs font-medium tracking-wide text-neutral-500">
                    <Link to="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">TERMS</Link>
                    <Link to="/resources" className="hover:text-white transition-colors">RESOURCES</Link>
                    <Link to="/api" className="hover:text-white transition-colors">API</Link>
                </div>
            </div>
        </footer>
    );
}