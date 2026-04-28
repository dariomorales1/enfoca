package online.enfoca.authservice.service;

import online.enfoca.authservice.config.JwtProperties;
import online.enfoca.authservice.dto.request.*;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.dto.response.UserResponse;
import online.enfoca.authservice.exception.*;
import online.enfoca.authservice.model.RefreshToken;
import online.enfoca.authservice.model.TokenStatus;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.RefreshTokenRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       JwtProperties jwtProperties) {
        this.userRepository       = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService           = jwtService;
        this.passwordEncoder      = passwordEncoder;
        this.jwtProperties        = jwtProperties;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyRegisteredException(request.getEmail());
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UserInactiveException();
        }
        return issueTokenPair(user, UUID.randomUUID());
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        String hash = sha256(request.getRefreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        if (stored.getStatus() == TokenStatus.REVOKED) {
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (stored.getStatus() == TokenStatus.USED) {
            // Replay attack: revoke entire session chain
            refreshTokenRepository.updateStatusBySessionId(stored.getSessionId(), TokenStatus.REVOKED);
            throw new ReplayAttackException();
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            stored.setStatus(TokenStatus.REVOKED);
            refreshTokenRepository.save(stored);
            throw new InvalidTokenException("Refresh token has expired");
        }

        stored.setStatus(TokenStatus.USED);
        refreshTokenRepository.save(stored);

        return issueTokenPair(stored.getUser(), stored.getSessionId());
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String hash = sha256(request.getRefreshToken());
        refreshTokenRepository.findByTokenHash(hash).ifPresent(stored ->
                refreshTokenRepository.updateStatusBySessionId(stored.getSessionId(), TokenStatus.REVOKED)
        );
    }

    // Package-visible: called by OAuth2Service after PKCE validation
    @Transactional
    TokenResponse issueTokenPair(User user, UUID sessionId) {
        String rawRefreshToken = UUID.randomUUID().toString();
        String accessToken     = jwtService.generateAccessToken(user);
        long   refreshTtlSecs  = jwtProperties.getRefreshTokenExpiration() / 1000;

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256(rawRefreshToken))
                .sessionId(sessionId)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTtlSecs))
                .build();

        refreshTokenRepository.save(rt);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresIn(jwtProperties.getAccessTokenExpiration() / 1000)
                .build();
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException());
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
