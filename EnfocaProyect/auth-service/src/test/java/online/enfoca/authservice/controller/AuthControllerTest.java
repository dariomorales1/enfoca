package online.enfoca.authservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.authservice.dto.request.*;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.dto.response.UserResponse;
import online.enfoca.authservice.service.AuthService;
import online.enfoca.authservice.service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private PasswordResetService passwordResetService;

    @InjectMocks
    private AuthController controller;

    private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void register_returns201WithUserResponse() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .id(1L).email("test@test.com").firstName("Test").role("USER").build();
        when(authService.register(any(RegisterRequest.class))).thenReturn(userResponse);

        RegisterRequest req = RegisterRequest.builder()
                .email("test@test.com").password("Pass1234!").firstName("Test").build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@test.com"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void login_returns200WithTokenResponse() throws Exception {
        TokenResponse tokens = TokenResponse.builder()
                .accessToken("access.jwt.token").refreshToken("refresh-token").expiresIn(3600L).build();
        when(authService.login(any(LoginRequest.class))).thenReturn(tokens);

        LoginRequest req = LoginRequest.builder().email("test@test.com").password("Pass1234!").build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("access.jwt.token"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void refresh_returns200WithNewTokens() throws Exception {
        TokenResponse tokens = TokenResponse.builder()
                .accessToken("new.access.token").refreshToken("new-refresh").expiresIn(3600L).build();
        when(authService.refresh(any(RefreshTokenRequest.class))).thenReturn(tokens);

        RefreshTokenRequest req = new RefreshTokenRequest("old-refresh-token");

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("new.access.token"));
    }

    @Test
    void logout_returns204NoContent() throws Exception {
        doNothing().when(authService).logout(any(LogoutRequest.class));

        LogoutRequest req = new LogoutRequest("refresh-token-to-revoke");

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());

        verify(authService).logout(any(LogoutRequest.class));
    }

    @Test
    void forgotPassword_returns204NoContent() throws Exception {
        doNothing().when(passwordResetService).createToken(anyString());

        ForgotPasswordRequest req = ForgotPasswordRequest.builder().email("user@test.com").build();

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());

        verify(passwordResetService).createToken("user@test.com");
    }

    @Test
    void resetPassword_returns204AndCallsServices() throws Exception {
        when(passwordResetService.validateToken("valid-token")).thenReturn("user@test.com");
        doNothing().when(authService).resetPassword(eq("user@test.com"), anyString());
        doNothing().when(passwordResetService).consumeToken("valid-token");

        ResetPasswordRequest req = ResetPasswordRequest.builder()
                .token("valid-token").newPassword("NewPass1!").build();

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());

        verify(passwordResetService).validateToken("valid-token");
        verify(authService).resetPassword("user@test.com", "NewPass1!");
        verify(passwordResetService).consumeToken("valid-token");
    }

    @Test
    void ping_returns200WithMessage() throws Exception {
        mockMvc.perform(get("/auth/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("auth-service OK"));
    }
}
