package online.enfoca.authservice.service;

import online.enfoca.authservice.exception.InvalidTokenException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private record TokenEntry(String email, LocalDateTime expiresAt) {}

    private final Map<String, TokenEntry> store = new ConcurrentHashMap<>();

    public String createToken(String email) {
        String token = UUID.randomUUID() + "-" + UUID.randomUUID();
        store.put(token, new TokenEntry(email, LocalDateTime.now().plusMinutes(30)));
        return token;
    }

    public String validateToken(String token) {
        TokenEntry entry = store.get(token);
        if (entry == null) {
            throw new InvalidTokenException("Password reset token not found");
        }
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            store.remove(token);
            throw new InvalidTokenException("Password reset token has expired");
        }
        return entry.email();
    }

    public void consumeToken(String token) {
        store.remove(token);
    }
}
