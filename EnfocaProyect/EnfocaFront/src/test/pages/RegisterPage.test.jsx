import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// vi.hoisted() asegura que las variables estén disponibles antes del hoist de vi.mock
// ──────────────────────────────────────────────────────────────────────────────

const { mockNavigate, mockRegister } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockRegister: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../services/api.jsx', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        register: mockRegister,
        refresh: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    profileService: {
        getProfile: vi.fn(),
        updateProfile: vi.fn(),
        changePassword: vi.fn(),
    },
    pomodoroService: { iniciar: vi.fn(), comenzar: vi.fn(), completar: vi.fn(), historial: vi.fn() },
    planService: {},
    gamificationService: { getPerfil: vi.fn() },
    certService: {},
    metricsService: {},
    calendarService: {},
    default: {},
}));

// Mocks de componentes de layout para aislar la página
vi.mock('../../layouts/SplitCardLayout.jsx', () => ({
    default: ({ children }) => <div data-testid="split-layout">{children}</div>,
}));

vi.mock('../../components/auth/AuthSidebarGraphic', () => ({
    default: () => <div data-testid="auth-graphic" />,
}));

vi.mock('../../components/common/LegalModal', () => ({
    default: ({ tipo, onClose }) => (
        <div data-testid={`modal-${tipo}`}>
            <button onClick={onClose}>Cerrar</button>
        </div>
    ),
}));

import RegisterPage from '../../pages/RegisterPage.jsx';

// ──────────────────────────────────────────────────────────────────────────────
function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
describe('RegisterPage — renderizado de elementos', () => {
    it('muestra el campo de nombre completo', () => {
        renderRegisterPage();
        expect(screen.getByPlaceholderText('Alejandro Ríos')).toBeInTheDocument();
    });

    it('muestra el campo de correo electrónico', () => {
        renderRegisterPage();
        expect(screen.getByPlaceholderText('nombre@universidad.edu')).toBeInTheDocument();
    });

    it('muestra el campo de contraseña', () => {
        renderRegisterPage();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('muestra el checkbox de términos', () => {
        renderRegisterPage();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('muestra el botón de crear cuenta', () => {
        renderRegisterPage();
        expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('muestra el título "Crear cuenta"', () => {
        renderRegisterPage();
        // Tanto el h1 como el botón de submit dicen "Crear cuenta"; buscamos el heading
        expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    });

    it('muestra el enlace para iniciar sesión', () => {
        renderRegisterPage();
        expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('RegisterPage — validación del formulario', () => {
    it('muestra error si se intenta enviar sin aceptar los términos', async () => {
        renderRegisterPage();

        await userEvent.type(screen.getByPlaceholderText('Alejandro Ríos'), 'María López');
        await userEvent.type(screen.getByPlaceholderText('nombre@universidad.edu'), 'maria@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

        await waitFor(() => {
            expect(screen.getByText(/debes aceptar los términos/i)).toBeInTheDocument();
        });
        expect(mockRegister).not.toHaveBeenCalled();
    });

    it('no llama al servicio de registro si no se aceptaron los términos', async () => {
        renderRegisterPage();

        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

        expect(mockRegister).not.toHaveBeenCalled();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('RegisterPage — interacción con el formulario', () => {
    async function rellenarFormulario() {
        await userEvent.type(screen.getByPlaceholderText('Alejandro Ríos'), 'Carlos Pérez');
        await userEvent.type(screen.getByPlaceholderText('nombre@universidad.edu'), 'carlos@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'miPass123');
        await userEvent.click(screen.getByRole('checkbox'));
    }

    it('llama a authService.register con los datos correctos al hacer submit', async () => {
        mockRegister.mockResolvedValueOnce({ data: {} });

        renderRegisterPage();
        await rellenarFormulario();
        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                firstName: 'Carlos',
                lastName: 'Pérez',
                email: 'carlos@test.com',
                password: 'miPass123',
            });
        });
    });

    it('separa correctamente el nombre completo en firstName y lastName', async () => {
        mockRegister.mockResolvedValueOnce({ data: {} });

        renderRegisterPage();
        await userEvent.type(screen.getByPlaceholderText('Alejandro Ríos'), 'Ana María García');
        await userEvent.type(screen.getByPlaceholderText('nombre@universidad.edu'), 'ana@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass');
        await userEvent.click(screen.getByRole('checkbox'));
        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'Ana',
                    lastName: 'María García',
                })
            );
        });
    });

    it('navega a /login tras un registro exitoso', async () => {
        mockRegister.mockResolvedValueOnce({ data: {} });

        renderRegisterPage();
        await rellenarFormulario();
        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                '/login',
                expect.objectContaining({ state: expect.objectContaining({ message: expect.any(String) }) })
            );
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('RegisterPage — manejo de errores', () => {
    async function rellenarYEnviar() {
        await userEvent.type(screen.getByPlaceholderText('Alejandro Ríos'), 'Test User');
        await userEvent.type(screen.getByPlaceholderText('nombre@universidad.edu'), 'test@test.com');
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
        await userEvent.click(screen.getByRole('checkbox'));
        await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    }

    it('muestra error si el correo ya está registrado (409)', async () => {
        mockRegister.mockRejectedValueOnce({ response: { status: 409 } });

        renderRegisterPage();
        await rellenarYEnviar();

        await waitFor(() => {
            expect(screen.getByText('Este correo ya está registrado.')).toBeInTheDocument();
        });
    });

    it('muestra el mensaje del backend en otros errores', async () => {
        mockRegister.mockRejectedValueOnce({
            response: { status: 400, data: { message: 'Contraseña demasiado corta' } },
        });

        renderRegisterPage();
        await rellenarYEnviar();

        await waitFor(() => {
            expect(screen.getByText('Contraseña demasiado corta')).toBeInTheDocument();
        });
    });

    it('muestra mensaje genérico si el backend no retorna mensaje', async () => {
        mockRegister.mockRejectedValueOnce({ response: { status: 500 } });

        renderRegisterPage();
        await rellenarYEnviar();

        await waitFor(() => {
            expect(screen.getByText('Error al registrar. Verifica tus datos.')).toBeInTheDocument();
        });
    });

    it('no navega si el registro falla', async () => {
        mockRegister.mockRejectedValueOnce({ response: { status: 409 } });

        renderRegisterPage();
        await rellenarYEnviar();

        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
describe('RegisterPage — modales legales', () => {
    it('abre el modal de términos al hacer click en "Términos y Condiciones"', async () => {
        renderRegisterPage();

        await userEvent.click(screen.getByText('Términos y Condiciones'));

        expect(screen.getByTestId('modal-terminos')).toBeInTheDocument();
    });

    it('abre el modal de privacidad al hacer click en "Política de Privacidad"', async () => {
        renderRegisterPage();

        await userEvent.click(screen.getByText('Política de Privacidad'));

        expect(screen.getByTestId('modal-privacidad')).toBeInTheDocument();
    });

    it('cierra el modal al hacer click en Cerrar', async () => {
        renderRegisterPage();

        await userEvent.click(screen.getByText('Términos y Condiciones'));
        expect(screen.getByTestId('modal-terminos')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Cerrar'));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-terminos')).not.toBeInTheDocument();
        });
    });
});
