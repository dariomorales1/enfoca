package online.enfoca.authservice.service;

import online.enfoca.authservice.config.JwtProperties;
import online.enfoca.authservice.model.Role;
import online.enfoca.authservice.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtService — pruebas unitarias")
class JwtServiceTest {

    // Secret: Base64 de "this-is-a-very-secure-secret-key-for-testing-only"
    private static final String TEST_SECRET =
            "dGhpcy1pcy1hLXZlcnktc2VjdXJlLXNlY3JldC1rZXktZm9yLXRlc3Rpbmctb25seQ==";

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret(TEST_SECRET);
        props.setAccessTokenExpiration(3_600_000L);   // 1 hora
        props.setRefreshTokenExpiration(86_400_000L); // 24 horas
        props.setIssuer("enfoca");

        jwtService = new JwtService(props);

        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .passwordHash("$2a$10$hash")
                .nombre("Test")
                .lastName("User")
                .role(Role.USER)
                .active(true)
                .build();
    }

    // -----------------------------------------------------------------------
    // generateAccessToken
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("generateAccessToken — devuelve token no nulo")
    void generateAccessToken_createsValidToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertThat(token).isNotNull().isNotBlank();
    }

    // -----------------------------------------------------------------------
    // isTokenValid
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("isTokenValid — token recién generado es válido")
    void isTokenValid_returnsTrueForValidToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid — string inválido devuelve false")
    void isTokenValid_returnsFalseForInvalidToken() {
        assertThat(jwtService.isTokenValid("esto.no.es.un.jwt")).isFalse();
    }

    @Test
    @DisplayName("isTokenValid — token con expiración pasada devuelve false")
    void isTokenValid_returnsFalseForExpiredToken() {
        // Generamos un token con expiración de -1000 ms (ya expirado en el momento de crearse)
        JwtProperties expiredProps = new JwtProperties();
        expiredProps.setSecret(TEST_SECRET);
        expiredProps.setAccessTokenExpiration(-1000L);
        expiredProps.setRefreshTokenExpiration(86_400_000L);
        expiredProps.setIssuer("enfoca");

        JwtService expiredJwtService = new JwtService(expiredProps);
        String expiredToken = expiredJwtService.generateAccessToken(testUser);

        assertThat(jwtService.isTokenValid(expiredToken)).isFalse();
    }

    // -----------------------------------------------------------------------
    // extractSubject
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("extractSubject — devuelve el id del usuario como string")
    void extractSubject_returnsUserId() {
        String token = jwtService.generateAccessToken(testUser);

        String subject = jwtService.extractSubject(token);

        assertThat(subject).isEqualTo("1");
    }

    // -----------------------------------------------------------------------
    // extractEmail
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("extractEmail — devuelve el email correcto del claim")
    void extractEmail_returnsEmail() {
        String token = jwtService.generateAccessToken(testUser);

        String email = jwtService.extractEmail(token);

        assertThat(email).isEqualTo("test@test.com");
    }

    // -----------------------------------------------------------------------
    // extractRole
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("extractRole — devuelve el rol correcto del claim")
    void extractRole_returnsRole() {
        String token = jwtService.generateAccessToken(testUser);

        String role = jwtService.extractRole(token);

        assertThat(role).isEqualTo("USER");
    }

    // -----------------------------------------------------------------------
    // extractExpiration
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("extractExpiration — la fecha de expiración es posterior a ahora")
    void extractExpiration_returnsValidDate() {
        String token = jwtService.generateAccessToken(testUser);

        Date expiration = jwtService.extractExpiration(token);

        assertThat(expiration).isAfter(new Date());
    }
}
