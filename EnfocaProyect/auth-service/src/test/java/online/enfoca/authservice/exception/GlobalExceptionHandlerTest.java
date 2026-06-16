package online.enfoca.authservice.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @RestController
    @RequestMapping("/test-exceptions")
    static class ThrowingController {
        @GetMapping("/email-conflict")
        public void emailConflict() { throw new EmailAlreadyRegisteredException("user@test.com"); }

        @GetMapping("/invalid-credentials")
        public void invalidCredentials() { throw new InvalidCredentialsException(); }

        @GetMapping("/user-inactive")
        public void userInactive() { throw new UserInactiveException(); }

        @GetMapping("/invalid-token")
        public void invalidToken() { throw new InvalidTokenException("Token inválido"); }

        @GetMapping("/replay-attack")
        public void replayAttack() { throw new ReplayAttackException(); }

        @GetMapping("/oauth2-error")
        public void oauth2Error() { throw new OAuth2Exception("invalid_client", "Client no registrado"); }

        @GetMapping("/general-error")
        public void generalError() { throw new RuntimeException("Error genérico inesperado"); }

        record ValidatedInput(@NotBlank String nombre) {}

        @PostMapping("/validation-error")
        public void validationError(@Validated @RequestBody ValidatedInput input) {}
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ThrowingController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void handleEmailAlreadyRegistered_returns409() throws Exception {
        mockMvc.perform(get("/test-exceptions/email-conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void handleInvalidCredentials_returns401() throws Exception {
        mockMvc.perform(get("/test-exceptions/invalid-credentials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void handleUserInactive_returns403() throws Exception {
        mockMvc.perform(get("/test-exceptions/user-inactive"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    void handleInvalidToken_returns401() throws Exception {
        mockMvc.perform(get("/test-exceptions/invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Token inválido"));
    }

    @Test
    void handleReplayAttack_returns401() throws Exception {
        mockMvc.perform(get("/test-exceptions/replay-attack"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void handleOAuth2Exception_returns400() throws Exception {
        mockMvc.perform(get("/test-exceptions/oauth2-error"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("invalid_client"));
    }

    @Test
    void handleGeneralException_returns500() throws Exception {
        mockMvc.perform(get("/test-exceptions/general-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"));
    }

    @Test
    void handleValidationException_returns400WithFieldMessages() throws Exception {
        mockMvc.perform(post("/test-exceptions/validation-error")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void errorResponse_containsTimestampAndPath() throws Exception {
        mockMvc.perform(get("/test-exceptions/invalid-credentials"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.path").value("/test-exceptions/invalid-credentials"));
    }
}
