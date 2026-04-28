package online.enfoca.authservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import online.enfoca.authservice.model.User;

import java.time.ZoneOffset;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String role;

    @JsonProperty("created_at")
    private String createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getNombre())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
                        : null)
                .build();
    }
}
