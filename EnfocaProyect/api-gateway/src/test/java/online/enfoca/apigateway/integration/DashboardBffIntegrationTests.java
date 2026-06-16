package online.enfoca.apigateway.integration;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import online.enfoca.apigateway.dto.DashboardResponse;
import online.enfoca.apigateway.dto.MetricsSummaryDto;
import online.enfoca.apigateway.service.bff.DashboardAggregatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.Date;

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

    private static final String TEST_SECRET = "dGVzdC1zZWNyZXQta2V5LXBhcmEtcHJ1ZWJhcy1lbmZvY2E=";

    @Autowired
    private ApplicationContext applicationContext;

    private WebTestClient webTestClient;

    @MockitoBean
    private DashboardAggregatorService dashboardAggregatorService;

    @BeforeEach
    void setUp() {
        webTestClient = WebTestClient.bindToApplicationContext(applicationContext).build();
    }

    @Test
    void shouldReturnDashboardWhenUserIdHeaderPresent() {
        SecretKey signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET));
        String validToken = Jwts.builder()
                .subject("user-123")
                .claim("rol", "ESTUDIANTE")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(signingKey)
                .compact();

        DashboardResponse response = new DashboardResponse(
                new MetricsSummaryDto(2.5, 12.0, 5),
                null, null, null);

        when(dashboardAggregatorService.aggregate(any())).thenReturn(Mono.just(response));

        webTestClient.get()
                .uri("/bff/dashboard")
                .header("X-User-Id", "user-123")
                .header("Authorization", "Bearer " + validToken)
                .exchange()
                .expectStatus().isOk()
                .expectBody(DashboardResponse.class);
    }
}
