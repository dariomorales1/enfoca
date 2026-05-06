package online.enfoca.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.jsonwebtoken.JwtException;
import online.enfoca.apigateway.dto.ErrorResponse;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebExceptionHandler;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.TimeoutException;

@Component
@Order(-1)
public class GlobalExceptionHandler implements WebExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();

        // Si la respuesta ya fue enviada o cerrada, no podemos modificarla
        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        HttpStatus status = determineStatus(ex);
        String errorMessage = determineErrorMessage(status);
        String userMessage = determineUserMessage(ex, errorMessage);

        String correlationId = exchange.getRequest().getHeaders().getFirst("X-Correlation-Id");

        ErrorResponse errorBody = new ErrorResponse(
                Instant.now().toString(),
                status.value(),
                errorMessage,
                userMessage,
                exchange.getRequest().getURI().getPath(),
                correlationId
        );

        // Configuramos la respuesta de forma segura
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return response.writeWith(Mono.fromSupplier(() -> {
            try {
                byte[] bytes = objectMapper.writeValueAsBytes(errorBody);
                return response.bufferFactory().wrap(bytes);
            } catch (JsonProcessingException e) {
                return response.bufferFactory().wrap("{\"error\":\"internal\"}".getBytes(StandardCharsets.UTF_8));
            }
        }));
    }

    private HttpStatus determineStatus(Throwable ex) {
        if (ex instanceof CallNotPermittedException) return HttpStatus.SERVICE_UNAVAILABLE;
        if (ex instanceof TimeoutException) return HttpStatus.GATEWAY_TIMEOUT;
        if (ex instanceof JwtException) return HttpStatus.UNAUTHORIZED;
        if (ex instanceof org.springframework.web.server.ResponseStatusException rse) {
            return HttpStatus.resolve(rse.getStatusCode().value());
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private String determineErrorMessage(HttpStatus status) {
        return status != null ? status.getReasonPhrase() : "Error interno";
    }

    private String determineUserMessage(Throwable ex, String defaultMessage) {
        if (ex instanceof CallNotPermittedException) return "El servicio está temporalmente no disponible";
        if (ex instanceof TimeoutException) return "El servicio no respondió a tiempo";
        if (ex instanceof JwtException) return "Token inválido o expirado";
        if (ex instanceof org.springframework.web.server.ResponseStatusException rse) {
            return rse.getReason() != null ? rse.getReason() : defaultMessage;
        }
        return "Ocurrió un error inesperado";
    }
}