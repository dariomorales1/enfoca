import { Outlet, NavLink } from 'react-router-dom';
import './DashboardLayout.css';
export default function DashboardLayout() {
    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">◈</span>
                    <div>
                        <div className="brand-name">ENFOCA</div>
                        <div className="brand-sub">ACADEMIC RIGOR</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/focus" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Focus Mode
                    </NavLink>
                    <NavLink to="/study-plans" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Study Plans
                    </NavLink>
                    <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Analytics
                    </NavLink>
                </nav>

                <button className="sidebar-start-btn">START SESSION</button>
            </aside>

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}