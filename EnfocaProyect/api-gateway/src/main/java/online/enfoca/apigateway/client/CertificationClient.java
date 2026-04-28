package online.enfoca.apigateway.client;

import online.enfoca.apigateway.dto.CertificateDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class CertificationClient {

    private final WebClient webClient;

    public CertificationClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("lb://certification-service").build();
    }

    public Mono<List<CertificateDto>> getUserCertificates(String userId) {
        return webClient.get()
                .uri("/certificacion/usuario")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<CertificateDto>>() {});
    }
}
