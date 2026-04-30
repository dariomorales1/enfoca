package online.enfoca.apigateway.controller.bff;

import online.enfoca.apigateway.dto.DashboardResponse;
import online.enfoca.apigateway.service.bff.DashboardAggregatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/bff")
public class DashboardBffController {

    private final DashboardAggregatorService aggregatorService;

    public DashboardBffController(DashboardAggregatorService aggregatorService) {
        this.aggregatorService = aggregatorService;
    }

    @GetMapping("/dashboard")
    public Mono<ResponseEntity<DashboardResponse>> getDashboard(
            @RequestHeader("X-User-Id") String userId) {
        return aggregatorService.aggregate(userId)
                .map(ResponseEntity::ok);
    }
}
