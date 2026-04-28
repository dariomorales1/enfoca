package online.enfoca.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.jsonwebtoken.JwtException;
import online.enfoca.apigateway.dto.ErrorResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
        HttpStatus status;
        String errorMessage;
        String userMessage;

        if (ex instanceof CallNotPermittedException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            errorMessage = "Servicio no disponible";
            userMessage = "El servicio está temporalmente no disponible";
        } else if (ex instanceof TimeoutException) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            errorMessage = "Tiempo de espera agotado";
            userMessage = "El servicio no respondió a tiempo";
        } else if (ex instanceof JwtException) {
            status = HttpStatus.UNAUTHORIZED;
            errorMessage = "No autorizado";
            userMessage = "Token inválido o expirado";
        } else if (ex instanceof org.springframework.web.server.ResponseStatusException rse) {
            status = HttpStatus.resolve(rse.getStatusCode().value());
            if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = status.getReasonPhrase();
            userMessage = rse.getReason() != null ? rse.getReason() : errorMessage;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = "Error interno de la pasarela";
            userMessage = "Ocurrió un error inesperado";
        }

        String correlationId = exchange.getRequest().getHeaders()
                .getFirst("X-Correlation-Id");

        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now().toString(),
                status.value(),
                errorMessage,
                userMessage,
                exchange.getRequest().getURI().getPath(),
                correlationId
        );

        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        try {
            byte[] body = objectMapper.writeValueAsBytes(errorResponse);
            return exchange.getResponse().writeWith(
                    Mono.just(exchange.getResponse().bufferFactory().wrap(body))
            );
        } catch (JsonProcessingException e) {
            byte[] fallback = """
                    {"estado":500,"error":"Error interno"}
                    """.getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(
                    Mono.just(exchange.getResponse().bufferFactory().wrap(fallback))
            );
        }
    }
}
