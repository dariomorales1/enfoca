package online.enfoca.apigateway.dto;

public record StatisticsDto(
        Double totalFocusedHours,
        Integer totalCompletedSessions,
        Integer activeDays
) {}
