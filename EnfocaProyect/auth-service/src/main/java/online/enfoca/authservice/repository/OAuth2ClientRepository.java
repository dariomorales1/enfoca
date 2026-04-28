package online.enfoca.authservice.repository;

import online.enfoca.authservice.model.OAuth2Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuth2ClientRepository extends JpaRepository<OAuth2Client, UUID> {
    Optional<OAuth2Client> findByClientIdAndActiveTrue(String clientId);
}
