package online.enfoca.metricsservice.service;

import lombok.RequiredArgsConstructor;
import online.enfoca.metricsservice.dto.*;
import online.enfoca.metricsservice.entity.DailySummary;
import online.enfoca.metricsservice.entity.Streak;
import online.enfoca.metricsservice.repository.DailySummaryRepository;
import online.enfoca.metricsservice.repository.StreakRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final DailySummaryRepository dailySummaryRepository;
    private final StreakRepository streakRepository;

    @Value("${app.metrics.streak-timezone:America/Santiago}")
    private String timezone;

    // ── Helpers ──────────────────────────────────────────────────

    private LocalDate today() {
        return LocalDate.now(ZoneId.of(timezone));
    }

    private LocalDate startOfWeek() {
        return today().with(java.time.DayOfWeek.MONDAY);
    }

    private LocalDate startOfMonth() {
        return today().withDayOfMonth(1);
    }

    // ── Summary (KPIs) ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MetricsSummaryDTO getSummary(Long userId) {
        LocalDate today     = today();
        LocalDate weekStart = startOfWeek();
        LocalDate monthStart = startOfMonth();

        int minutesToday = dailySummaryRepository
                .sumFocusedMinutesByUserIdAndDateRange(userId, today, today);

        int minutesWeek = dailySummaryRepository
                .sumFocusedMinutesByUserIdAndDateRange(userId, weekStart, today);

        int minutesMonth = dailySummaryRepository
                .sumFocusedMinutesByUserIdAndDateRange(userId, monthStart, today);

        int minutesTotal = dailySummaryRepository
                .sumTotalFocusedMinutesByUserId(userId);

        Streak streak = streakRepository.findByUserId(userId)
                .orElse(Streak.builder().userId(userId).build());

        int sessionsToday = dailySummaryRepository
                .findByUserIdAndSummaryDate(userId, today)
                .map(DailySummary::getSessionsCount)
                .orElse(0);

        // Retention rate: días activos en últimos 30 días / 30
        LocalDate thirtyDaysAgo = today.minusDays(29);
        long activeDays = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        userId, thirtyDaysAgo, today)
                .stream()
                .filter(ds -> ds.getFocusedMinutes() > 0)
                .count();
        double retentionRate = Math.round((activeDays / 30.0) * 100 * 10) / 10.0;

        return MetricsSummaryDTO.builder()
                .focusedMinutesToday(minutesToday)
                .focusedMinutesWeek(minutesWeek)
                .focusedMinutesMonth(minutesMonth)
                .focusedMinutesTotal(minutesTotal)
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .sessionsToday(sessionsToday)
                .retentionRate(retentionRate)
                .build();
    }

    // ── Gráfico de línea — últimos 7 días ─────────────────────────

    @Transactional(readOnly = true)
    public List<DailyHoursDTO> getLast7Days(Long userId) {
        LocalDate today = today();
        LocalDate from  = today.minusDays(6);

        Map<LocalDate, DailySummary> summaryMap = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, from, today)
                .stream()
                .collect(Collectors.toMap(DailySummary::getSummaryDate, ds -> ds));

        List<DailyHoursDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            DailySummary ds = summaryMap.get(date);
            result.add(DailyHoursDTO.builder()
                    .date(date)
                    .focusedMinutes(ds != null ? ds.getFocusedMinutes() : 0)
                    .sessionsCount(ds != null ? ds.getSessionsCount() : 0)
                    .build());
        }
        return result;
    }

    // ── Gráfico de barras — últimas 4 semanas ────────────────────

    @Transactional(readOnly = true)
    public List<WeeklyHoursDTO> getLast4Weeks(Long userId) {
        LocalDate today     = today();
        LocalDate from      = today.minusWeeks(4).with(DayOfWeek.MONDAY);

        List<DailySummary> summaries = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, from, today);

        List<WeeklyHoursDTO> result = new ArrayList<>();
        for (int w = 3; w >= 0; w--) {
            LocalDate weekStart = today.minusWeeks(w).with(DayOfWeek.MONDAY);
            LocalDate weekEnd   = weekStart.plusDays(6);

            int totalMinutes = summaries.stream()
                    .filter(ds -> !ds.getSummaryDate().isBefore(weekStart)
                            && !ds.getSummaryDate().isAfter(weekEnd))
                    .mapToInt(DailySummary::getFocusedMinutes)
                    .sum();

            int totalSessions = summaries.stream()
                    .filter(ds -> !ds.getSummaryDate().isBefore(weekStart)
                            && !ds.getSummaryDate().isAfter(weekEnd))
                    .mapToInt(DailySummary::getSessionsCount)
                    .sum();

            result.add(WeeklyHoursDTO.builder()
                    .weekStart(weekStart)
                    .weekEnd(weekEnd)
                    .totalFocusedMinutes(totalMinutes)
                    .totalSessions(totalSessions)
                    .build());
        }
        return result;
    }

    // ── Heatmap mensual ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<HeatmapEntryDTO> getMonthlyHeatmap(Long userId, int year, int month) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd   = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        Map<LocalDate, DailySummary> summaryMap = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        userId, monthStart, monthEnd)
                .stream()
                .collect(Collectors.toMap(DailySummary::getSummaryDate, ds -> ds));

        // Calcular intensidad máxima del mes para normalizar 0-4
        int maxMinutes = summaryMap.values().stream()
                .mapToInt(DailySummary::getFocusedMinutes)
                .max()
                .orElse(1);

        List<HeatmapEntryDTO> result = new ArrayList<>();
        for (LocalDate date = monthStart; !date.isAfter(monthEnd); date = date.plusDays(1)) {
            DailySummary ds = summaryMap.get(date);
            int minutes = ds != null ? ds.getFocusedMinutes() : 0;
            int intensity = minutes == 0 ? 0
                    : Math.min(4, (int) Math.ceil((minutes / (double) maxMinutes) * 4));

            result.add(HeatmapEntryDTO.builder()
                    .date(date)
                    .focusedMinutes(minutes)
                    .intensity(intensity)
                    .build());
        }
        return result;
    }

    // ── Registrar sesión completada (llamado desde pomodoro-service) ──

    @Transactional
    public void recordSession(Long userId, LocalDate date, int focusedSeconds, int cycles) {
        DailySummary summary = dailySummaryRepository
                .findByUserIdAndSummaryDate(userId, date)
                .orElse(DailySummary.builder()
                        .userId(userId)
                        .summaryDate(date)
                        .build());

        summary.addFocusedSeconds(focusedSeconds);
        summary.setSessionsCount(summary.getSessionsCount() + 1);
        summary.setCyclesCount(summary.getCyclesCount() + cycles);
        dailySummaryRepository.save(summary);

        // Actualizar streak
        Streak streak = streakRepository.findByUserId(userId)
                .orElse(Streak.builder().userId(userId).build());
        streak.recalculate(date);
        streakRepository.save(streak);
    }
}