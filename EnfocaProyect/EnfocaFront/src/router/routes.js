import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RecoverAccountPage from '../pages/RecoverAccountPage';
import DashboardPage from '../pages/DashboardPage';
import PomodoroPage from '../pages/PomodoroPage';
import FocusModePage from '../pages/FocusModePage';
import StudyPlanPage from '../pages/StudyPlanPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import LibraryPage from '../pages/LibraryPage';

export const PUBLIC_ROUTES = [
    { path: '/',               element: LandingPage,        name: 'Inicio' },
    { path: '/login',          element: LoginPage,           name: 'Login' },
    { path: '/register',       element: RegisterPage,        name: 'Registro' },
    { path: '/recover',        element: RecoverAccountPage,  name: 'Recuperar Cuenta' },
    { path: '/reset-password', element: ResetPasswordPage,   name: 'Restablecer Contraseña' },
];

export const PRIVATE_ROUTES = [
    { path: '/dashboard',        element: DashboardPage,      name: 'Panel' },
    { path: '/pomodoro',         element: PomodoroPage,       name: 'Modo Enfoque' },
    { path: '/focus-mode',       element: FocusModePage,      name: 'Deep Focus' },
    { path: '/study-plan',       element: StudyPlanPage,      name: 'Plan de Estudio' },
    { path: '/library',          element: LibraryPage,        name: 'Biblioteca' },
    { path: '/analytics',        element: AnalyticsPage,      name: 'Análisis' },
    { path: '/settings/password',element: ChangePasswordPage, name: 'Cambiar Contraseña' },
    { path: '/profile',          element: ProfilePage,        name: 'Mi Perfil' },
];

export const allRoutes = [...PUBLIC_ROUTES, ...PRIVATE_ROUTES];
