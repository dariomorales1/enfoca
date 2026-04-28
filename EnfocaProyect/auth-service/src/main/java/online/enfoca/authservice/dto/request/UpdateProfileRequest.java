package online.enfoca.authservice.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Size(max = 2000)
    private String biography;

    @Size(max = 500)
    private String avatarUrl;
}
