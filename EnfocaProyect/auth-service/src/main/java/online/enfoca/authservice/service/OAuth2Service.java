package online.enfoca.authservice.service;

import online.enfoca.authservice.dto.request.AuthorizeRequest;
import online.enfoca.authservice.dto.request.OAuth2LoginRequest;
import online.enfoca.authservice.dto.request.TokenExchangeRequest;
import online.enfoca.authservice.dto.request.RefreshTokenRequest;
import online.enfoca.authservice.dto.response.AuthorizeResponse;
import online.enfoca.authservice.dto.response.OAuth2CodeResponse;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.exception.InvalidCredentialsException;
import online.enfoca.authservice.exception.InvalidTokenException;
import online.enfoca.authservice.exception.OAuth2Exception;
import online.enfoca.authservice.exception.UserInactiveException;
import online.enfoca.authservice.model.AuthorizationSession;
import online.enfoca.authservice.model.OAuth2Client;
import online.enfoca.authservice.model.SessionStatus;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.AuthorizationSessionRepository;
import online.enfoca.authservice.repository.OAuth2ClientRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class OAuth2Service {

    private final OAuth2ClientRepository      clientRepository;
    private final AuthorizationSessionRepository sessionRepository;
    private final UserRepository              userRepository;
    private final PasswordEncoder             passwordEncoder;
    private final AuthService                 authService;

    public OAuth2Service(OAuth2ClientRepository clientRepository,
                         AuthorizationSessionRepository sessionRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder,
                         AuthService authService) {
        this.clientRepository  = clientRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository    = userRepository;
        this.passwordEncoder   = passwordEncoder;
        this.authService       = authService;
    }

    @Transactional
    public AuthorizeResponse authorize(AuthorizeRequest request) {
        OAuth2Client client = clientRepository.findByClientIdAndActiveTrue(request.getClientId())
                .orElseThrow(() -> new OAuth2Exception("RESOURCE_NOT_FOUND",
                        "Client not found: " + request.getClientId()));

        if (!client.getRedirectUriList().contains(request.getRedirectUri())) {
            throw new OAuth2Exception("INVALID_INPUT", "Redirect URI not registered for this client");
        }
        if (!"S256".equals(request.getCodeChallengeMethod())) {
            throw new OAuth2Exception("INVALID_INPUT", "Only S256 code_challenge_method is supported");
        }

        AuthorizationSession session = AuthorizationSession.builder()
                .clientId(request.getClientId())
                .redirectUri(request.getRedirectUri())
                .codeChallenge(request.getCodeChallenge())
                .scope(request.getScope())
                .state(request.getState())
                .nonce(request.getNonce())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        AuthorizationSession saved = sessionRepository.save(session);

        return AuthorizeResponse.builder()
                .sessionId(saved.getId())
                .loginUrl("/oauth2/login")
                .state(request.getState())
                .build();
    }

    @Transactional
    public OAuth2CodeResponse login(OAuth2LoginRequest request) {
        AuthorizationSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new OAuth2Exception("INVALID_SESSION", "Authorization session not found"));

        if (session.getStatus() != SessionStatus.PENDING) {
            throw new OAuth2Exception("INVALID_SESSION", "Session is no longer pending");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new OAuth2Exception("INVALID_SESSION", "Authorization session has expired");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UserInactiveException();
        }

        String code = UUID.randomUUID().toString();
        session.setUser(user);
        session.setAuthorizationCode(code);
        session.setStatus(SessionStatus.CODE_ISSUED);
        sessionRepository.save(session);

        String redirectWithCode = session.getRedirectUri()
                + "?code=" + code
                + (session.getState() != null ? "&state=" + session.getState() : "");

        return OAuth2CodeResponse.builder()
                .authorizationCode(code)
                .redirectUri(redirectWithCode)
                .state(session.getState())
                .build();
    }

    @Transactional
    public TokenResponse exchangeToken(TokenExchangeRequest request) {
        return switch (request.getGrantType()) {
            case "authorization_code" -> exchangeAuthorizationCode(request);
            case "refresh_token"      -> authService.refresh(
                    RefreshTokenRequest.builder()
                            .refreshToken(request.getRefreshToken())
                            .build());
            default -> throw new OAuth2Exception("INVALID_GRANT",
                    "Unsupported grant_type: " + request.getGrantType());
        };
    }

    private TokenResponse exchangeAuthorizationCode(TokenExchangeRequest request) {
        AuthorizationSession session = sessionRepository
                .findByAuthorizationCode(request.getCode())
                .orElseThrow(() -> new InvalidTokenException("Authorization code not found"));

        if (session.getCodeUsed()) {
            throw new InvalidTokenException("Authorization code already used");
        }
        if (session.getStatus() != SessionStatus.CODE_ISSUED) {
            throw new InvalidTokenException("Authorization code is not valid");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Authorization code has expired");
        }
        if (!session.getClientId().equals(request.getClientId())) {
            throw new InvalidTokenException("Client ID mismatch");
        }
        if (!session.getRedirectUri().equals(request.getRedirectUri())) {
            throw new InvalidTokenException("Redirect URI mismatch");
        }

        // PKCE: base64url(SHA-256(code_verifier)) must equal stored code_challenge
        String computed = computeS256(request.getCodeVerifier());
        if (!computed.equals(session.getCodeChallenge())) {
            throw new OAuth2Exception("INVALID_AUTHORIZATION_CODE", "PKCE verification failed");
        }

        session.setCodeUsed(true);
        session.setStatus(SessionStatus.COMPLETED);
        sessionRepository.save(session);

        User user = session.getUser();
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UserInactiveException();
        }

        return authService.issueTokenPair(user, session.getId());
    }

    private String computeS256(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
