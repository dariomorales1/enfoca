package online.enfoca.gamificationservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_insignias",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "insignia_id"}))
@Data
public class UsuarioInsignia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private String usuarioId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "insignia_id")
    private Insignia insignia;

    @Column(name = "desbloqueada_at")
    private LocalDateTime desbloqueadaAt = LocalDateTime.now();
}