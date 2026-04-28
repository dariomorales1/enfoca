package online.enfoca.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizeRequest {

    @NotBlank
    private String clientId;

    @NotBlank
    private String redirectUri;

    private String scope;

    @NotBlank
    private String codeChallenge;

    @NotBlank
    private String codeChallengeMethod;

    private String state;
    private String nonce;
}
