package online.enfoca.metricsservice.repository;

import online.enfoca.metricsservice.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {

    Optional<AiInsight> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);

    // El insight más reciente del usuario
    Optional<AiInsight> findTopByUserIdOrderByWeekStartDesc(Long userId);
}