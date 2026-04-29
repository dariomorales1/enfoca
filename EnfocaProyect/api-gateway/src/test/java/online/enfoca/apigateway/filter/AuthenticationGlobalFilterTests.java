package online.enfoca.apigateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import online.enfoca.apigateway.config.GatewayPublicRoutesProperties;
import online.enfoca.apigateway.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationGlobalFilterTests {

    @Mock
    private WebFilterChain chain;

    private AuthenticationGlobalFilter filter;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        signingKey = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
        String base64Key = Encoders.BASE64.encode(signingKey.getEncoded());

        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecretKey(base64Key);

        GatewayPublicRoutesProperties publicRoutes = new GatewayPublicRoutesProperties();
        publicRoutes.setPublicRoutes(List.of("/auth/**", "/actuator/health"));

        filter = new AuthenticationGlobalFilter(jwtProperties, publicRoutes);
    }

    @Test
    void shouldAllowPublicRouteWithoutToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/auth/iniciar-sesion").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void shouldRejectProtectedRouteWithoutToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/bff/tablero").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldPropagateHeadersWithValidToken() {
        String token = Jwts.builder()
                .subject("user-123")
                .claim("rol", "ESTUDIANTE")
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(signingKey)
                .compact();

        MockServerHttpRequest request = MockServerHttpRequest.get("/bff/tablero")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any())).thenAnswer(inv -> {
            MockServerWebExchange mutated = inv.getArgument(0);
            assertThat(mutated.getRequest().getHeaders().getFirst("X-User-Id")).isEqualTo("user-123");
            assertThat(mutated.getRequest().getHeaders().getFirst("X-User-Role")).isEqualTo("ESTUDIANTE");
            return Mono.empty();
        });

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void shouldRejectInvalidToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/bff/tablero")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token.invalido.aqui")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
