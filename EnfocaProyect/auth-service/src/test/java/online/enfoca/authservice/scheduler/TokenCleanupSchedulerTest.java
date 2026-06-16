package online.enfoca.authservice.scheduler;

import online.enfoca.authservice.repository.AuthorizationSessionRepository;
import online.enfoca.authservice.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenCleanupSchedulerTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthorizationSessionRepository sessionRepository;

    @InjectMocks
    private TokenCleanupScheduler scheduler;

    @Test
    void purgeExpiredTokens_deletesFromBothRepositories() {
        when(refreshTokenRepository.deleteExpiredBefore(any(LocalDateTime.class))).thenReturn(7);
        when(sessionRepository.deleteExpiredBefore(any(LocalDateTime.class))).thenReturn(3);

        scheduler.purgeExpiredTokens();

        verify(refreshTokenRepository).deleteExpiredBefore(any(LocalDateTime.class));
        verify(sessionRepository).deleteExpiredBefore(any(LocalDateTime.class));
    }

    @Test
    void purgeExpiredTokens_passesCurrentTimeToRepositories() {
        LocalDateTime before = LocalDateTime.now();
        when(refreshTokenRepository.deleteExpiredBefore(any(LocalDateTime.class))).thenReturn(0);
        when(sessionRepository.deleteExpiredBefore(any(LocalDateTime.class))).thenReturn(0);

        scheduler.purgeExpiredTokens();

        LocalDateTime after = LocalDateTime.now();

        ArgumentCaptor<LocalDateTime> captor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(refreshTokenRepository).deleteExpiredBefore(captor.capture());
        LocalDateTime captured = captor.getValue();
        assertThat(captured).isAfterOrEqualTo(before).isBeforeOrEqualTo(after);
    }
}
