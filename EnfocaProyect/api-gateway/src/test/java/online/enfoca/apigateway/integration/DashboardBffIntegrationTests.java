package online.enfoca.apigateway.integration;

import online.enfoca.apigateway.dto.DashboardResponse;
import online.enfoca.apigateway.dto.MetricsSummaryDto;
import online.enfoca.apigateway.service.bff.DashboardAggregatorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.cloud.gateway.discovery.locator.enabled=false",
        "eureka.client.enabled=false",
        "enfoca.jwt.secret-key=dGVzdC1zZWNyZXQta2V5LXBhcmEtcHJ1ZWJhcy1lbmZvY2E="
})
class DashboardBffIntegrationTests {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private DashboardAggregatorService dashboardAggregatorService;

    @Test
    void shouldReturnDashboardWhenUserIdHeaderPresent() {
        DashboardResponse response = new DashboardResponse(
                new MetricsSummaryDto(2.5, 12.0, 5),
                null, null, null);

        when(dashboardAggregatorService.aggregate(any())).thenReturn(Mono.just(response));

        webTestClient.get()
                .uri("/bff/tablero")
                .header("X-User-Id", "user-123")
                .header("Authorization", "Bearer test-bypass")
                .exchange()
                .expectStatus().isOk()
                .expectBody(DashboardResponse.class);
    }
}
