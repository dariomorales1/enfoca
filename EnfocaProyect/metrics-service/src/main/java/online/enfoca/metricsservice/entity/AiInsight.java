package online.enfoca.metricsservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_insights", schema = "metrics",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "week_start"}))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "best_day", length = 20)
    private String bestDay;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private OffsetDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = OffsetDateTime.now();
    }
}