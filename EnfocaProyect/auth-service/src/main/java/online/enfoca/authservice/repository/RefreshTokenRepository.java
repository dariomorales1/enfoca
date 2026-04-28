package online.enfoca.authservice.repository;

import online.enfoca.authservice.model.RefreshToken;
import online.enfoca.authservice.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.status = :status WHERE r.sessionId = :sessionId AND r.status <> 'REVOKED'")
    int updateStatusBySessionId(UUID sessionId, TokenStatus status);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    int deleteExpiredBefore(LocalDateTime now);
}
