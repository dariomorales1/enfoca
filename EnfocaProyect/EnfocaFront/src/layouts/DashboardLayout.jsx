import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

// Íconos SVG inline (sin dependencia extra)
const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
);
const IconFocus = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="3" x2="12" y2="1"/><line x1="12" y1="23" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="21" y2="12"/>
    </svg>
);
const IconPlans = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
);
const IconAnalytics = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
);
const IconSupport = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
const IconSettings = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

// Ítem de navegación del sidebar
const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group
            ${isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
        }
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium tracking-wide">{label}</span>
    </NavLink>
);

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Nombre visible: usa firstName si existe, sino el username, sino "Usuario"
    const displayName = user?.firstName || user?.username || 'Usuario';
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">

            {/* ── SIDEBAR DESKTOP ── */}
            <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-white/10 bg-[#0a0a0a]">

                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <polygon points="12,2 22,20 2,20"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <p className="text-white font-bold text-sm tracking-widest">ENFOCA</p>
                        <p className="text-gray-500 text-[9px] tracking-[0.2em] uppercase">Academic Rigor</p>
                    </div>
                </div>

                {/* Navegación principal */}
                <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
                    <NavItem to="/dashboard"         icon={<IconDashboard />} label="Dashboard"    />
                    <NavItem to="/dashboard/focus"   icon={<IconFocus />}     label="Focus Mode"   />
                    <NavItem to="/dashboard/plans"   icon={<IconPlans />}     label="Study Plans"  />
                    <NavItem to="/dashboard/analytics" icon={<IconAnalytics />} label="Analytics" />
                </nav>

                {/* Botón START SESSION */}
                <div className="px-3 pb-4">
                    <button
                        onClick={() => navigate('/dashboard/focus')}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-md text-sm font-bold tracking-widest transition-colors duration-150"
                    >
                        START SESSION
                    </button>
                </div>

                {/* Footer del sidebar */}
                <div className="border-t border-white/10 px-3 py-3 flex flex-col gap-1">
                    <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm rounded-md hover:bg-white/5 transition-colors">
                        <IconSupport />
                        <span>Support</span>
                    </button>

                    {/* Perfil de usuario */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <span className="text-sm text-gray-300 flex-1 truncate">{displayName}</span>
                        <button
                            onClick={handleLogout}
                            title="Cerrar sesión"
                            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <IconSettings />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── SIDEBAR MOBILE (overlay) ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-[220px] bg-[#0a0a0a] border-r border-white/10
                flex flex-col transition-transform duration-200 md:hidden
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* mismo contenido del sidebar desktop */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <polygon points="12,2 22,20 2,20"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <p className="text-white font-bold text-sm tracking-widest">ENFOCA</p>
                        <p className="text-gray-500 text-[9px] tracking-[0.2em] uppercase">Academic Rigor</p>
                    </div>
                </div>
                <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
                    <NavItem to="/dashboard"           icon={<IconDashboard />}  label="Dashboard"   />
                    <NavItem to="/dashboard/focus"     icon={<IconFocus />}      label="Focus Mode"  />
                    <NavItem to="/dashboard/plans"     icon={<IconPlans />}      label="Study Plans" />
                    <NavItem to="/dashboard/analytics" icon={<IconAnalytics />}  label="Analytics"   />
                </nav>
                <div className="px-3 pb-4">
                    <button
                        onClick={() => { navigate('/dashboard/focus'); setMobileOpen(false); }}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 rounded-md text-sm font-bold tracking-widest transition-colors"
                    >
                        START SESSION
                    </button>
                </div>
                <div className="border-t border-white/10 px-3 py-3 flex flex-col gap-1">
                    <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm rounded-md hover:bg-white/5 transition-colors">
                        <IconSupport /><span>Support</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-[10px] font-bold">
                            {initials}
                        </div>
                        <span className="text-sm text-gray-300 flex-1 truncate">{displayName}</span>
                        <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                            <IconSettings />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── ÁREA DE CONTENIDO PRINCIPAL ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Topbar mobile */}
                <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a] flex-shrink-0">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Abrir menú"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    <p className="text-sm font-bold tracking-widest">ENFOCA</p>
                    <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-[10px] font-bold">
                        {initials}
                    </div>
                </header>

                {/* Outlet: aquí renderizan las páginas del dashboard */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}