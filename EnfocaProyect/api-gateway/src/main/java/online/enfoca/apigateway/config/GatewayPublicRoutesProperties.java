package online.enfoca.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "enfoca")
public class GatewayPublicRoutesProperties {

    private List<String> publicRoutes = List.of();

    public List<String> getPublicRoutes() {
        return publicRoutes;
    }

    public void setPublicRoutes(List<String> publicRoutes) {
        this.publicRoutes = publicRoutes;
    }
}
