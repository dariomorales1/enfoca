package online.enfoca.authservice.scheduler;

import online.enfoca.authservice.repository.AuthorizationSessionRepository;
import online.enfoca.authservice.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class TokenCleanupScheduler {

    private final RefreshTokenRepository        refreshTokenRepository;
    private final AuthorizationSessionRepository sessionRepository;

    public TokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository,
                                  AuthorizationSessionRepository sessionRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.sessionRepository      = sessionRepository;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedRefresh  = refreshTokenRepository.deleteExpiredBefore(now);
        int deletedSessions = sessionRepository.deleteExpiredBefore(now);
        // Log jti count only, never token values
        org.slf4j.LoggerFactory.getLogger(TokenCleanupScheduler.class)
                .info("Token cleanup: removed {} refresh tokens, {} auth sessions", deletedRefresh, deletedSessions);
    }
}
