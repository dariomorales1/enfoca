// src/components/common/Footer.jsx
import {Link} from "react-router-dom";

export default function Footer() {
    return (
        <footer
            className="relative z-50 w-full bg-black border-t border-neutral-900 px-6 lg:px-12 py-4"> {/* py-8 -> py-4 */}
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Enfoca" className="h-7 w-auto"/>
                    <span className="text-[10px] text-neutral-600 tracking-widest">
            © 2026. HIGH PERFORMANCE.
          </span>
                </div>

                <div className="flex gap-4 text-[12px] font-bold text-neutral-500 tracking-tighter uppercase">
                    <Link to="/privacy" className="hover:text-white">PRIVACY</Link>
                    <Link to="/terms" className="hover:text-white">TERMS</Link>
                </div>
            </div>
        </footer>
    );
}