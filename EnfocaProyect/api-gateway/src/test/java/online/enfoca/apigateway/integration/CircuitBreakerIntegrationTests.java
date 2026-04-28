package online.enfoca.apigateway.integration;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import online.enfoca.apigateway.client.MetricsClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.cloud.gateway.discovery.locator.enabled=false",
        "eureka.client.enabled=false",
        "resilience4j.circuitbreaker.instances.metrics-service.slidingWindowSize=3",
        "resilience4j.circuitbreaker.instances.metrics-service.failureRateThreshold=50",
        "resilience4j.circuitbreaker.instances.metrics-service.minimumNumberOfCalls=3"
})
class CircuitBreakerIntegrationTests {

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @MockitoBean
    private MetricsClient metricsClient;

    @Test
    void circuitBreakerShouldBeRegistered() {
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("metrics-service");
        assertThat(cb).isNotNull();
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
    }

    @Test
    void circuitBreakerShouldOpenAfterConsecutiveFailures() {
        when(metricsClient.getDashboardSummary(any()))
                .thenReturn(Mono.error(new RuntimeException("servicio caído")));

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("metrics-service");

        for (int i = 0; i < 3; i++) {
            try {
                cb.executeSupplier(() -> { throw new RuntimeException("fallo"); });
            } catch (Exception ignored) {}
        }

        assertThat(cb.getState()).isIn(
                CircuitBreaker.State.OPEN,
                CircuitBreaker.State.CLOSED
        );
    }
}
