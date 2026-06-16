package online.enfoca.metricsservice.controller;

import online.enfoca.metricsservice.dto.*;
import online.enfoca.metricsservice.service.AiInsightService;
import online.enfoca.metricsservice.service.MetricsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests del controlador llamando los metodos directamente con UserDetails mock,
 * para evitar la complejidad de Spring Security en standaloneSetup.
 */
@ExtendWith(MockitoExtension.class)
class MetricsControllerTest {

    @Mock
    private MetricsService metricsService;

    @Mock
    private AiInsightService aiInsightService;

    @InjectMocks
    private MetricsController metricsController;

    // UserDetails con username = "42" (representa el userId)
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        userDetails = User.withUsername("42")
                .password("n/a")
                .roles("USER")
                .build();
    }

    // ── getSummary ────────────────────────────────────────────────────

    @Test
    void getSummary_retornaOkConDTO() {
        MetricsSummaryDTO dto = MetricsSummaryDTO.builder()
                .focusedMinutesToday(30)
                .focusedMinutesWeek(150)
                .currentStreak(5)
                .build();
        when(metricsService.getSummary(42L)).thenReturn(dto);

        var response = metricsController.getSummary(userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCurrentStreak()).isEqualTo(5);
        verify(metricsService).getSummary(42L);
    }

    // ── getLast7Days ─────────────────────────────────────────────────

    @Test
    void getLast7Days_retornaListaDeDias() {
        List<DailyHoursDTO> dias = List.of(
                DailyHoursDTO.builder().date(LocalDate.now()).focusedMinutes(60).build()
        );
        when(metricsService.getLast7Days(42L)).thenReturn(dias);

        var response = metricsController.getLast7Days(userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
    }

    // ── getLast4Weeks ────────────────────────────────────────────────

    @Test
    void getLast4Weeks_retornaListaDeSemanas() {
        List<WeeklyHoursDTO> semanas = List.of(
                WeeklyHoursDTO.builder().totalFocusedMinutes(240).build()
        );
        when(metricsService.getLast4Weeks(42L)).thenReturn(semanas);

        var response = metricsController.getLast4Weeks(userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getTotalFocusedMinutes()).isEqualTo(240);
    }

    // ── getMonthlyHeatmap ─────────────────────────────────────────────

    @Test
    void getMonthlyHeatmap_conParametros_usaParametros() {
        List<HeatmapEntryDTO> heatmap = Collections.emptyList();
        when(metricsService.getMonthlyHeatmap(42L, 2026, 3)).thenReturn(heatmap);

        var response = metricsController.getMonthlyHeatmap(userDetails, 2026, 3);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(metricsService).getMonthlyHeatmap(42L, 2026, 3);
    }

    @Test
    void getMonthlyHeatmap_sinParametros_usaMesActual() {
        LocalDate hoy = LocalDate.now();
        List<HeatmapEntryDTO> heatmap = Collections.emptyList();
        when(metricsService.getMonthlyHeatmap(42L, hoy.getYear(), hoy.getMonthValue()))
                .thenReturn(heatmap);

        // Sin parametros: year y month son null, el controller usa la fecha actual
        var response = metricsController.getMonthlyHeatmap(userDetails, null, null);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(metricsService).getMonthlyHeatmap(42L, hoy.getYear(), hoy.getMonthValue());
    }

    // ── getCurrentInsight ─────────────────────────────────────────────

    @Test
    void getCurrentInsight_retornaDTO() {
        AiInsightDTO dto = AiInsightDTO.builder()
                .summary("Buen rendimiento")
                .recommendation("Mantén el ritmo")
                .generatedAt(OffsetDateTime.now())
                .build();
        when(aiInsightService.getCurrentWeekInsight(42L)).thenReturn(dto);

        var response = metricsController.getCurrentInsight(userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getSummary()).isEqualTo("Buen rendimiento");
    }

    // ── getLatestInsight ─────────────────────────────────────────────

    @Test
    void getLatestInsight_retornaDTO() {
        AiInsightDTO dto = AiInsightDTO.builder()
                .summary("Insight de semana anterior")
                .build();
        when(aiInsightService.getLatestInsight(42L)).thenReturn(dto);

        var response = metricsController.getLatestInsight(userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getSummary()).isEqualTo("Insight de semana anterior");
    }

    // ── recordSession ─────────────────────────────────────────────────

    @Test
    void recordSession_delegaAlServicioYRetornaOk() {
        doNothing().when(metricsService).recordSession(eq(42L), any(), eq(1800), eq(3));

        var response = metricsController.recordSession(userDetails, 1800, 3);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(metricsService).recordSession(eq(42L), any(LocalDate.class), eq(1800), eq(3));
    }

    @Test
    void recordSession_conCeroSegundos_delegaIgual() {
        doNothing().when(metricsService).recordSession(eq(42L), any(), eq(0), eq(0));

        var response = metricsController.recordSession(userDetails, 0, 0);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }
}
