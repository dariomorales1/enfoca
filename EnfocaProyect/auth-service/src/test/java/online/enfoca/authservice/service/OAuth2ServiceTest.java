package online.enfoca.authservice.service;

import online.enfoca.authservice.dto.request.AuthorizeRequest;
import online.enfoca.authservice.dto.request.OAuth2LoginRequest;
import online.enfoca.authservice.dto.request.RefreshTokenRequest;
import online.enfoca.authservice.dto.request.TokenExchangeRequest;
import online.enfoca.authservice.dto.response.AuthorizeResponse;
import online.enfoca.authservice.dto.response.OAuth2CodeResponse;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.exception.InvalidCredentialsException;
import online.enfoca.authservice.exception.InvalidTokenException;
import online.enfoca.authservice.exception.OAuth2Exception;
import online.enfoca.authservice.exception.UserInactiveException;
import online.enfoca.authservice.model.AuthorizationSession;
import online.enfoca.authservice.model.OAuth2Client;
import online.enfoca.authservice.model.Role;
import online.enfoca.authservice.model.SessionStatus;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.AuthorizationSessionRepository;
import online.enfoca.authservice.repository.OAuth2ClientRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2ServiceTest {

    @Mock private OAuth2ClientRepository clientRepository;
    @Mock private AuthorizationSessionRepository sessionRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthService authService;

    @InjectMocks
    private OAuth2Service oauth2Service;

    private OAuth2Client activeClient;
    private User activeUser;

    @BeforeEach
    void setUp() {
        activeClient = OAuth2Client.builder()
                .clientId("app-client")
                .clientName("Test Application")
                .redirectUris("https://app.example.com/callback,https://app.example.com/callback2")
                .active(true)
                .build();

        activeUser = User.builder()
                .id(10L).email("user@example.com")
                .passwordHash("$2a$hashed")
                .nombre("Test").lastName("User")
                .role(Role.USER).active(true)
                .build();
    }

    // --- authorize() ---

    @Test
    void authorize_returnsSessionIdAndLoginUrl() {
        when(clientRepository.findByClientIdAndActiveTrue("app-client")).thenReturn(Optional.of(activeClient));
        UUID savedId = UUID.randomUUID();
        AuthorizationSession saved = AuthorizationSession.builder()
                .id(savedId).clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("challenge123").state("my-state")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        when(sessionRepository.save(any(AuthorizationSession.class))).thenReturn(saved);

        AuthorizeRequest req = AuthorizeRequest.builder()
                .clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("challenge123")
                .codeChallengeMethod("S256")
                .state("my-state")
                .scope("openid profile")
                .build();

        AuthorizeResponse response = oauth2Service.authorize(req);

        assertThat(response.getSessionId()).isEqualTo(savedId);
        assertThat(response.getLoginUrl()).isEqualTo("/oauth2/login");
        assertThat(response.getState()).isEqualTo("my-state");
        verify(sessionRepository).save(any(AuthorizationSession.class));
    }

    @Test
    void authorize_throwsOAuth2ExceptionWhenClientNotFound() {
        when(clientRepository.findByClientIdAndActiveTrue("unknown-client")).thenReturn(Optional.empty());

        AuthorizeRequest req = AuthorizeRequest.builder()
                .clientId("unknown-client").redirectUri("https://app.example.com/callback")
                .codeChallenge("ch").codeChallengeMethod("S256").build();

        assertThatThrownBy(() -> oauth2Service.authorize(req))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("not found");
    }

    @Test
    void authorize_throwsWhenRedirectUriNotRegisteredForClient() {
        when(clientRepository.findByClientIdAndActiveTrue("app-client")).thenReturn(Optional.of(activeClient));

        AuthorizeRequest req = AuthorizeRequest.builder()
                .clientId("app-client")
                .redirectUri("https://evil.com/steal-tokens")
                .codeChallenge("ch").codeChallengeMethod("S256").build();

        assertThatThrownBy(() -> oauth2Service.authorize(req))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("Redirect URI");
    }

    @Test
    void authorize_throwsWhenCodeChallengeMethodIsNotS256() {
        when(clientRepository.findByClientIdAndActiveTrue("app-client")).thenReturn(Optional.of(activeClient));

        AuthorizeRequest req = AuthorizeRequest.builder()
                .clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("ch").codeChallengeMethod("plain").build();

        assertThatThrownBy(() -> oauth2Service.authorize(req))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("S256");
    }

    // --- login() ---

    @Test
    void login_returnsAuthorizationCodeWithState() {
        UUID sessionId = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(sessionId).clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("ch").state("xyz123")
                .status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("pass123", "$2a$hashed")).thenReturn(true);
        when(sessionRepository.save(any())).thenReturn(session);

        OAuth2LoginRequest req = OAuth2LoginRequest.builder()
                .sessionId(sessionId).email("user@example.com").password("pass123").build();

        OAuth2CodeResponse response = oauth2Service.login(req);

        assertThat(response.getAuthorizationCode()).isNotBlank();
        assertThat(response.getRedirectUri()).contains("code=").contains("state=xyz123");
        assertThat(response.getState()).isEqualTo("xyz123");
        assertThat(session.getStatus()).isEqualTo(SessionStatus.CODE_ISSUED);
        assertThat(session.getUser()).isEqualTo(activeUser);
    }

    @Test
    void login_buildsRedirectUriWithoutStateWhenStateIsNull() {
        UUID sessionId = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(sessionId).clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("ch").state(null)
                .status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("pass123", "$2a$hashed")).thenReturn(true);
        when(sessionRepository.save(any())).thenReturn(session);

        OAuth2CodeResponse response = oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(sessionId)
                        .email("user@example.com").password("pass123").build());

        assertThat(response.getRedirectUri()).doesNotContain("state=");
        assertThat(response.getState()).isNull();
    }

    @Test
    void login_throwsWhenSessionNotFound() {
        UUID id = UUID.randomUUID();
        when(sessionRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("x@x.com").password("p").build()))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("not found");
    }

    @Test
    void login_throwsWhenSessionIsNotPending() {
        UUID id = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(id).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("x@x.com").password("p").build()))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("pending");
    }

    @Test
    void login_throwsWhenSessionHasExpired() {
        UUID id = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(id).status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().minusMinutes(1)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("x@x.com").password("p").build()))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("expired");
    }

    @Test
    void login_throwsInvalidCredentialsWhenUserNotFound() {
        UUID id = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(id).status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("ghost@x.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("ghost@x.com").password("p").build()))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_throwsInvalidCredentialsWhenPasswordWrong() {
        UUID id = UUID.randomUUID();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(id).status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("user@example.com").password("wrong").build()))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_throwsUserInactiveWhenAccountIsDisabled() {
        UUID id = UUID.randomUUID();
        User inactive = User.builder().id(2L).email("blocked@x.com")
                .passwordHash("hash").role(Role.USER).active(false).build();
        AuthorizationSession session = AuthorizationSession.builder()
                .id(id).status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));
        when(userRepository.findByEmail("blocked@x.com")).thenReturn(Optional.of(inactive));
        when(passwordEncoder.matches("pass", "hash")).thenReturn(true);

        assertThatThrownBy(() -> oauth2Service.login(
                OAuth2LoginRequest.builder().sessionId(id).email("blocked@x.com").password("pass").build()))
                .isInstanceOf(UserInactiveException.class);
    }

    // --- exchangeToken() refresh_token grant ---

    @Test
    void exchangeToken_withRefreshTokenGrant_delegatesToAuthService() {
        TokenResponse expected = TokenResponse.builder()
                .accessToken("new-access").refreshToken("new-refresh").expiresIn(3600L).build();
        when(authService.refresh(any(RefreshTokenRequest.class))).thenReturn(expected);

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("refresh_token").refreshToken("old-refresh-token").build();

        TokenResponse result = oauth2Service.exchangeToken(req);

        assertThat(result.getAccessToken()).isEqualTo("new-access");
        verify(authService).refresh(any(RefreshTokenRequest.class));
    }

    @Test
    void exchangeToken_throwsOAuth2ExceptionForUnsupportedGrantType() {
        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("client_credentials").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("Unsupported grant_type");
    }

    // --- exchangeToken() authorization_code grant ---

    @Test
    void exchangeToken_withAuthorizationCode_happyPathIssuesTokens() throws NoSuchAlgorithmException {
        String codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        String codeChallenge = pkceS256(codeVerifier);
        UUID sessionId = UUID.randomUUID();

        AuthorizationSession session = AuthorizationSession.builder()
                .id(sessionId).clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge(codeChallenge)
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .user(activeUser).build();

        TokenResponse expected = TokenResponse.builder()
                .accessToken("access-token").refreshToken("refresh-token").expiresIn(3600L).build();

        when(sessionRepository.findByAuthorizationCode("auth-code-abc")).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenReturn(session);
        when(authService.issueTokenPair(activeUser, sessionId)).thenReturn(expected);

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code")
                .code("auth-code-abc")
                .clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeVerifier(codeVerifier)
                .build();

        TokenResponse result = oauth2Service.exchangeToken(req);

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(session.getCodeUsed()).isTrue();
        assertThat(session.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        verify(authService).issueTokenPair(activeUser, sessionId);
    }

    @Test
    void exchangeAuthorizationCode_throwsInvalidTokenWhenCodeNotFound() {
        when(sessionRepository.findByAuthorizationCode("nonexistent-code")).thenReturn(Optional.empty());

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("nonexistent-code")
                .clientId("c").redirectUri("u").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenCodeAlreadyUsed() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("u").codeChallenge("ch")
                .codeUsed(true).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findByAuthorizationCode("used-code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("used-code")
                .clientId("c").redirectUri("u").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("already used");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenSessionStatusIsNotCodeIssued() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("u").codeChallenge("ch")
                .codeUsed(false).status(SessionStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findByAuthorizationCode("my-code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("my-code")
                .clientId("c").redirectUri("u").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("valid");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenCodeHasExpired() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("u").codeChallenge("ch")
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().minusMinutes(2)).build();
        when(sessionRepository.findByAuthorizationCode("expired-code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("expired-code")
                .clientId("c").redirectUri("u").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenClientIdMismatches() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("expected-client").redirectUri("u").codeChallenge("ch")
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findByAuthorizationCode("code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("code")
                .clientId("attacker-client").redirectUri("u").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("mismatch");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenRedirectUriMismatches() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("https://registered.com/cb").codeChallenge("ch")
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findByAuthorizationCode("code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("code")
                .clientId("c").redirectUri("https://evil.com/steal").codeVerifier("v").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("mismatch");
    }

    @Test
    void exchangeAuthorizationCode_throwsWhenPkceVerificationFails() {
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("u").codeChallenge("correct-challenge")
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(sessionRepository.findByAuthorizationCode("code")).thenReturn(Optional.of(session));

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("code")
                .clientId("c").redirectUri("u").codeVerifier("wrong-verifier-that-produces-wrong-hash").build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(OAuth2Exception.class)
                .hasMessageContaining("PKCE");
    }

    @Test
    void exchangeAuthorizationCode_throwsUserInactiveWhenLinkedUserIsDisabled() throws NoSuchAlgorithmException {
        String verifier = "test-verifier-string-abc";
        String challenge = pkceS256(verifier);
        User inactive = User.builder().id(3L).email("x@x.com")
                .passwordHash("h").role(Role.USER).active(false).build();
        AuthorizationSession session = AuthorizationSession.builder()
                .clientId("c").redirectUri("u").codeChallenge(challenge)
                .codeUsed(false).status(SessionStatus.CODE_ISSUED)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .user(inactive).build();
        when(sessionRepository.findByAuthorizationCode("code")).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenReturn(session);

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code").code("code")
                .clientId("c").redirectUri("u").codeVerifier(verifier).build();

        assertThatThrownBy(() -> oauth2Service.exchangeToken(req))
                .isInstanceOf(UserInactiveException.class);
    }

    private static String pkceS256(String verifier) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(verifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }
}
