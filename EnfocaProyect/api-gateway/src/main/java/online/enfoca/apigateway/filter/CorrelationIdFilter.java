package online.enfoca.apigateway.filter;

import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
@Order(-200)
public class CorrelationIdFilter implements WebFilter {

    public static final String HEADER_CORRELATION_ID = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(HEADER_CORRELATION_ID);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationId;

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(HEADER_CORRELATION_ID, finalCorrelationId)
                .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        mutatedExchange.getResponse().beforeCommit(() -> {
            ServerHttpResponse response = mutatedExchange.getResponse();

            // Reemplazamos containsKey por getFirst() != null para evitar el error del IDE
            if (!response.isCommitted() && response.getHeaders().getFirst(HEADER_CORRELATION_ID) == null) {
                try {
                    response.getHeaders().add(HEADER_CORRELATION_ID, finalCorrelationId);
                } catch (UnsupportedOperationException e) {
                    // Manejo silencioso en caso de que los headers sean ReadOnly
                }
            }
            return Mono.empty();
        });

        return chain.filter(mutatedExchange);
    }
}