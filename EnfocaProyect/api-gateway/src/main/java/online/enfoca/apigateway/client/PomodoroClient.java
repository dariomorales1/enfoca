package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.LastSessionDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class PomodoroClient {

    private final WebClient webClient;

    public PomodoroClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://pomodoro-service").build();
    }

    public Mono<LastSessionDto> getLastSession(String userId) {
        return webClient.get()
                .uri("/sesiones-pomodoro/ultima")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(LastSessionDto.class);
    }
}
