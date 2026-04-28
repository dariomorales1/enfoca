package online.enfoca.apigateway.dto;

public record MetricsSummaryDto(
        Double focusedHoursToday,
        Double focusedHoursWeek,
        Integer streakDays
) {}
