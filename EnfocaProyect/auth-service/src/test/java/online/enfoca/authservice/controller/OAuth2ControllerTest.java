package online.enfoca.authservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.authservice.dto.request.AuthorizeRequest;
import online.enfoca.authservice.dto.request.OAuth2LoginRequest;
import online.enfoca.authservice.dto.request.TokenExchangeRequest;
import online.enfoca.authservice.dto.response.AuthorizeResponse;
import online.enfoca.authservice.dto.response.OAuth2CodeResponse;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.service.OAuth2Service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OAuth2ControllerTest {

    @Mock
    private OAuth2Service oauth2Service;

    @InjectMocks
    private OAuth2Controller controller;

    private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void authorize_returns200WithSessionIdAndLoginUrl() throws Exception {
        UUID sessionId = UUID.randomUUID();
        AuthorizeResponse response = AuthorizeResponse.builder()
                .sessionId(sessionId).loginUrl("/oauth2/login").state("st").build();
        when(oauth2Service.authorize(any(AuthorizeRequest.class))).thenReturn(response);

        AuthorizeRequest req = AuthorizeRequest.builder()
                .clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeChallenge("challenge")
                .codeChallengeMethod("S256")
                .state("st")
                .build();

        mockMvc.perform(post("/oauth2/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session_id").value(sessionId.toString()))
                .andExpect(jsonPath("$.login_url").value("/oauth2/login"));

        verify(oauth2Service).authorize(any(AuthorizeRequest.class));
    }

    @Test
    void login_returns200WithAuthorizationCodeAndRedirectUri() throws Exception {
        OAuth2CodeResponse response = OAuth2CodeResponse.builder()
                .authorizationCode("auth-code-xyz")
                .redirectUri("https://app.example.com/callback?code=auth-code-xyz")
                .state("st")
                .build();
        when(oauth2Service.login(any(OAuth2LoginRequest.class))).thenReturn(response);

        OAuth2LoginRequest req = OAuth2LoginRequest.builder()
                .sessionId(UUID.randomUUID())
                .email("user@example.com")
                .password("pass123")
                .build();

        mockMvc.perform(post("/oauth2/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorization_code").value("auth-code-xyz"));

        verify(oauth2Service).login(any(OAuth2LoginRequest.class));
    }

    @Test
    void token_returns200WithAccessAndRefreshTokens() throws Exception {
        TokenResponse response = TokenResponse.builder()
                .accessToken("access-jwt").refreshToken("refresh-token").expiresIn(3600L).build();
        when(oauth2Service.exchangeToken(any(TokenExchangeRequest.class))).thenReturn(response);

        TokenExchangeRequest req = TokenExchangeRequest.builder()
                .grantType("authorization_code")
                .code("auth-code")
                .clientId("app-client")
                .redirectUri("https://app.example.com/callback")
                .codeVerifier("verifier")
                .build();

        mockMvc.perform(post("/oauth2/token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("access-jwt"))
                .andExpect(jsonPath("$.refresh_token").value("refresh-token"));

        verify(oauth2Service).exchangeToken(any(TokenExchangeRequest.class));
    }
}
