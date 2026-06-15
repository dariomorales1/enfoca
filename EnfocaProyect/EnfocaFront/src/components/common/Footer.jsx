import { useState } from 'react';
import LegalModal from './LegalModal';

export default function Footer() {
    const [modal, setModal] = useState(null);

    return (
        <>
            {/* Ajustamos los paddings: px-4/py-6 en móvil, recupera px-6/py-4 en sm y px-12 en lg */}
            <footer className="relative z-50 w-full bg-black border-t border-neutral-900 px-4 sm:px-6 lg:px-12 py-6 sm:py-4">

                {/* Cambiamos a flex-col en móvil con un gap-4 para separar, y flex-row en sm */}
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">

                    <div className="flex items-center gap-3">
                        {/* Logo ligeramente más pequeño en móvil si se desea, o mantenemos h-7 */}
                        <img src="/logo.png" alt="Enfoca" className="h-6 sm:h-7 w-auto"/>
                        <span className="text-[10px] text-neutral-600 tracking-widest text-center">
                            © {new Date().getFullYear()} Enfoca
                        </span>
                    </div>

                    <div className="flex gap-4 sm:gap-6 text-[12px] font-bold text-neutral-500 tracking-tighter uppercase">
                        <button
                            onClick={() => setModal('privacidad')}
                            className="hover:text-white transition-colors py-1"
                        >
                            Privacidad
                        </button>
                        <button
                            onClick={() => setModal('terminos')}
                            className="hover:text-white transition-colors py-1"
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