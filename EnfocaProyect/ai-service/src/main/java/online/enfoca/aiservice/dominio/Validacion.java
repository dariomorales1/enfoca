package online.enfoca.aiservice.dominio;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "validacion", schema = "planes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"plan_id", "usuario_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Validacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanEstudio plan;

    @Column(name = "usuario_id", nullable = false, length = 50)
    private String usuarioId;

    @Column(nullable = false)
    private int puntaje;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
