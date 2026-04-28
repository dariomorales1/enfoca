package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.GamificationProfileDto;
import online.enfoca.apigateway.dto.GamificationSummaryDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class GamificationClient {

    private final WebClient webClient;

    public GamificationClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://gamification-service").build();
    }

    public Mono<GamificationSummaryDto> getDashboardSummary(String userId) {
        return webClient.get()
                .uri("/gamificacion/resumen-tablero")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(GamificationSummaryDto.class);
    }

    public Mono<GamificationProfileDto> getProfileSummary(String userId) {
        return webClient.get()
                .uri("/gamificacion/resumen-perfil")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(GamificationProfileDto.class);
    }
}
