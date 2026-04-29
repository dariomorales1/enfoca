package online.enfoca.authservice.service;

import online.enfoca.authservice.exception.InvalidTokenException;
import online.enfoca.authservice.model.PasswordResetToken;
import online.enfoca.authservice.model.User;
import online.enfoca.authservice.repository.PasswordResetTokenRepository;
import online.enfoca.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${app.resend.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void createToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        String token = UUID.randomUUID() + "-" + UUID.randomUUID();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordReset(email, resetLink);
    }

    @Transactional
    public String validateToken(String token) {
        PasswordResetToken entry = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Password reset token not found"));

        if (entry.getUsed()) {
            throw new InvalidTokenException("Password reset token already used");
        }
        if (entry.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Password reset token has expired");
        }

        return entry.getUser().getEmail();
    }

    @Transactional
    public void consumeToken(String token) {
        tokenRepository.findByToken(token).ifPresent(entry -> {
            entry.setUsed(true);
            tokenRepository.save(entry);
        });
    }
}
