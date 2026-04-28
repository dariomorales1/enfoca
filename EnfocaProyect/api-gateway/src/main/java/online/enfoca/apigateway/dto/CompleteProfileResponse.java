package online.enfoca.apigateway.dto;

import java.util.List;

public record CompleteProfileResponse(
        ProfileDto profile,
        StatisticsDto statistics,
        GamificationProfileDto gamification,
        List<CertificateDto> certificates
) {}
