package online.enfoca.apigateway.service.bff;

import online.enfoca.apigateway.client.GamificationClient;
import online.enfoca.apigateway.client.MetricsClient;
import online.enfoca.apigateway.client.PomodoroClient;
import online.enfoca.apigateway.client.StudyPlansClient;
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
class DashboardAggregatorServiceTests {

    @InjectMocks
    private DashboardAggregatorService service;

    @Mock
    private MetricsClient metricsClient;
    @Mock
    private GamificationClient gamificationClient;
    @Mock
    private StudyPlansClient studyPlansClient;
    @Mock
    private PomodoroClient pomodoroClient;

    private static final String USER_ID = "user-123";

    @Test
    void shouldAggregateAllServicesSuccessfully() {
        MetricsSummaryDto metrics = new MetricsSummaryDto(2.5, 12.0, 5);
        GamificationSummaryDto gamification = new GamificationSummaryDto(1250, 4, List.of());
        ActivePlanDto plan = new ActivePlanDto("plan-1", "Bases de Datos", 35);
        LastSessionDto session = new LastSessionDto("sess-1", "ESTANDAR", "2026-04-28T18:30:00Z");

        when(metricsClient.getDashboardSummary(USER_ID)).thenReturn(Mono.just(metrics));
        when(gamificationClient.getDashboardSummary(USER_ID)).thenReturn(Mono.just(gamification));
        when(studyPlansClient.getActivePlan(USER_ID)).thenReturn(Mono.just(plan));
        when(pomodoroClient.getLastSession(USER_ID)).thenReturn(Mono.just(session));

        StepVerifier.create(service.aggregate(USER_ID))
                .assertNext(response -> {
                    assertThat(response.metrics()).isEqualTo(metrics);
                    assertThat(response.gamification()).isEqualTo(gamification);
                    assertThat(response.activePlan()).isEqualTo(plan);
                    assertThat(response.lastSession()).isEqualTo(session);
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnNullForFailingService() {
        MetricsSummaryDto metrics = new MetricsSummaryDto(2.5, 12.0, 5);

        when(metricsClient.getDashboardSummary(USER_ID)).thenReturn(Mono.just(metrics));
        when(gamificationClient.getDashboardSummary(USER_ID)).thenReturn(Mono.error(new RuntimeException("servicio caído")));
        when(studyPlansClient.getActivePlan(USER_ID)).thenReturn(Mono.empty());
        when(pomodoroClient.getLastSession(USER_ID)).thenReturn(Mono.error(new RuntimeException("timeout")));

        StepVerifier.create(service.aggregate(USER_ID))
                .assertNext(response -> {
                    assertThat(response.metrics()).isEqualTo(metrics);
                    assertThat(response.gamification()).isNull();
                    assertThat(response.activePlan()).isNull();
                    assertThat(response.lastSession()).isNull();
                })
                .verifyComplete();
    }

    @Test
    void shouldCompleteEvenWhenAllServicesFail() {
        when(metricsClient.getDashboardSummary(USER_ID)).thenReturn(Mono.error(new RuntimeException()));
        when(gamificationClient.getDashboardSummary(USER_ID)).thenReturn(Mono.error(new RuntimeException()));
        when(studyPlansClient.getActivePlan(USER_ID)).thenReturn(Mono.error(new RuntimeException()));
        when(pomodoroClient.getLastSession(USER_ID)).thenReturn(Mono.error(new RuntimeException()));

        StepVerifier.create(service.aggregate(USER_ID))
                .assertNext(response -> {
                    assertThat(response.metrics()).isNull();
                    assertThat(response.gamification()).isNull();
                    assertThat(response.activePlan()).isNull();
                    assertThat(response.lastSession()).isNull();
                })
                .verifyComplete();
    }
}
