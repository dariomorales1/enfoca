package online.enfoca.authservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizeResponse {

    @JsonProperty("session_id")
    private UUID sessionId;

    @JsonProperty("login_url")
    private String loginUrl;

    private String state;
}
