package online.enfoca.authservice.repository;

import online.enfoca.authservice.model.AuthorizationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface AuthorizationSessionRepository extends JpaRepository<AuthorizationSession, UUID> {

    Optional<AuthorizationSession> findByAuthorizationCode(String code);

    @Modifying
    @Query("DELETE FROM AuthorizationSession s WHERE s.expiresAt < :now")
    int deleteExpiredBefore(LocalDateTime now);
}
