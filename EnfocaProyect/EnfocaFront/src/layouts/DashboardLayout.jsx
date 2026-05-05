import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const IconDashboard = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
);
const IconFocus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
    </svg>
);
const IconStudy = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
const IconAnalytics = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);
const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconBell = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconSettings = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const IconSupport = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
);

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Panel', icon: <IconDashboard /> },
    { to: '/focus', label: 'Modo Enfoque', icon: <IconFocus /> },
    { to: '/study-plans', label: 'Planes de Estudio', icon: <IconStudy /> },
    { to: '/analytics', label: 'Análisis', icon: <IconAnalytics /> },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    const displayName = user?.firstName || user?.nombre || user?.username || 'Usuario';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">

            {/* Sidebar */}
            <aside className="w-[220px] flex-shrink-0 hidden md:flex flex-col border-r border-neutral-900 bg-[#0d0d0d]">
                <div className="px-5 py-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
                        <span className="text-xs font-black text-white tracking-tighter">E</span>
                    </div>
                    <div>
                        <div className="text-sm font-black tracking-widest text-white leading-none">ENFOCA</div>
                        <div className="text-[9px] tracking-widest text-neutral-600 uppercase mt-0.5">Rigor Académico</div>
                    </div>
                </div>

                <nav className="flex-1 px-3 flex flex-col gap-0.5">
                    {NAV_ITEMS.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-violet-600/20 text-violet-300'
                                        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={isActive ? 'text-violet-400' : ''}>{icon}</span>
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-3 pb-5 flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/focus')}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-widest uppercase py-3 rounded-lg transition-colors active:scale-[0.98]"
                    >
                        Iniciar Sesión
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-neutral-400 text-sm transition-colors rounded-lg hover:bg-neutral-800/50">
                        <IconSupport />
                        Soporte
                    </button>
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                        </div>
                        <span className="text-sm text-neutral-300 flex-1 truncate">{displayName}</span>
                        <button onClick={handleLogout} className="text-neutral-600 hover:text-neutral-400 transition-colors" title="Cerrar sesión">
                            <IconSettings />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-neutral-900">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">Panel</span>
                        <span className="hidden sm:inline text-neutral-700">|</span>
                        <span className="hidden sm:inline text-xs text-neutral-500">Sesión activa: Física Cuántica</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                            <span className="text-base">🔥</span>
                            <span className="text-xs font-bold text-white tracking-wide">12 días</span>
                        </div>
                        <button className="text-neutral-600 hover:text-neutral-400 transition-colors"><IconSearch /></button>
                        <button className="text-neutral-600 hover:text-neutral-400 transition-colors"><IconBell /></button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
