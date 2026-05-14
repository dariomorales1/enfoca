import { useState } from 'react';
import LegalModal from './LegalModal';

export default function Footer() {
    const [modal, setModal] = useState(null);

    return (
        <>
            <footer className="relative z-50 w-full bg-black border-t border-neutral-900 px-6 lg:px-12 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Enfoca" className="h-7 w-auto"/>
                        <span className="text-[10px] text-neutral-600 tracking-widest">
                            © {new Date().getFullYear()} Enfoca
                        </span>
                    </div>
                    <div className="flex gap-4 text-[12px] font-bold text-neutral-500 tracking-tighter uppercase">
                        <button
                            onClick={() => setModal('privacidad')}
                            className="hover:text-white transition-colors"
                        >
                            Privacidad
                        </button>
                        <button
                            onClick={() => setModal('terminos')}
                            className="hover:text-white transition-colors"
                        >
                            Términos
                        </button>
                    </div>
                </div>
            </footer>

            {modal && <LegalModal tipo={modal} onClose={() => setModal(null)} />}
        </>
    );
}
