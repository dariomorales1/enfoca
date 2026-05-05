package online.enfoca.metricsservice.repository;

import online.enfoca.metricsservice.entity.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailySummaryRepository extends JpaRepository<DailySummary, Long> {

    Optional<DailySummary> findByUserIdAndSummaryDate(Long userId, LocalDate date);

    // Últimos N días
    List<DailySummary> findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
            Long userId, LocalDate from, LocalDate to);

    // Total de minutos en un rango
    @Query("""
        SELECT COALESCE(SUM(ds.focusedMinutes), 0)
        FROM DailySummary ds
        WHERE ds.userId = :userId
          AND ds.summaryDate BETWEEN :from AND :to
        """)
    Integer sumFocusedMinutesByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Total histórico
    @Query("""
        SELECT COALESCE(SUM(ds.focusedMinutes), 0)
        FROM DailySummary ds
        WHERE ds.userId = :userId
        """)
    Integer sumTotalFocusedMinutesByUserId(@Param("userId") Long userId);

    // Para heatmap mensual
    @Query("""
        SELECT ds FROM DailySummary ds
        WHERE ds.userId = :userId
          AND YEAR(ds.summaryDate) = :year
          AND MONTH(ds.summaryDate) = :month
        ORDER BY ds.summaryDate ASC
        """)
    List<DailySummary> findByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month);
}