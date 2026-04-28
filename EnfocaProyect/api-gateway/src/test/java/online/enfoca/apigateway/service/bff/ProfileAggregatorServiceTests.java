package online.enfoca.apigateway.service.bff;

import online.enfoca.apigateway.client.AuthenticationClient;
import online.enfoca.apigateway.client.CertificationClient;
import online.enfoca.apigateway.client.GamificationClient;
import online.enfoca.apigateway.client.MetricsClient;
import online.enfoca.apigateway.dto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileAggregatorServiceTests {

    @InjectMocks
    private ProfileAggregatorService service;

    @Mock
    private AuthenticationClient authenticationClient;
    @Mock
    private MetricsClient metricsClient;
    @Mock
    private GamificationClient gamificationClient;
    @Mock
    private CertificationClient certificationClient;

    private static final String USER_ID = "user-123";

    @Test
    void shouldAggregateAllServicesSuccessfully() {
        ProfileDto profile = new ProfileDto("user-123", "test@enfoca.cl", "Juan", "Pérez", "Bio", null);
        StatisticsDto stats = new StatisticsDto(145.5, 320, 45);
        GamificationProfileDto gamification = new GamificationProfileDto(1250, 4, 7);
        List<CertificateDto> certs = List.of(new CertificateDto("c1", "Certificado", "2026-01-01", "https://..."));

        when(authenticationClient.getProfile(USER_ID)).thenReturn(Mono.just(profile));
        when(metricsClient.getFullStatistics(USER_ID)).thenReturn(Mono.just(stats));
        when(gamificationClient.getProfileSummary(USER_ID)).thenReturn(Mono.just(gamification));
        when(certificationClient.getUserCertificates(USER_ID)).thenReturn(Mono.just(certs));

        StepVerifier.create(service.aggregate(USER_ID))
                .assertNext(response -> {
                    assertThat(response.profile()).isEqualTo(profile);
                    assertThat(response.statistics()).isEqualTo(stats);
                    assertThat(response.gamification()).isEqualTo(gamification);
                    assertThat(response.certificates()).isEqualTo(certs);
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnEmptyListWhenCertificationServiceFails() {
        when(authenticationClient.getProfile(USER_ID)).thenReturn(Mono.just(
                new ProfileDto("user-123", "test@enfoca.cl", "Juan", "Pérez", null, null)));
        when(metricsClient.getFullStatistics(USER_ID)).thenReturn(Mono.just(
                new StatisticsDto(10.0, 20, 5)));
        when(gamificationClient.getProfileSummary(USER_ID)).thenReturn(Mono.just(
                new GamificationProfileDto(500, 2, 3)));
        when(certificationClient.getUserCertificates(USER_ID)).thenReturn(
                Mono.error(new RuntimeException("servicio caído")));

        StepVerifier.create(service.aggregate(USER_ID))
                .assertNext(response -> {
                    assertThat(response.profile()).isNotNull();
                    assertThat(response.certificates()).isEmpty();
                })
                .verifyComplete();
    }
}
