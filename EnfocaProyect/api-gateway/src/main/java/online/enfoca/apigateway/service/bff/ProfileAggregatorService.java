package online.enfoca.apigateway.service.bff;

import online.enfoca.apigateway.client.AuthenticationClient;
import online.enfoca.apigateway.client.CertificationClient;
import online.enfoca.apigateway.client.GamificationClient;
import online.enfoca.apigateway.client.MetricsClient;
import online.enfoca.apigateway.dto.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileAggregatorService {

    private final AuthenticationClient authenticationClient;
    private final MetricsClient metricsClient;
    private final GamificationClient gamificationClient;
    private final CertificationClient certificationClient;

    public ProfileAggregatorService(AuthenticationClient authenticationClient,
                                    MetricsClient metricsClient,
                                    GamificationClient gamificationClient,
                                    CertificationClient certificationClient) {
        this.authenticationClient = authenticationClient;
        this.metricsClient = metricsClient;
        this.gamificationClient = gamificationClient;
        this.certificationClient = certificationClient;
    }

    public Mono<CompleteProfileResponse> aggregate(String userId) {
        Mono<Optional<ProfileDto>> profile = toOptional(
                authenticationClient.getProfile(userId));
        Mono<Optional<StatisticsDto>> statistics = toOptional(
                metricsClient.getFullStatistics(userId));
        Mono<Optional<GamificationProfileDto>> gamification = toOptional(
                gamificationClient.getProfileSummary(userId));
        Mono<Optional<List<CertificateDto>>> certificates = toOptional(
                certificationClient.getUserCertificates(userId));

        return Mono.zip(profile, statistics, gamification, certificates)
                .map(tuple -> new CompleteProfileResponse(
                        tuple.getT1().orElse(null),
                        tuple.getT2().orElse(null),
                        tuple.getT3().orElse(null),
                        tuple.getT4().orElse(List.of())
                ));
    }

    private <T> Mono<Optional<T>> toOptional(Mono<T> source) {
        return source
                .map(Optional::of)
                .onErrorResume(e -> Mono.just(Optional.empty()))
                .switchIfEmpty(Mono.just(Optional.empty()));
    }
}
