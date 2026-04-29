package online.enfoca.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfiguration {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-route", r -> r.path("/auth/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("auth-service")))
                        .uri("lb://auth-service"))
                .route("oauth2-route", r -> r.path("/oauth2/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("auth-service")))
                        .uri("lb://auth-service"))
                .route("profile-route", r -> r.path("/profile/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("auth-service")))
                        .uri("lb://auth-service"))
                .route("pomodoro-route", r -> r.path("/pomodoro-sessions/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("pomodoro-service")))
                        .uri("lb://pomodoro-service"))
                .route("metrics-route", r -> r.path("/metricas/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("metrics-service")))
                        .uri("lb://metrics-service"))
                .route("study-plans-route", r -> r.path("/planes-estudio/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("study-plans-service")))
                        .uri("lb://study-plans-service"))
                .route("topics-route", r -> r.path("/temas/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("study-plans-service")))
                        .uri("lb://study-plans-service"))
                .route("gamification-route", r -> r.path("/gamificacion/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("gamification-service")))
                        .uri("lb://gamification-service"))
                .route("certification-route", r -> r.path("/certificacion/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("certification-service")))
                        .uri("lb://certification-service"))
                .route("verify-route", r -> r.path("/verificar/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("certification-service")))
                        .uri("lb://certification-service"))
                .route("weekly-analysis-route", r -> r.path("/analisis-semanal/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("weekly-analysis-service")))
                        .uri("lb://weekly-analysis-service"))
                .build();
    }
}
