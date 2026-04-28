package online.enfoca.apigateway.integration;

import online.enfoca.apigateway.ApiGatewayApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(classes = ApiGatewayApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.cloud.gateway.discovery.locator.enabled=false",
        "eureka.client.enabled=false",
        "spring.cloud.loadbalancer.enabled=false"
})
class GatewayRoutesIntegrationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void shouldReturn401ForProtectedRouteWithoutToken() {
        webTestClient.get()
                .uri("/bff/tablero")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void shouldReturn401ForProtectedRouteWithInvalidToken() {
        webTestClient.get()
                .uri("/bff/tablero")
                .header("Authorization", "Bearer token.invalido")
                .exchange()
                .expectStatus().isUnauthorized();
    }
}
