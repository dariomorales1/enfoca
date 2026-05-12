package online.enfoca.metricsservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "daily_summaries", schema = "metrics",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "summary_date"}))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    @Column(name = "focused_minutes", nullable = false)
    @Builder.Default
    private Integer focusedMinutes = 0;

    @Column(name = "sessions_count", nullable = false)
    @Builder.Default
    private Integer sessionsCount = 0;

    @Column(name = "cycles_count", nullable = false)
    @Builder.Default
    private Integer cyclesCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Utilidad para sumar minutos a partir de segundos
    public void addFocusedSeconds(int seconds) {
        this.focusedMinutes += seconds / 60;
    }
}