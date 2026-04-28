package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.CertificateDto;
import online.enfoca.apigateway.dto.ProfileDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationClient {

    private final WebClient webClient;

    public AuthenticationClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://auth-service").build();
    }

    public Mono<ProfileDto> getProfile(String userId) {
        return webClient.get()
                .uri("/perfil")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(ProfileDto.class);
    }
}
