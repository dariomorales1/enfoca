import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

// Mock de react-router-dom — conserva todo excepto los hooks de navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: null }),
    };
});

// Mock del contexto de autenticación
const mockLogin = vi.fn();
vi.mock('../../contexts/AuthContext.jsx', async () => {
    const actual = await vi.importActual('../../contexts/AuthContext.jsx');
    return {
        ...actual,
        useAuth: () => ({
            login: mockLogin,
            isAuthenticated: false,
            loading: false,
            user: null,
        }),
    };
});

// Mock de los componentes de layout e ilustración para aislar la página
vi.mock('../../layouts/SplitCardLayout.jsx', () => ({
    default: ({ children }) => <div data-testid="split-layout">{children}</div>,
}));

vi.mock('../../components/auth/AuthSidebarGraphic', () => ({
    default: () => <div data-testid="auth-graphic" />,
}));

// Import de la página DESPUÉS de los mocks
import LoginPage from '../../pages/LoginPage.jsx';

// ──────────────────────────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────────────────────────
function renderLoginPage() {
    return render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
    vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
describe('LoginPage — renderizado de elementos', () => {
    it('muestra el campo de correo electrónico', () => {
        renderLoginPage();
        expect(screen.getByPlaceholderText('tucorreo@ejemplo.com')).toBeInTheDocument();
    });

    it('muestra el campo de contraseña', () => {
        renderLoginPage();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('muestra el botón de iniciar sesión', () => {
        renderLoginPage();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('muestra el título de bienvenida', () => {
        renderLoginPage();
        expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    });

    it('muestra el enlace para registrarse', () => {
        renderLoginPage();
        expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
    });

    it('muestra el enlace de ¿Olvidaste tu contraseña?', () => {
        renderLoginPage();
        expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('LoginPage — interacción con el formulario', () => {
    it('permite escribir en el campo de email', async () => {
        renderLoginPage();
        const emailInput = screen.getByPlaceholderText('tucorreo@ejemplo.com');

        await userEvent.type(emailInput, 'test@test.com');

        expect(emailInput).toHaveValue('test@test.com');
    });

    it('permite escribir en el campo de contraseña', async () => {
        renderLoginPage();
        const passInput = screen.getByPlaceholderText('••••••••');

        await userEvent.type(passInput, 'miPassSegura');

        expect(passInput).toHaveValue('miPassSegura');
    });

    it('llama a login con email y contraseña al hacer submit', async () => {
        mockLogin.mockResolvedValueOnce({ success: true });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'user@test.com',
                password: 'pass123',
            });
        });
    });

    it('navega al dashboard cuando el login es exitoso', async () => {
        mockLogin.mockResolvedValueOnce({ success: true });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('LoginPage — manejo de errores', () => {
    it('muestra mensaje de error cuando el login falla con 401', async () => {
        mockLogin.mockResolvedValueOnce({
            success: false,
            status: 401,
            error: 'Credenciales inválidas',
        });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('Contraseña incorrecta. Verifica tus credenciales.')).toBeInTheDocument();
        });
    });

    it('muestra mensaje de error cuando el login falla con 404 (usuario no existe)', async () => {
        mockLogin.mockResolvedValueOnce({
            success: false,
            status: 404,
            error: 'Usuario no encontrado',
        });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'noexiste@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('No existe una cuenta con ese correo electrónico.')).toBeInTheDocument();
        });
    });

    it('muestra mensaje de error de servidor cuando el status es 500', async () => {
        mockLogin.mockResolvedValueOnce({
            success: false,
            status: 500,
            error: 'Internal Server Error',
        });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('Error del servidor. Intenta de nuevo más tarde.')).toBeInTheDocument();
        });
    });

    it('muestra error de conexión cuando login lanza una excepción inesperada', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Network Error'));

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('No se pudo conectar. Verifica tu conexión.')).toBeInTheDocument();
        });
    });

    it('no navega al dashboard si el login falla', async () => {
        mockLogin.mockResolvedValueOnce({
            success: false,
            status: 401,
            error: 'Credenciales inválidas',
        });

        renderLoginPage();

        await userEvent.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'user@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'mal');
        await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('LoginPage — toggle de contraseña', () => {
    it('el campo de contraseña empieza como type=password', () => {
        renderLoginPage();
        expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
    });

    it('al hacer click en el botón de ojo cambia a type=text', async () => {
        renderLoginPage();

        const btnOjo = screen.getByRole('button', { name: /ver contraseña/i });
        await userEvent.click(btnOjo);

        expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'text');
    });

    it('al hacer doble click en el botón de ojo vuelve a type=password', async () => {
        renderLoginPage();

        const btnOjo = screen.getByRole('button', { name: /ver contraseña/i });
        await userEvent.click(btnOjo);
        await userEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));

        expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
    });
});
