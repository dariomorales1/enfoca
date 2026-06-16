package online.enfoca.aiservice.dominio;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tema", schema = "planes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tema {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "pomodoros_estimados", nullable = false)
    @Builder.Default
    private int pomodorosEstimados = 3;

    @Column(name = "pomodoros_completados", nullable = false)
    @Builder.Default
    private int pomodorosCompletados = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean completado = false;

    @Column(name = "completado_en")
    private LocalDateTime completadoEn;

    @Column(name = "guia_socratica", columnDefinition = "TEXT")
    private String guiaSocratica;

    @Column(columnDefinition = "TEXT")
    private String subtemas;

    // --- NUEVO: Relación con las fechas programadas ---
    @OneToMany(mappedBy = "tema", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("fecha ASC")
    @Builder.Default
    private List<Programacion> programaciones = new ArrayList<>();

    public void incrementarPomodoro() {
        this.pomodorosCompletados++;
        if (this.pomodorosCompletados >= this.pomodorosEstimados && !this.completado) {
            this.completado = true;
            this.completadoEn = LocalDateTime.now();
        }
    }
}