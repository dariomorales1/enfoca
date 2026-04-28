package online.enfoca.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenExchangeRequest {

    @NotBlank
    private String grantType;

    // authorization_code grant
    private String clientId;
    private String code;
    private String codeVerifier;
    private String redirectUri;

    // refresh_token grant
    private String refreshToken;
}
