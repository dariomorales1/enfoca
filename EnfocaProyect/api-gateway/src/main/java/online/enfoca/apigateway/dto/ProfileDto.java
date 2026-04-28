package online.enfoca.apigateway.dto;

public record ProfileDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String bio,
        String avatarUrl
) {}
