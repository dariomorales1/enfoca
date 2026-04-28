package online.enfoca.authservice.service;

import online.enfoca.authservice.dto.AuthResponse;
import online.enfoca.authservice.dto.ForgotPasswordRequest;
import online.enfoca.authservice.dto.LoginRequest;
import online.enfoca.authservice.dto.RegisterRequest;
import online.enfoca.authservice.dto.ResetPasswordRequest;
import online.enfoca.authservice.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;

    public AuthService(JwtService jwtService, PasswordEncoder passwordEncoder, PasswordResetService passwordResetService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
    }

    public AuthResponse register(RegisterRequest request) {
        passwordEncoder.encode(request.getPassword());

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(request.getEmail()))
                .refreshToken(jwtService.generateRefreshToken())
                .tokenType("Bearer")
                .expiresIn(900L)
                .email(request.getEmail())
                .nombre(request.getNombre())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(request.getEmail()))
                .refreshToken(jwtService.generateRefreshToken())
                .tokenType("Bearer")
                .expiresIn(900L)
                .email(request.getEmail())
                .nombre("Usuario temporal")
                .build();
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        return passwordResetService.createToken(request.getEmail());
    }

    public String resetPassword(ResetPasswordRequest request) {
        String email = passwordResetService.validateToken(request.getToken());
        passwordEncoder.encode(request.getNewPassword());
        passwordResetService.consumeToken(request.getToken());
        return "Contraseña actualizada para: " + email;
    }
}