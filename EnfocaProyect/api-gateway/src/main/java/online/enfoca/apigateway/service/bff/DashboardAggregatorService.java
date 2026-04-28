package online.enfoca.apigateway.service.bff;

import online.enfoca.apigateway.client.GamificationClient;
import online.enfoca.apigateway.client.MetricsClient;
import online.enfoca.apigateway.client.PomodoroClient;
import online.enfoca.apigateway.client.StudyPlansClient;
import online.enfoca.apigateway.dto.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Service
public class DashboardAggregatorService {

    private final MetricsClient metricsClient;
    private final GamificationClient gamificationClient;
    private final StudyPlansClient studyPlansClient;
    private final PomodoroClient pomodoroClient;

    public DashboardAggregatorService(MetricsClient metricsClient,
                                      GamificationClient gamificationClient,
                                      StudyPlansClient studyPlansClient,
                                      PomodoroClient pomodoroClient) {
        this.metricsClient = metricsClient;
        this.gamificationClient = gamificationClient;
        this.studyPlansClient = studyPlansClient;
        this.pomodoroClient = pomodoroClient;
    }

    public Mono<DashboardResponse> aggregate(String userId) {
        Mono<Optional<MetricsSummaryDto>> metrics = toOptional(
                metricsClient.getDashboardSummary(userId));
        Mono<Optional<GamificationSummaryDto>> gamification = toOptional(
                gamificationClient.getDashboardSummary(userId));
        Mono<Optional<ActivePlanDto>> activePlan = toOptional(
                studyPlansClient.getActivePlan(userId));
        Mono<Optional<LastSessionDto>> lastSession = toOptional(
                pomodoroClient.getLastSession(userId));

        return Mono.zip(metrics, gamification, activePlan, lastSession)
                .map(tuple -> new DashboardResponse(
                        tuple.getT1().orElse(null),
                        tuple.getT2().orElse(null),
                        tuple.getT3().orElse(null),
                        tuple.getT4().orElse(null)
                ));
    }

    private <T> Mono<Optional<T>> toOptional(Mono<T> source) {
        return source
                .map(Optional::of)
                .onErrorResume(e -> Mono.just(Optional.empty()))
                .switchIfEmpty(Mono.just(Optional.empty()));
    }
}
