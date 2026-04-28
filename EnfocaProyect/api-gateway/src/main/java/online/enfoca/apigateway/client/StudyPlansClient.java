package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.ActivePlanDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class StudyPlansClient {

    private final WebClient webClient;

    public StudyPlansClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://study-plans-service").build();
    }

    public Mono<ActivePlanDto> getActivePlan(String userId) {
        return webClient.get()
                .uri("/planes-estudio/activo")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(ActivePlanDto.class);
    }
}
