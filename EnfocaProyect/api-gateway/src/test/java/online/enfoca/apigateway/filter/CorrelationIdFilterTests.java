package online.enfoca.apigateway.filter;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CorrelationIdFilterTests {

    @InjectMocks
    private CorrelationIdFilter filter;

    @Mock
    private GatewayFilterChain chain;

    @Test
    void shouldGenerateCorrelationIdWhenMissing() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/test").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any())).thenAnswer(inv -> {
            MockServerWebExchange mutated = inv.getArgument(0);
            String id = mutated.getRequest().getHeaders().getFirst(CorrelationIdFilter.HEADER_CORRELATION_ID);
            assertThat(id).isNotNull().isNotBlank();
            return Mono.empty();
        });

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void shouldPreserveExistingCorrelationId() {
        String existingId = "test-correlation-id-123";
        MockServerHttpRequest request = MockServerHttpRequest.get("/test")
                .header(CorrelationIdFilter.HEADER_CORRELATION_ID, existingId)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any())).thenAnswer(inv -> {
            MockServerWebExchange mutated = inv.getArgument(0);
            String id = mutated.getRequest().getHeaders().getFirst(CorrelationIdFilter.HEADER_CORRELATION_ID);
            assertThat(id).isEqualTo(existingId);
            return Mono.empty();
        });

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void shouldHaveHigherPriorityThanAuthFilter() {
        assertThat(filter.getOrder()).isLessThan(-100);
    }
}
