import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mockeamos axios antes de importar cualquier módulo que lo use
vi.mock('axios', () => {
    const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    };

    const axios = {
        create: vi.fn(() => mockAxiosInstance),
        default: {
            create: vi.fn(() => mockAxiosInstance),
        },
    };

    return { default: axios, ...axios };
});

// Importamos los servicios DESPUÉS del mock
import {
    authService,
    pomodoroService,
    planService,
    gamificationService,
    profileService,
    certService,
    metricsService,
    calendarService,
} from '../../services/api.jsx';

// Obtenemos la instancia mockeada de axios para verificar llamadas
import axios from 'axios';
const mockInstance = axios.create();

beforeEach(() => {
    vi.clearAllMocks();
    mockInstance.post.mockResolvedValue({ data: {} });
    mockInstance.get.mockResolvedValue({ data: {} });
    mockInstance.put.mockResolvedValue({ data: {} });
    mockInstance.patch.mockResolvedValue({ data: {} });
    mockInstance.delete.mockResolvedValue({ data: {} });
});

// ──────────────────────────────────────────────────────────────────────────────
// authService
// ──────────────────────────────────────────────────────────────────────────────
describe('authService', () => {
    it('login llama POST /auth/login con las credenciales', async () => {
        const credenciales = { email: 'test@test.com', password: '1234' };
        mockInstance.post.mockResolvedValueOnce({ data: { access_token: 'tok', refresh_token: 'ref' } });

        await authService.login(credenciales);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/login', credenciales);
    });

    it('register llama POST /auth/register con los datos del usuario', async () => {
        const datos = { firstName: 'Ana', lastName: 'García', email: 'ana@test.com', password: 'pass123' };
        await authService.register(datos);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/register', datos);
    });

    it('logout llama POST /auth/logout con el refreshToken', async () => {
        const refreshToken = 'ref_token_123';
        await authService.logout(refreshToken);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/logout', { refreshToken });
    });

    it('refresh llama POST /auth/refresh con el refreshToken', async () => {
        const refreshToken = 'ref_token_456';
        await authService.refresh(refreshToken);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken });
    });

    it('forgotPassword llama POST /auth/forgot-password con el email', async () => {
        const email = 'usuario@test.com';
        await authService.forgotPassword(email);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
    });

    it('resetPassword llama POST /auth/reset-password con los datos', async () => {
        const datos = { token: 'abc123', newPassword: 'nuevaPass' };
        await authService.resetPassword(datos);

        expect(mockInstance.post).toHaveBeenCalledWith('/auth/reset-password', datos);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// pomodoroService
// ──────────────────────────────────────────────────────────────────────────────
describe('pomodoroService', () => {
    it('iniciar llama POST /pomodoro-sessions/start con los datos', async () => {
        const datos = { duracion: 25, tipo: 'TRABAJO' };
        await pomodoroService.iniciar(datos);

        expect(mockInstance.post).toHaveBeenCalledWith('/pomodoro-sessions/start', datos);
    });

    it('historial llama GET /pomodoro-sessions', async () => {
        mockInstance.get.mockResolvedValueOnce({ data: [] });
        await pomodoroService.historial();

        expect(mockInstance.get).toHaveBeenCalledWith('/pomodoro-sessions');
    });

    it('comenzar llama PATCH /pomodoro-sessions/:id/begin', async () => {
        await pomodoroService.comenzar(42);

        expect(mockInstance.patch).toHaveBeenCalledWith('/pomodoro-sessions/42/begin');
    });

    it('completar llama PATCH /pomodoro-sessions/:id/finish con status COMPLETED por defecto', async () => {
        await pomodoroService.completar(7);

        expect(mockInstance.patch).toHaveBeenCalledWith(
            '/pomodoro-sessions/7/finish',
            null,
            { params: { status: 'COMPLETED' } }
        );
    });

    it('completar acepta un status personalizado', async () => {
        await pomodoroService.completar(7, 'INTERRUPTED');

        expect(mockInstance.patch).toHaveBeenCalledWith(
            '/pomodoro-sessions/7/finish',
            null,
            { params: { status: 'INTERRUPTED' } }
        );
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// planService
// ──────────────────────────────────────────────────────────────────────────────
describe('planService', () => {
    it('listar llama GET /planes-estudio', async () => {
        mockInstance.get.mockResolvedValueOnce({ data: [] });
        await planService.listar();

        expect(mockInstance.get).toHaveBeenCalledWith('/planes-estudio');
    });

    it('crear llama POST /planes-estudio con los datos', async () => {
        const datos = { nombre: 'Plan de Cálculo', materia: 'Matemáticas' };
        await planService.crear(datos);

        expect(mockInstance.post).toHaveBeenCalledWith('/planes-estudio', datos);
    });

    it('obtener llama GET /planes-estudio/:id', async () => {
        await planService.obtener(10);

        expect(mockInstance.get).toHaveBeenCalledWith('/planes-estudio/10');
    });

    it('eliminar llama DELETE /planes-estudio/:id', async () => {
        await planService.eliminar(10);

        expect(mockInstance.delete).toHaveBeenCalledWith('/planes-estudio/10');
    });

    it('catalogo llama GET /planes-estudio/catalogo', async () => {
        await planService.catalogo();

        expect(mockInstance.get).toHaveBeenCalledWith('/planes-estudio/catalogo');
    });

    it('clonar llama POST /planes-estudio/:id/clonar', async () => {
        await planService.clonar(5);

        expect(mockInstance.post).toHaveBeenCalledWith('/planes-estudio/5/clonar');
    });

    it('toggleTema llama PATCH /planes-estudio/temas/:temaId/completado', async () => {
        await planService.toggleTema(99);

        expect(mockInstance.patch).toHaveBeenCalledWith('/planes-estudio/temas/99/completado');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// gamificationService
// ──────────────────────────────────────────────────────────────────────────────
describe('gamificationService', () => {
    it('getPerfil llama GET /gamification/perfil', async () => {
        mockInstance.get.mockResolvedValueOnce({
            data: { nivel: 3, xp: 450, badges: [] },
        });

        await gamificationService.getPerfil();

        expect(mockInstance.get).toHaveBeenCalledWith('/gamification/perfil');
    });

    it('getPerfil devuelve los datos del perfil de gamificación', async () => {
        const perfilMock = { nivel: 5, xp: 1200, badges: ['FIRST_SESSION'] };
        mockInstance.get.mockResolvedValueOnce({ data: perfilMock });

        const resultado = await gamificationService.getPerfil();

        expect(resultado.data).toEqual(perfilMock);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// profileService
// ──────────────────────────────────────────────────────────────────────────────
describe('profileService', () => {
    it('getProfile llama GET /profile', async () => {
        await profileService.getProfile();

        expect(mockInstance.get).toHaveBeenCalledWith('/profile');
    });

    it('updateProfile llama PUT /profile con los datos', async () => {
        const datos = { firstName: 'Carlos', lastName: 'Pérez' };
        await profileService.updateProfile(datos);

        expect(mockInstance.put).toHaveBeenCalledWith('/profile', datos);
    });

    it('changePassword llama PUT /profile/password con los datos', async () => {
        const datos = { currentPassword: 'antigua', newPassword: 'nueva123' };
        await profileService.changePassword(datos);

        expect(mockInstance.put).toHaveBeenCalledWith('/profile/password', datos);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// certService
// ──────────────────────────────────────────────────────────────────────────────
describe('certService', () => {
    it('iniciar llama POST /certificacion/examenes/iniciar', async () => {
        const datos = { planId: 1 };
        await certService.iniciar(datos);

        expect(mockInstance.post).toHaveBeenCalledWith('/certificacion/examenes/iniciar', datos);
    });

    it('certificados llama GET /certificacion/certificados', async () => {
        await certService.certificados();

        expect(mockInstance.get).toHaveBeenCalledWith('/certificacion/certificados');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// metricsService
// ──────────────────────────────────────────────────────────────────────────────
describe('metricsService', () => {
    it('getSummary llama GET /api/metrics/summary', async () => {
        await metricsService.getSummary();

        expect(mockInstance.get).toHaveBeenCalledWith('/api/metrics/summary');
    });

    it('getLast7Days llama GET /api/metrics/daily', async () => {
        await metricsService.getLast7Days();

        expect(mockInstance.get).toHaveBeenCalledWith('/api/metrics/daily');
    });

    it('getInsight llama GET /api/metrics/insight/latest', async () => {
        await metricsService.getInsight();

        expect(mockInstance.get).toHaveBeenCalledWith('/api/metrics/insight/latest');
    });
});
