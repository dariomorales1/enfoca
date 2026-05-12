package online.enfoca.aiservice.dominio;

import jakarta.persistence.*;
import lombok.*;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.enums.NivelPlan;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;



@Entity
@Table(name = "plan_estudio", schema = "planes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlanEstudio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, length = 50)
    private String usuarioId;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String objetivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NivelPlan nivel = NivelPlan.BASICO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoPlan estado = EstadoPlan.ACTIVO;

    @Column(name = "ratio_validaciones", nullable = false)
    @Builder.Default
    private double ratioValidaciones = 0.0;

    @Column(name = "total_validaciones", nullable = false)
    @Builder.Default
    private int totalValidaciones = 0;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<Modulo> modulos = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Validacion> validaciones = new ArrayList<>();

    public void recalcularRatio() {
        if (totalValidaciones == 0) {
            this.ratioValidaciones = 0.0;
            return;
        }
        long positivas = validaciones.stream()
                .filter(v -> v.getPuntaje() >= 4)
                .count();
        this.ratioValidaciones = (double) positivas / totalValidaciones;
    }
}
