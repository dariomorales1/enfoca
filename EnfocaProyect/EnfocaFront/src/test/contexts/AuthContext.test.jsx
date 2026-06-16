import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos el módulo de servicios de API
vi.mock('../../services/api.jsx', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        refresh: vi.fn(),
    },
    profileService: {
        getProfile: vi.fn(),
    },
}));

import { AuthProvider, AuthContext, useAuth } from '../../contexts/AuthContext.jsx';
import { authService, profileService } from '../../services/api.jsx';

// Componente auxiliar para consumir el contexto en los tests
function ConsumidorDeContexto() {
    const { user, isAuthenticated, loading, login, logout } = useAuth();

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <div data-testid="autenticado">{isAuthenticated ? 'si' : 'no'}</div>
            <div data-testid="usuario">{user ? user.email : 'ninguno'}</div>
            <button onClick={() => login({ email: 'a@b.com', password: '123' })}>
                Iniciar sesión
            </button>
            <button onClick={logout}>Cerrar sesión</button>
        </div>
    );
}

// Wrapper estándar para todos los tests que necesitan el proveedor
function renderConProvider(ui) {
    return render(
        <MemoryRouter>
            <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers de localStorage
// ──────────────────────────────────────────────────────────────────────────────
function limpiarLocalStorage() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
}

beforeEach(() => {
    limpiarLocalStorage();
    vi.clearAllMocks();
});

afterEach(() => {
    limpiarLocalStorage();
});

// ──────────────────────────────────────────────────────────────────────────────
describe('AuthProvider — estado inicial', () => {
    it('no está autenticado cuando no hay token en localStorage', async () => {
        // profileService.getProfile no se llama si no hay token
        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('no');
        });
    });

    it('está autenticado cuando hay access_token en localStorage', async () => {
        localStorage.setItem('access_token', 'tok123');
        localStorage.setItem('user_data', JSON.stringify({ email: 'test@test.com' }));

        // Con user_data ya guardado, no llama a getProfile
        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('si');
        });
    });

    it('carga el usuario desde localStorage si user_data existe', async () => {
        const usuarioGuardado = { email: 'guardado@test.com', firstName: 'María' };
        localStorage.setItem('access_token', 'tok123');
        localStorage.setItem('user_data', JSON.stringify(usuarioGuardado));

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => {
            expect(screen.getByTestId('usuario').textContent).toBe('guardado@test.com');
        });
    });

    it('llama a getProfile cuando hay token pero no user_data en localStorage', async () => {
        localStorage.setItem('access_token', 'tok123');
        profileService.getProfile.mockResolvedValueOnce({
            data: { email: 'perfil@test.com', firstName: 'Juan' },
        });

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => {
            expect(profileService.getProfile).toHaveBeenCalledTimes(1);
        });
    });

    it('se desautentica si getProfile falla (token inválido)', async () => {
        localStorage.setItem('access_token', 'tok_expirado');
        profileService.getProfile.mockRejectedValueOnce(new Error('401 Unauthorized'));

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('no');
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('AuthProvider — login', () => {
    it('actualiza el estado a autenticado tras un login exitoso', async () => {
        authService.login.mockResolvedValueOnce({
            data: { access_token: 'nuevo_tok', refresh_token: 'nuevo_ref' },
        });
        profileService.getProfile.mockResolvedValueOnce({
            data: { email: 'nuevo@test.com' },
        });

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

        await act(async () => {
            await userEvent.click(screen.getByText('Iniciar sesión'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('si');
        });
    });

    it('guarda los tokens en localStorage tras un login exitoso', async () => {
        authService.login.mockResolvedValueOnce({
            data: { access_token: 'at_123', refresh_token: 'rt_456' },
        });
        profileService.getProfile.mockResolvedValueOnce({ data: { email: 'u@test.com' } });

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

        await act(async () => {
            await userEvent.click(screen.getByText('Iniciar sesión'));
        });

        await waitFor(() => {
            expect(localStorage.getItem('access_token')).toBe('at_123');
            expect(localStorage.getItem('refresh_token')).toBe('rt_456');
        });
    });

    it('devuelve success: false cuando el login falla', async () => {
        const errorApi = { response: { status: 401, data: { message: 'Credenciales inválidas' } } };
        authService.login.mockRejectedValueOnce(errorApi);

        let resultado;
        function TestLogin() {
            const { login } = useAuth();
            return (
                <button
                    onClick={async () => {
                        resultado = await login({ email: 'x@x.com', password: 'mal' });
                    }}
                >
                    Login
                </button>
            );
        }

        renderConProvider(<TestLogin />);

        await act(async () => {
            await userEvent.click(screen.getByText('Login'));
        });

        expect(resultado).toEqual(
            expect.objectContaining({ success: false })
        );
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('AuthProvider — logout', () => {
    it('limpia el estado y localStorage tras cerrar sesión', async () => {
        localStorage.setItem('access_token', 'tok');
        localStorage.setItem('refresh_token', 'ref');
        localStorage.setItem('user_data', JSON.stringify({ email: 'u@test.com' }));

        authService.logout.mockResolvedValueOnce({});

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

        await act(async () => {
            await userEvent.click(screen.getByText('Cerrar sesión'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('no');
            expect(screen.getByTestId('usuario').textContent).toBe('ninguno');
        });

        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
        expect(localStorage.getItem('user_data')).toBeNull();
    });

    it('limpia el estado aunque el backend falle durante el logout', async () => {
        localStorage.setItem('access_token', 'tok');
        localStorage.setItem('refresh_token', 'ref');
        localStorage.setItem('user_data', JSON.stringify({ email: 'u@test.com' }));

        authService.logout.mockRejectedValueOnce(new Error('Network error'));

        renderConProvider(<ConsumidorDeContexto />);

        await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

        await act(async () => {
            await userEvent.click(screen.getByText('Cerrar sesión'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('autenticado').textContent).toBe('no');
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('AuthProvider — renderizado de hijos', () => {
    it('renderiza los children sin errores cuando no hay sesión', async () => {
        renderConProvider(<p>Contenido de prueba</p>);

        await waitFor(() => {
            expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
        });
    });

    it('muestra el spinner de carga mientras verifica la sesión', () => {
        localStorage.setItem('access_token', 'tok');
        // Dejamos getProfile en pending para que loading quede en true
        profileService.getProfile.mockReturnValueOnce(new Promise(() => {}));

        renderConProvider(<p>Hijos</p>);

        // El provider muestra el spinner y oculta los hijos mientras loading=true
        expect(screen.queryByText('Hijos')).not.toBeInTheDocument();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('useAuth — fuera del provider', () => {
    it('lanza error si se usa fuera de AuthProvider', () => {
        // Silenciamos el error de consola de React para este test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        function ComponenteSinProvider() {
            useAuth();
            return null;
        }

        expect(() => render(<ComponenteSinProvider />)).toThrow(
            'useAuth debe usarse dentro de un AuthProvider'
        );

        consoleSpy.mockRestore();
    });
});
