package online.enfoca.metricsservice.controller;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import online.enfoca.metricsservice.dto.*;
import online.enfoca.metricsservice.service.AiInsightService;
import online.enfoca.metricsservice.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@Validated
public class MetricsController {

    private final MetricsService metricsService;
    private final AiInsightService aiInsightService;

    // ── KPIs principales ─────────────────────────────────────────

    @GetMapping("/summary")
    public ResponseEntity<MetricsSummaryDTO> getSummary(
            @AuthenticationPrincipal UserDetails user) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(metricsService.getSummary(userId));
    }

    // ── Gráfico línea — últimos 7 días ───────────────────────────

    @GetMapping("/daily")
    public ResponseEntity<List<DailyHoursDTO>> getLast7Days(
            @AuthenticationPrincipal UserDetails user) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(metricsService.getLast7Days(userId));
    }

    // ── Gráfico barras — últimas 4 semanas ───────────────────────

    @GetMapping("/weekly")
    public ResponseEntity<List<WeeklyHoursDTO>> getLast4Weeks(
            @AuthenticationPrincipal UserDetails user) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(metricsService.getLast4Weeks(userId));
    }

    // ── Heatmap mensual ──────────────────────────────────────────

    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapEntryDTO>> getMonthlyHeatmap(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}")
            @Min(2024) int year,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}")
            @Min(1) @Max(12) int month) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(metricsService.getMonthlyHeatmap(userId, year, month));
    }

    // ── AI Insight semanal ───────────────────────────────────────

    @GetMapping("/insight")
    public ResponseEntity<AiInsightDTO> getCurrentInsight(
            @AuthenticationPrincipal UserDetails user) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(aiInsightService.getCurrentWeekInsight(userId));
    }

    @GetMapping("/insight/latest")
    public ResponseEntity<AiInsightDTO> getLatestInsight(
            @AuthenticationPrincipal UserDetails user) {
        Long userId = extractUserId(user);
        return ResponseEntity.ok(aiInsightService.getLatestInsight(userId));
    }

    // ── Registrar sesión (interno — llamado por pomodoro-service) ─

    @PostMapping("/session")
    public ResponseEntity<Void> recordSession(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam int focusedSeconds,
            @RequestParam int cycles) {
        Long userId = extractUserId(user);
        metricsService.recordSession(userId, LocalDate.now(), focusedSeconds, cycles);
        return ResponseEntity.ok().build();
    }

    // ── Helper ───────────────────────────────────────────────────

    private Long extractUserId(UserDetails user) {
        // El username viene del JWT como el userId en string
        return Long.parseLong(user.getUsername());
    }
}