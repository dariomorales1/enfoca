package online.enfoca.authservice.service;

import online.enfoca.authservice.config.JwtProperties;
import online.enfoca.authservice.dto.request.LoginRequest;
import online.enfoca.authservice.dto.request.LogoutRequest;
import online.enfoca.authservice.dto.request.RefreshTokenRequest;
import online.enfoca.authservice.dto.request.RegisterRequest;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.dto.response.UserResponse;
import online.enfoca.authservice.exception.*;
import online.enfoca.authservice.model.RefreshToken;
import online.enfoca.authservice.model.Role;
import online.enfoca.authservice.model.TokenStatus;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.RefreshTokenRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — pruebas unitarias")
class AuthServiceTest {

    // Secret Base64 de "this-is-a-very-secure-secret-key-for-testing-only"
    private static final String TEST_SECRET =
            "dGhpcy1pcy1hLXZlcnktc2VjdXJlLXNlY3JldC1rZXktZm9yLXRlc3Rpbmctb25seQ==";

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    // JwtService se instancia de forma real para que genere tokens auténticos
    private JwtService jwtService;

    private JwtProperties jwtProperties;
    private AuthService authService;

    /** Usuario activo reutilizable en los tests */
    private User activeUser;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret(TEST_SECRET);
        jwtProperties.setAccessTokenExpiration(3_600_000L);
        jwtProperties.setRefreshTokenExpiration(86_400_000L);
        jwtProperties.setIssuer("enfoca");

