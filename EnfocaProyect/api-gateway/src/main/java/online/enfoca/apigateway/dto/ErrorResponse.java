package online.enfoca.apigateway.dto;

public record ErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        String correlationId
) {}
