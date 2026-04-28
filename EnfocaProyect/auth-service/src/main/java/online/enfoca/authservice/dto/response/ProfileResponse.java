package online.enfoca.authservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import online.enfoca.authservice.model.User;

import java.time.ZoneOffset;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private Long id;
    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String biography;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    private String role;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    public static ProfileResponse from(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getNombre())
                .lastName(user.getLastName())
                .biography(user.getBiography())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
                        : null)
                .updatedAt(user.getUpdatedAt() != null
                        ? user.getUpdatedAt().toInstant(ZoneOffset.UTC).toString()
                        : null)
                .build();
    }
}
