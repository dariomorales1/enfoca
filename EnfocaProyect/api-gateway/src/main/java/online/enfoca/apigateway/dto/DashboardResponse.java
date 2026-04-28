package online.enfoca.apigateway.dto;

public record DashboardResponse(
        MetricsSummaryDto metrics,
        GamificationSummaryDto gamification,
        ActivePlanDto activePlan,
        LastSessionDto lastSession
) {}
