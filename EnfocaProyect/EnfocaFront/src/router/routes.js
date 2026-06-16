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
import WeeklyCalendarPage from "../pages/WeeklyCalendarPage.jsx";
import PlanDetailPage     from '../pages/PlanDetailPage';
import ExamPage           from '../pages/ExamPage';
import ExamResultPage     from '../pages/ExamResultPage';
import VerificacionPage   from '../pages/VerificacionPage';

// Rutas que redirigen a /dashboard si el usuario ya está autenticado
export const PUBLIC_ROUTES = [
    { path: '/',                    element: LandingPage,       name: 'Inicio' },
    { path: '/login',               element: LoginPage,          name: 'Login' },
    { path: '/register',            element: RegisterPage,       name: 'Registro' },
    { path: '/recover',             element: RecoverAccountPage, name: 'Recuperar Cuenta' },
    { path: '/reset-password',      element: ResetPasswordPage,  name: 'Restablecer Contraseña' },
];

// Rutas accesibles para cualquier visitante sin importar autenticación
export const OPEN_ROUTES = [
    { path: '/verificar/:codigo',   element: VerificacionPage,  name: 'Verificar Certificado' },
];

export const PRIVATE_ROUTES = [
    { path: '/dashboard',         element: DashboardPage,      name: 'Panel' },
    { path: '/pomodoro',          element: PomodoroPage,       name: 'Modo Enfoque' },
    { path: '/study-plan',        element: StudyPlanPage,      name: 'Plan de Estudio' },
    { path: '/library',           element: LibraryPage,        name: 'Biblioteca' },
    { path: '/analytics',         element: AnalyticsPage,      name: 'Análisis' },
    { path: '/settings/password', element: ChangePasswordPage, name: 'Cambiar Contraseña' },
    { path: '/profile',           element: ProfilePage,        name: 'Mi Perfil' },
    { path: '/calendar',          element: WeeklyCalendarPage, name: 'Calendario Semanal'},
    { path: '/plan-detail/:planId',         element: PlanDetailPage,  name: 'Detalle Plan' },
    { path: '/examen/:examenId',            element: ExamPage,        name: 'Examen' },
    { path: '/examen/:examenId/resultado',  element: ExamResultPage,  name: 'Resultado Examen' },
];

export const FULLSCREEN_ROUTES = [
    { path: '/focus-mode', element: FocusModePage, name: 'Deep Focus' },
];

export const allRoutes = [...OPEN_ROUTES, ...PUBLIC_ROUTES, ...PRIVATE_ROUTES, ...FULLSCREEN_ROUTES];
