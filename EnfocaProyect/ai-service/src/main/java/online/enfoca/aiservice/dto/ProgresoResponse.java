package online.enfoca.aiservice.dto;

public record ProgresoResponse(
        int totalTemas,
        int temasCompletados,
        long porcentaje
) {}
