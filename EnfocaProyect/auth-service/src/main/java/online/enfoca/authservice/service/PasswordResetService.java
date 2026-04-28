package online.enfoca.authservice.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private final Map<String, ResetTokenData> tokens = new ConcurrentHashMap<>();

    public String createToken(String email) {
        String token = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        tokens.put(token, new ResetTokenData(email, LocalDateTime.now().plusMinutes(30)));
        return token;
    }

    public String validateToken(String token) {
        ResetTokenData data = tokens.get(token);
        if (data == null) {
            throw new IllegalArgumentException("Token inválido");
        }
        if (data.expiresAt().isBefore(LocalDateTime.now())) {
            tokens.remove(token);
            throw new IllegalArgumentException("Token expirado");
        }
        return data.email();
    }

    public void consumeToken(String token) {
        tokens.remove(token);
    }

    private record ResetTokenData(String email, LocalDateTime expiresAt) {}
}