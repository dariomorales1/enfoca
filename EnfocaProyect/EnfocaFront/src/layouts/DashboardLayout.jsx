import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
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
const IconLogout = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconSupport = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
);
const IconKey = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="15" r="5" />
        <path d="M21 2l-9.3 9.3" />
        <path d="M15 8l3 3" />
    </svg>
);

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Panel', icon: <IconDashboard /> },
    { to: '/focus-mode', label: 'Modo Enfoque', icon: <IconFocus /> },
    { to: '/study-plan', label: 'Planes de Estudio', icon: <IconStudy /> },
    { to: '/analytics', label: 'Análisis', icon: <IconAnalytics /> },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            logout(() => navigate('/login'));
        }, 1500);
    };

    const displayName = user?.first_name || user?.firstName || user?.nombre || 'Usuario';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">

            {loggingOut && (
                <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"/>
                    <span className="text-neutral-400 text-xs tracking-widest uppercase">Cerrando sesión...</span>
                </div>
            )}

            <aside className="w-[220px] flex-shrink-0 hidden md:flex flex-col border-r border-neutral-900 bg-[#0d0d0d]">

                <Link to="/" className="px-5 py-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
                        <span className="text-xs font-black text-white tracking-tighter">E</span>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-wider">ENFOCA</div>
                        <div className="text-[10px] text-neutral-500 tracking-widest uppercase">ACADEMIC RIGOR</div>
                    </div>
                </Link>

                <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
                    {NAV_ITEMS.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? 'bg-white/5 text-white'
                                        : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'
                                }`
                            }
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-3 pb-5 flex flex-col gap-1">
                    <NavLink
                        to="/settings/password"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg ${
                                isActive
                                    ? 'bg-white/5 text-white'
                                    : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50'
                            }`
                        }
                    >
                        <IconKey />
                        Cambiar contraseña
                    </NavLink>

                    <button className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-neutral-400 text-sm transition-colors rounded-lg hover:bg-neutral-800/50">
                        <IconSupport />
                        Soporte
                    </button>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-red-400 text-sm transition-colors rounded-lg hover:bg-red-500/5"
                    >
                        <IconLogout />
                        Cerrar sesión
                    </button>

                    <div className="flex items-center gap-2.5 px-1 pt-2 border-t border-neutral-900 mt-1">
                        <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                        </div>
                        <span className="text-sm text-neutral-300 flex-1 truncate">{displayName}</span>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
