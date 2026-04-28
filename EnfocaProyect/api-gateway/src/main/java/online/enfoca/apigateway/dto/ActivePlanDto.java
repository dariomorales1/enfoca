package online.enfoca.apigateway.dto;

public record ActivePlanDto(
        String id,
        String title,
        Integer progressPercent
) {}
