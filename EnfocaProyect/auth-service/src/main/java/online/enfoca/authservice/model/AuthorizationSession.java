package online.enfoca.authservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "authorization_sessions", schema = "auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", nullable = false, length = 255)
    private String clientId;

    @Column(name = "redirect_uri", nullable = false, length = 500)
    private String redirectUri;

    @Column(name = "code_challenge", nullable = false, length = 255)
    private String codeChallenge;

    @Column(name = "code_challenge_method", nullable = false, length = 10)
    @Builder.Default
    private String codeChallengeMethod = "S256";

    @Column(length = 500)
    private String scope;

    @Column(length = 255)
    private String state;

    @Column(length = 255)
    private String nonce;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "authorization_code", unique = true, length = 255)
    private String authorizationCode;

    @Column(name = "code_used", nullable = false)
    @Builder.Default
    private Boolean codeUsed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
