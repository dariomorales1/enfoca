package online.enfoca.authservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2CodeResponse {

    @JsonProperty("authorization_code")
    private String authorizationCode;

    @JsonProperty("redirect_uri")
    private String redirectUri;

    private String state;
}
