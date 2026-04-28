package online.enfoca.apigateway.dto;

public record CertificateDto(
        String id,
        String title,
        String issuedAt,
        String verificationUrl
) {}
