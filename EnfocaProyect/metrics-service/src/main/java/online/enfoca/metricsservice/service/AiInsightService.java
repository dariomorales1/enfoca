package online.enfoca.metricsservice.service;

import lombok.RequiredArgsConstructor;
import online.enfoca.metricsservice.dto.AiInsightDTO;
import online.enfoca.metricsservice.entity.AiInsight;
import online.enfoca.metricsservice.entity.DailySummary;
import online.enfoca.metricsservice.repository.AiInsightRepository;
import online.enfoca.metricsservice.repository.DailySummaryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final AiInsightRepository aiInsightRepository;
    private final DailySummaryRepository dailySummaryRepository;

    @Value("${app.metrics.streak-timezone:America/Santiago}")
    private String timezone;

    private LocalDate today() {
        return LocalDate.now(ZoneId.of(timezone));
    }

    // ── Obtener insight de la semana actual ──────────────────────

    @Transactional
    public AiInsightDTO getCurrentWeekInsight(Long userId) {
        LocalDate weekStart = today().with(DayOfWeek.MONDAY);

        Optional<AiInsight> existing = aiInsightRepository
                .findByUserIdAndWeekStart(userId, weekStart);

        if (existing.isPresent()) {
            return toDTO(existing.get());
        }

        // Generar nuevo insight basado en datos reales
        AiInsight generated = generateInsight(userId, weekStart);
        aiInsightRepository.save(generated);
        return toDTO(generated);
    }

    // ── Obtener el insight más reciente ──────────────────────────

    @Transactional(readOnly = true)
    public AiInsightDTO getLatestInsight(Long userId) {
        return aiInsightRepository
                .findTopByUserIdOrderByWeekStartDesc(userId)
                .map(this::toDTO)
                .orElse(buildEmptyInsight());
    }

    // ── Generar insight a partir de DailySummaries ───────────────

    private AiInsight generateInsight(Long userId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);

        List<DailySummary> week = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        userId, weekStart, weekEnd);

        int totalMinutes = week.stream()
                .mapToInt(DailySummary::getFocusedMinutes).sum();

        int totalSessions = week.stream()
                .mapToInt(DailySummary::getSessionsCount).sum();

        // Mejor día
        String bestDay = week.stream()
                .filter(ds -> ds.getFocusedMinutes() > 0)
                .max(Comparator.comparingInt(DailySummary::getFocusedMinutes))
                .map(ds -> ds.getSummaryDate().getDayOfWeek().name())
                .orElse("N/A");

        // Resumen narrativo simple (sin LLM por ahora)
        double avgHours = totalMinutes / 60.0 / 7.0;
        String summary = buildSummary(totalMinutes, totalSessions, avgHours);
        String recommendation = buildRecommendation(totalMinutes, week.size());

        return AiInsight.builder()
                .userId(userId)
                .weekStart(weekStart)
                .summary(summary)
                .bestDay(bestDay)
                .recommendation(recommendation)
                .build();
    }

    // ── Builders de texto ────────────────────────────────────────

    private String buildSummary(int totalMinutes, int totalSessions, double avgHours) {
        int hours = totalMinutes / 60;
        int mins  = totalMinutes % 60;

        if (totalMinutes == 0) {
            return "Sin sesiones registradas esta semana. ¡Es momento de retomar el ritmo!";
        }
        return String.format(
                "Esta semana completaste %d sesiones acumulando %dh %02dm de estudio enfocado. " +
                        "Tu promedio diario fue de %.1f horas.",
                totalSessions, hours, mins, avgHours);
    }

    private String buildRecommendation(int totalMinutes, int activeDays) {
        if (totalMinutes == 0) {
            return "Intenta comenzar con una sesión de 25 minutos mañana por la mañana.";
        }
        if (activeDays <= 2) {
            return "Incrementa tu consistencia. Apunta a al menos 4 días activos la próxima semana.";
        }
        if (totalMinutes < 120) {
            return "Buen inicio. Intenta agregar 15 minutos adicionales por sesión.";
        }
        return "Excelente consistencia. Mantén este ritmo y considera aumentar la dificultad del material.";
    }

    // ── Mapper ───────────────────────────────────────────────────

    private AiInsightDTO toDTO(AiInsight insight) {
        return AiInsightDTO.builder()
                .weekStart(insight.getWeekStart())
                .summary(insight.getSummary())
                .bestDay(insight.getBestDay())
                .recommendation(insight.getRecommendation())
                .generatedAt(insight.getGeneratedAt())
                .build();
    }

    private AiInsightDTO buildEmptyInsight() {
        return AiInsightDTO.builder()
                .summary("Aún no hay datos suficientes para generar un insight.")
                .recommendation("Completa tu primera sesión de estudio para comenzar.")
                .build();
    }
}