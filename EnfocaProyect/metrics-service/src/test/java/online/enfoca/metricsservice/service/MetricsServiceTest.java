package online.enfoca.metricsservice.service;

import online.enfoca.metricsservice.dto.*;
import online.enfoca.metricsservice.entity.DailySummary;
import online.enfoca.metricsservice.entity.Streak;
import online.enfoca.metricsservice.repository.DailySummaryRepository;
import online.enfoca.metricsservice.repository.StreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MetricsServiceTest {

    @Mock
    private DailySummaryRepository dailySummaryRepository;

    @Mock
    private StreakRepository streakRepository;

    @InjectMocks
    private MetricsService metricsService;

    // ID de usuario utilizado en todos los tests
    private static final Long USER_ID = 42L;

    @BeforeEach
    void setUp() {
        // Inyectar timezone via reflexion porque @Value no se resuelve con MockitoExtension
        ReflectionTestUtils.setField(metricsService, "timezone", "America/Santiago");
    }

    // ── getSummary ────────────────────────────────────────────────────

    @Test
    void getSummary_conDatosCompletos_retornaDTO() {
        // Configurar respuestas del repositorio
        when(dailySummaryRepository.sumFocusedMinutesByUserIdAndDateRange(eq(USER_ID), any(), any()))
                .thenReturn(30, 120, 300);
        when(dailySummaryRepository.sumTotalFocusedMinutesByUserId(USER_ID))
                .thenReturn(1500);

        Streak streak = Streak.builder()
                .userId(USER_ID)
                .currentStreak(5)
                .longestStreak(10)
                .build();
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(streak));

        DailySummary summaryHoy = DailySummary.builder()
                .userId(USER_ID)
                .summaryDate(LocalDate.now())
                .sessionsCount(3)
                .focusedMinutes(30)
                .build();
        when(dailySummaryRepository.findByUserIdAndSummaryDate(eq(USER_ID), any()))
                .thenReturn(Optional.of(summaryHoy));

        // Dias activos para retention rate
        List<DailySummary> diasActivos = List.of(
                DailySummary.builder().focusedMinutes(60).build(),
                DailySummary.builder().focusedMinutes(45).build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(diasActivos);

        MetricsSummaryDTO result = metricsService.getSummary(USER_ID);

        assertThat(result).isNotNull();
        assertThat(result.getCurrentStreak()).isEqualTo(5);
        assertThat(result.getLongestStreak()).isEqualTo(10);
        assertThat(result.getSessionsToday()).isEqualTo(3);
        assertThat(result.getFocusedMinutesTotal()).isEqualTo(1500);
    }

    @Test
    void getSummary_sinStreakNiSesionHoy_retornaCerosDefecto() {
        when(dailySummaryRepository.sumFocusedMinutesByUserIdAndDateRange(eq(USER_ID), any(), any()))
                .thenReturn(0);
        when(dailySummaryRepository.sumTotalFocusedMinutesByUserId(USER_ID))
                .thenReturn(0);
        // Sin streak en base de datos
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        // Sin sesion hoy
        when(dailySummaryRepository.findByUserIdAndSummaryDate(eq(USER_ID), any()))
                .thenReturn(Optional.empty());
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(Collections.emptyList());

        MetricsSummaryDTO result = metricsService.getSummary(USER_ID);

        assertThat(result.getCurrentStreak()).isZero();
        assertThat(result.getLongestStreak()).isZero();
        assertThat(result.getSessionsToday()).isZero();
        assertThat(result.getRetentionRate()).isZero();
    }

    @Test
    void getSummary_conDiasInactivosEnRango_noContaEnRetention() {
        when(dailySummaryRepository.sumFocusedMinutesByUserIdAndDateRange(eq(USER_ID), any(), any()))
                .thenReturn(0);
        when(dailySummaryRepository.sumTotalFocusedMinutesByUserId(USER_ID))
                .thenReturn(0);
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(dailySummaryRepository.findByUserIdAndSummaryDate(eq(USER_ID), any()))
                .thenReturn(Optional.empty());

        // Dia con 0 minutos: no cuenta para retentionRate
        List<DailySummary> diasConCero = List.of(
                DailySummary.builder().focusedMinutes(0).build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(diasConCero);

        MetricsSummaryDTO result = metricsService.getSummary(USER_ID);

        assertThat(result.getRetentionRate()).isZero();
    }

    // ── getLast7Days ─────────────────────────────────────────────────

    @Test
    void getLast7Days_conDatos_retornaListaDe7Dias() {
        LocalDate hoy = LocalDate.now();
        List<DailySummary> summaries = List.of(
                DailySummary.builder()
                        .summaryDate(hoy.minusDays(1))
                        .focusedMinutes(60)
                        .sessionsCount(2)
                        .build(),
                DailySummary.builder()
                        .summaryDate(hoy)
                        .focusedMinutes(90)
                        .sessionsCount(3)
                        .build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        List<DailyHoursDTO> result = metricsService.getLast7Days(USER_ID);

        assertThat(result).hasSize(7);
        // El primer elemento es el dia mas antiguo (hoy - 6)
        assertThat(result.get(0).getFocusedMinutes()).isZero();
        // El ultimo elemento es hoy
        assertThat(result.get(6).getFocusedMinutes()).isEqualTo(90);
        assertThat(result.get(6).getSessionsCount()).isEqualTo(3);
    }

    @Test
    void getLast7Days_sinDatos_retornaListaDe7DiasEnCero() {
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(Collections.emptyList());

        List<DailyHoursDTO> result = metricsService.getLast7Days(USER_ID);

        assertThat(result).hasSize(7);
        assertThat(result).allMatch(dto -> dto.getFocusedMinutes() == 0);
    }

    // ── getLast4Weeks ────────────────────────────────────────────────

    @Test
    void getLast4Weeks_conDatos_retornaListaDe4Semanas() {
        LocalDate hoy = LocalDate.now();
        List<DailySummary> summaries = List.of(
                DailySummary.builder()
                        .summaryDate(hoy.minusDays(3))
                        .focusedMinutes(120)
                        .sessionsCount(4)
                        .build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        List<WeeklyHoursDTO> result = metricsService.getLast4Weeks(USER_ID);

        assertThat(result).hasSize(4);
        // La suma de minutos de todas las semanas debe ser 120
        int total = result.stream().mapToInt(WeeklyHoursDTO::getTotalFocusedMinutes).sum();
        assertThat(total).isEqualTo(120);
    }

    @Test
    void getLast4Weeks_sinDatos_retornaSemanasConCero() {
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(Collections.emptyList());

        List<WeeklyHoursDTO> result = metricsService.getLast4Weeks(USER_ID);

        assertThat(result).hasSize(4);
        assertThat(result).allMatch(dto -> dto.getTotalFocusedMinutes() == 0);
    }

    // ── getMonthlyHeatmap ────────────────────────────────────────────

    @Test
    void getMonthlyHeatmap_eneroConUnDiaActivo_calculaIntensidad() {
        LocalDate enero1 = LocalDate.of(2026, 1, 1);
        List<DailySummary> summaries = List.of(
                DailySummary.builder()
                        .summaryDate(enero1)
                        .focusedMinutes(120)
                        .build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        List<HeatmapEntryDTO> result = metricsService.getMonthlyHeatmap(USER_ID, 2026, 1);

        // Enero tiene 31 dias
        assertThat(result).hasSize(31);
        // El dia con actividad debe tener intensidad 4 (maxima, porque es el unico con minutos)
        HeatmapEntryDTO diaActivo = result.get(0);
        assertThat(diaActivo.getFocusedMinutes()).isEqualTo(120);
        assertThat(diaActivo.getIntensity()).isEqualTo(4);
        // Los demas dias deben tener intensidad 0
        assertThat(result.subList(1, 31)).allMatch(dto -> dto.getIntensity() == 0);
    }

    @Test
    void getMonthlyHeatmap_sinDatos_retornaTodosEnCero() {
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(Collections.emptyList());

        List<HeatmapEntryDTO> result = metricsService.getMonthlyHeatmap(USER_ID, 2026, 2);

        // Febrero 2026 tiene 28 dias
        assertThat(result).hasSize(28);
        assertThat(result).allMatch(dto -> dto.getIntensity() == 0);
    }

    @Test
    void getMonthlyHeatmap_variosNiveles_asignaIntensidadProporcional() {
        LocalDate base = LocalDate.of(2026, 3, 1);
        // Maximo 100 minutos; otro dia con 25 minutos (25%)
        List<DailySummary> summaries = List.of(
                DailySummary.builder().summaryDate(base).focusedMinutes(100).build(),
                DailySummary.builder().summaryDate(base.plusDays(1)).focusedMinutes(25).build()
        );
        when(dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        List<HeatmapEntryDTO> result = metricsService.getMonthlyHeatmap(USER_ID, 2026, 3);

        assertThat(result.get(0).getIntensity()).isEqualTo(4);  // 100% del maximo
        assertThat(result.get(1).getIntensity()).isEqualTo(1);  // 25% del maximo = ceil(1) = 1
    }

    // ── recordSession ────────────────────────────────────────────────

    @Test
    void recordSession_nuevaSesion_guardaSummaryYStreak() {
        LocalDate fecha = LocalDate.of(2026, 6, 10);
        // No existe resumen previo para esta fecha
        when(dailySummaryRepository.findByUserIdAndSummaryDate(USER_ID, fecha))
                .thenReturn(Optional.empty());
        // No existe streak previo
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(dailySummaryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(streakRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        metricsService.recordSession(USER_ID, fecha, 1500, 2);

        // Verificar que se persistio el summary
        verify(dailySummaryRepository).save(argThat(ds ->
                ds.getUserId().equals(USER_ID)
                        && ds.getSummaryDate().equals(fecha)
                        && ds.getFocusedMinutes() == 25   // 1500 / 60 = 25
                        && ds.getSessionsCount() == 1
                        && ds.getCyclesCount() == 2
        ));
        // Verificar que se persistio el streak
        verify(streakRepository).save(argThat(s ->
                s.getUserId().equals(USER_ID)
                        && s.getCurrentStreak() == 1
        ));
    }

    @Test
    void recordSession_sesionExistente_acumulaMinutos() {
        LocalDate fecha = LocalDate.of(2026, 6, 10);
        DailySummary existente = DailySummary.builder()
                .userId(USER_ID)
                .summaryDate(fecha)
                .focusedMinutes(60)
                .sessionsCount(2)
                .cyclesCount(4)
                .build();
        when(dailySummaryRepository.findByUserIdAndSummaryDate(USER_ID, fecha))
                .thenReturn(Optional.of(existente));

        Streak streakExistente = Streak.builder()
                .userId(USER_ID)
                .currentStreak(3)
                .longestStreak(3)
                .lastActiveDate(fecha.minusDays(1))
                .build();
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(streakExistente));
        when(dailySummaryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(streakRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // 3600 segundos = 60 minutos adicionales
        metricsService.recordSession(USER_ID, fecha, 3600, 1);

        verify(dailySummaryRepository).save(argThat(ds ->
                ds.getFocusedMinutes() == 120  // 60 + 60
                        && ds.getSessionsCount() == 3
                        && ds.getCyclesCount() == 5
        ));
        // Dia consecutivo: streak debe incrementar a 4
        verify(streakRepository).save(argThat(s -> s.getCurrentStreak() == 4));
    }

    @Test
    void recordSession_streakRoto_reiniciaEnUno() {
        LocalDate fecha = LocalDate.of(2026, 6, 15);
        when(dailySummaryRepository.findByUserIdAndSummaryDate(USER_ID, fecha))
                .thenReturn(Optional.empty());

        Streak streakRoto = Streak.builder()
                .userId(USER_ID)
                .currentStreak(5)
                .longestStreak(10)
                .lastActiveDate(fecha.minusDays(5)) // brecha de 5 dias
                .build();
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(streakRoto));
        when(dailySummaryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(streakRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        metricsService.recordSession(USER_ID, fecha, 600, 1);

        verify(streakRepository).save(argThat(s ->
                s.getCurrentStreak() == 1
                        && s.getLongestStreak() == 10  // el maximo no cambia
        ));
    }

    @Test
    void recordSession_mismoDiaQueUltimoRegistro_noIncrementaStreak() {
        LocalDate fecha = LocalDate.of(2026, 6, 10);
        when(dailySummaryRepository.findByUserIdAndSummaryDate(USER_ID, fecha))
                .thenReturn(Optional.empty());

        Streak streakHoy = Streak.builder()
                .userId(USER_ID)
                .currentStreak(3)
                .longestStreak(5)
                .lastActiveDate(fecha) // ya se registro hoy
                .build();
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(streakHoy));
        when(dailySummaryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(streakRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        metricsService.recordSession(USER_ID, fecha, 600, 1);

        // La racha no debe cambiar cuando ya se registro el mismo dia
        verify(streakRepository).save(argThat(s -> s.getCurrentStreak() == 3));
    }
}
