package online.enfoca.metricsservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "streaks", schema = "metrics")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Streak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Recalcula el streak dado que hoy el usuario tuvo actividad.
     * Llama este método cada vez que se registra una sesión completada.
     */
    public void recalculate(LocalDate today) {
        if (lastActiveDate == null) {
            currentStreak = 1;
        } else if (lastActiveDate.equals(today)) {
            // Ya se contó hoy, no hacer nada
            return;
        } else if (lastActiveDate.equals(today.minusDays(1))) {
            // Día consecutivo
            currentStreak++;
        } else {
            // Se rompió el streak
            currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }

        lastActiveDate = today;
    }
}