package online.enfoca.apigateway.controller.bff;

import online.enfoca.apigateway.dto.CompleteProfileResponse;
import online.enfoca.apigateway.service.bff.ProfileAggregatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/bff")
public class ProfileBffController {

    private final ProfileAggregatorService aggregatorService;

    public ProfileBffController(ProfileAggregatorService aggregatorService) {
        this.aggregatorService = aggregatorService;
    }

    @GetMapping("/perfil-completo")
    public Mono<ResponseEntity<CompleteProfileResponse>> getCompleteProfile(
            @RequestHeader("X-User-Id") String userId) {
        return aggregatorService.aggregate(userId)
                .map(ResponseEntity::ok);
    }
}
