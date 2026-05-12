package online.enfoca.aiservice.dominio;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "modulo", schema = "planes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanEstudio plan;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private String titulo;

    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<Tema> temas = new ArrayList<>();
}
