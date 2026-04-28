package online.enfoca.authservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 150)
    private String universidad;

    @Column(length = 150)
    private String carrera;

    @Column
    private Integer semestre;

    @Column(nullable = false)
    @Builder.Default
    private Integer nivel = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer xp = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verificado = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.nivel == null) this.nivel = 1;
        if (this.xp == null) this.xp = 0;
        if (this.verificado == null) this.verificado = false;
    }
}