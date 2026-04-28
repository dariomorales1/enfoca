package online.enfoca.authservice.controller;

import jakarta.validation.Valid;
import online.enfoca.authservice.dto.request.AuthorizeRequest;
import online.enfoca.authservice.dto.request.OAuth2LoginRequest;
import online.enfoca.authservice.dto.request.TokenExchangeRequest;
import online.enfoca.authservice.dto.response.AuthorizeResponse;
import online.enfoca.authservice.dto.response.OAuth2CodeResponse;
import online.enfoca.authservice.dto.response.TokenResponse;
import online.enfoca.authservice.service.OAuth2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/oauth2")
public class OAuth2Controller {

    private final OAuth2Service oauth2Service;

    public OAuth2Controller(OAuth2Service oauth2Service) {
        this.oauth2Service = oauth2Service;
    }

    /**
     * Step 1 — PKCE: Client initiates authorization.
     * Returns session_id; client must redirect user to /oauth2/login.
     */
    @PostMapping("/authorize")
    public ResponseEntity<AuthorizeResponse> authorize(@Valid @RequestBody AuthorizeRequest request) {
        return ResponseEntity.ok(oauth2Service.authorize(request));
    }

    /**
     * Step 2 — PKCE: User submits credentials linked to a pending session.
     * Returns authorization_code + redirect_uri with code appended.
     */
    @PostMapping("/login")
    public ResponseEntity<OAuth2CodeResponse> login(@Valid @RequestBody OAuth2LoginRequest request) {
        return ResponseEntity.ok(oauth2Service.login(request));
    }

    /**
     * Step 3 — Token exchange.
     * Supports grant_type: authorization_code (PKCE) and refresh_token.
     */
    @PostMapping("/token")
    public ResponseEntity<TokenResponse> token(@Valid @RequestBody TokenExchangeRequest request) {
        return ResponseEntity.ok(oauth2Service.exchangeToken(request));
    }
}
