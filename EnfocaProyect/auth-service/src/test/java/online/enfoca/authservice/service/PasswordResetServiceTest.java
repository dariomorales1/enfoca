package online.enfoca.authservice.service;

import online.enfoca.authservice.exception.InvalidTokenException;
import online.enfoca.authservice.model.PasswordResetToken;
import online.enfoca.authservice.model.Role;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.PasswordResetTokenRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .nombre("Test")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    void createToken_sendsEmailWhenUserExists() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(i -> i.getArgument(0));

        passwordResetService.createToken("user@test.com");

        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordReset(eq("user@test.com"), anyString());
    }

    @Test
    void createToken_doesNothingWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        passwordResetService.createToken("unknown@test.com");

        verify(tokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordReset(any(), any());
    }

    @Test
    void validateToken_returnsEmailForValidToken() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(testUser)
                .token("valid-token")
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        String email = passwordResetService.validateToken("valid-token");

        assertThat(email).isEqualTo("user@test.com");
    }

    @Test
    void validateToken_throwsWhenTokenNotFound() {
        when(tokenRepository.findByToken("missing-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.validateToken("missing-token"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void validateToken_throwsWhenTokenAlreadyUsed() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(testUser).token("used-token")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(true).build();
        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.validateToken("used-token"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("already used");
    }

    @Test
    void validateToken_throwsWhenTokenExpired() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(testUser).token("expired-token")
                .expiresAt(LocalDateTime.now().minusMinutes(5))
                .used(false).build();
        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.validateToken("expired-token"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void consumeToken_marksTokenAsUsed() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(testUser).token("my-token")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false).build();
        when(tokenRepository.findByToken("my-token")).thenReturn(Optional.of(token));

        passwordResetService.consumeToken("my-token");

        assertThat(token.getUsed()).isTrue();
        verify(tokenRepository).save(token);
    }

    @Test
    void consumeToken_doesNothingWhenTokenNotFound() {
        when(tokenRepository.findByToken("nonexistent")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> passwordResetService.consumeToken("nonexistent"));
        verify(tokenRepository, never()).save(any());
    }
}