        jwtService = new JwtService(jwtProperties);

        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                jwtService,
                passwordEncoder,
                jwtProperties
        );

        activeUser = User.builder()
                .id(1L)
                .email("user@enfoca.com")
                .passwordHash("$2a$10$hashedPassword")
                .nombre("Felipe")
                .lastName("Ulloa")
                .role(Role.USER)
                .active(true)
                .build();
    }

    // -----------------------------------------------------------------------
    // register
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("register — crea usuario y devuelve UserResponse cuando el email no existe")
    void register_createsUserSuccessfully() {
        RegisterRequest request = RegisterRequest.builder()
                .email("nuevo@enfoca.com")
                .password("securePass1!")
                .firstName("Ana")
                .lastName("López")
                .build();

        when(userRepository.existsByEmail("nuevo@enfoca.com")).thenReturn(false);

        User savedUser = User.builder()
                .id(2L)
                .email("nuevo@enfoca.com")
                .passwordHash("$2a$10$encoded")
                .nombre("Ana")
                .lastName("López")
                .role(Role.USER)
                .active(true)
                .build();

        when(passwordEncoder.encode("securePass1!")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("nuevo@enfoca.com");
        assertThat(response.getFirstName()).isEqualTo("Ana");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register — lanza EmailAlreadyRegisteredException cuando el email ya existe")
    void register_throwsWhenEmailAlreadyRegistered() {
        RegisterRequest request = RegisterRequest.builder()
                .email("user@enfoca.com")
                .password("pass")
                .firstName("Felipe")
                .lastName("Ulloa")
                .build();

        when(userRepository.existsByEmail("user@enfoca.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyRegisteredException.class)
                .hasMessageContaining("user@enfoca.com");

        verify(userRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // login
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("login — devuelve tokens para credenciales válidas con usuario activo")
    void login_returnsTokensForValidCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("user@enfoca.com")
                .password("correctPassword")
                .build();

        when(userRepository.findByEmail("user@enfoca.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("correctPassword", activeUser.getPasswordHash())).thenReturn(true);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        TokenResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();
        assertThat(response.getExpiresIn()).isEqualTo(3600L);
    }

    @Test
    @DisplayName("login — lanza InvalidCredentialsException cuando la contraseña es incorrecta")
    void login_throwsForWrongPassword() {
        LoginRequest request = LoginRequest.builder()
                .email("user@enfoca.com")
                .password("wrongPassword")
                .build();

        when(userRepository.findByEmail("user@enfoca.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrongPassword", activeUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("login — lanza InvalidCredentialsException cuando el usuario no existe")
    void login_throwsForNonExistentUser() {
        LoginRequest request = LoginRequest.builder()
                .email("noexiste@enfoca.com")
                .password("pass")
                .build();

        when(userRepository.findByEmail("noexiste@enfoca.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("login — lanza UserInactiveException cuando el usuario está inactivo")
    void login_throwsForInactiveUser() {
        User inactiveUser = User.builder()
                .id(3L)
                .email("inactivo@enfoca.com")
                .passwordHash("$2a$10$hash")
                .nombre("Inactivo")
                .lastName("Test")
                .role(Role.USER)
                .active(false)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email("inactivo@enfoca.com")
                .password("pass")
                .build();

        when(userRepository.findByEmail("inactivo@enfoca.com")).thenReturn(Optional.of(inactiveUser));
        when(passwordEncoder.matches("pass", inactiveUser.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UserInactiveException.class);
    }

    // -----------------------------------------------------------------------
    // refresh
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("refresh — happy path: devuelve nuevos tokens con refresh token válido")
    void refresh_returnsNewTokensForValidRefreshToken() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);
        UUID sessionId = UUID.randomUUID();

        RefreshToken stored = RefreshToken.builder()
                .id(10L)
                .user(activeUser)
                .tokenHash(hash)
                .sessionId(sessionId)
                .status(TokenStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(rawToken)
                .build();

        TokenResponse response = authService.refresh(request);

        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();
        // El token original debe quedar marcado como USED
        assertThat(stored.getStatus()).isEqualTo(TokenStatus.USED);
    }

    @Test
    @DisplayName("refresh — lanza InvalidTokenException cuando el token está REVOKED")
    void refresh_throwsForRevokedToken() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);

        RefreshToken stored = RefreshToken.builder()
                .id(11L)
                .user(activeUser)
                .tokenHash(hash)
                .sessionId(UUID.randomUUID())
                .status(TokenStatus.REVOKED)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(rawToken)
                .build();

        assertThatThrownBy(() -> authService.refresh(request))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("revoked");
    }

    @Test
    @DisplayName("refresh — detecta replay attack: lanza ReplayAttackException y revoca sesión")
    void refresh_throwsForUsedToken_andRevokesSession() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);
        UUID sessionId = UUID.randomUUID();

        RefreshToken stored = RefreshToken.builder()
                .id(12L)
                .user(activeUser)
                .tokenHash(hash)
                .sessionId(sessionId)
                .status(TokenStatus.USED)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(rawToken)
                .build();

        assertThatThrownBy(() -> authService.refresh(request))
                .isInstanceOf(ReplayAttackException.class);

        // Debe revocar toda la cadena de la sesión
        verify(refreshTokenRepository).updateStatusBySessionId(sessionId, TokenStatus.REVOKED);
    }

    @Test
    @DisplayName("refresh — lanza InvalidTokenException cuando el refresh token ha expirado")
    void refresh_throwsForExpiredToken() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);

        RefreshToken stored = RefreshToken.builder()
                .id(13L)
                .user(activeUser)
                .tokenHash(hash)
                .sessionId(UUID.randomUUID())
                .status(TokenStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().minusHours(1)) // ya expirado
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(rawToken)
                .build();

        assertThatThrownBy(() -> authService.refresh(request))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");

        // El token debe quedar marcado como REVOKED
        assertThat(stored.getStatus()).isEqualTo(TokenStatus.REVOKED);
    }

    // -----------------------------------------------------------------------
    // logout
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("logout — revoca la sesión cuando el token existe")
    void logout_revokesSession() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);
        UUID sessionId = UUID.randomUUID();

        RefreshToken stored = RefreshToken.builder()
                .id(20L)
                .user(activeUser)
                .tokenHash(hash)
                .sessionId(sessionId)
                .status(TokenStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));

        LogoutRequest request = LogoutRequest.builder()
                .refreshToken(rawToken)
                .build();

        authService.logout(request);

        verify(refreshTokenRepository).updateStatusBySessionId(sessionId, TokenStatus.REVOKED);
    }

    @Test
    @DisplayName("logout — no hace nada cuando el token no existe en la base de datos")
    void logout_doesNothingWhenTokenNotFound() {
        String rawToken = UUID.randomUUID().toString();
        String hash = AuthService.sha256(rawToken);

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.empty());

        LogoutRequest request = LogoutRequest.builder()
                .refreshToken(rawToken)
                .build();

        authService.logout(request);

        verify(refreshTokenRepository, never()).updateStatusBySessionId(any(), any());
    }

    // -----------------------------------------------------------------------
    // sha256
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("sha256 — el mismo input produce siempre el mismo hash")
    void sha256_returnsConsistentHash() {
        String input = "token-de-prueba-12345";

        String hash1 = AuthService.sha256(input);
        String hash2 = AuthService.sha256(input);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64); // SHA-256 en hex = 64 caracteres
        assertThat(hash1).matches("[a-f0-9]+");
    }

    // -----------------------------------------------------------------------
    // resetPassword
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("resetPassword — actualiza el passwordHash del usuario")
    void resetPassword_updatesPasswordHash() {
        String newPassword = "nuevaContraseña123!";
        String encodedPassword = "$2a$10$newEncodedPassword";

        when(userRepository.findByEmail("user@enfoca.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.resetPassword("user@enfoca.com", newPassword);

        // Verificamos que el passwordHash fue actualizado
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo(encodedPassword);
    }

    @Test
    @DisplayName("resetPassword — lanza InvalidCredentialsException cuando el email no existe")
    void resetPassword_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("fantasma@enfoca.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("fantasma@enfoca.com", "pass"))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
