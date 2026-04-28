package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.MetricsSummaryDto;
import online.enfoca.apigateway.dto.StatisticsDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class MetricsClient {

    private final WebClient webClient;

    public MetricsClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://metrics-service").build();
    }

    public Mono<MetricsSummaryDto> getDashboardSummary(String userId) {
        return webClient.get()
                .uri("/metricas/resumen-tablero")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(MetricsSummaryDto.class);
    }

    public Mono<StatisticsDto> getFullStatistics(String userId) {
        return webClient.get()
                .uri("/metricas/resumen-completo")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(StatisticsDto.class);
    }
}
