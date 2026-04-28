package online.enfoca.apigateway.dto;

import java.util.List;

public record GamificationSummaryDto(
        Integer totalXp,
        Integer level,
        List<BadgeDto> lastBadges
) {
    public record BadgeDto(String code, String name, String earnedAt) {}
}
