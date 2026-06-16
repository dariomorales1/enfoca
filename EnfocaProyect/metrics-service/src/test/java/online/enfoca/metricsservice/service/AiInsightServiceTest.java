package online.enfoca.metricsservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.metricsservice.dto.AiInsightDTO;
import online.enfoca.metricsservice.entity.AiInsight;
import online.enfoca.metricsservice.entity.DailySummary;
import online.enfoca.metricsservice.entity.Streak;
import online.enfoca.metricsservice.ia.ClienteGroqInsight;
import online.enfoca.metricsservice.repository.AiInsightRepository;
import online.enfoca.metricsservice.repository.DailySummaryRepository;
import online.enfoca.metricsservice.repository.StreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiInsightServiceTest {

    @Mock
    private AiInsightRepository aiInsightRepository;

    @Mock
    private DailySummaryRepository dailySummaryRepository;

    @Mock
    private StreakRepository streakRepository;

    @Mock
    private ClienteGroqInsight groq;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiInsightService aiInsightService;

    private static final Long USER_ID = 42L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiInsightService, "timezone", "America/Santiago");
    }

    // ── getCurrentWeekInsight ─────────────────────────────────────────

    @Test
    void getCurrentWeekInsight_insightExistente_retornaDesdeRepo() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        AiInsight insight = AiInsight.builder()
                .id(1L)
                .userId(USER_ID)
                .weekStart(weekStart)
                .summary("Resumen de prueba")
                .bestDay("Lunes")
                .recommendation("Sigue estudiando")
                .generatedAt(OffsetDateTime.now())
                .build();

        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.of(insight));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        assertThat(result).isNotNull();
        assertThat(result.getSummary()).isEqualTo("Resumen de prueba");
        assertThat(result.getBestDay()).isEqualTo("Lunes");
        assertThat(result.getRecommendation()).isEqualTo("Sigue estudiando");
        // No debe llamar al LLM si ya existe el insight
        verifyNoInteractions(groq);
    }

    @Test
    void getCurrentWeekInsight_sinInsight_llmFalla_usaFallback() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        // No existe insight en la base de datos
        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.empty());

        // Sin datos de resumen semanal
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(USER_ID), any(), any()))
                .thenReturn(Collections.emptyList());
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        // El LLM falla con excepcion
        when(groq.llamar(anyString(), anyString()))
                .thenThrow(new RuntimeException("Groq no disponible"));

        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        assertThat(result).isNotNull();
        // Debe usar el texto fallback para semana sin sesiones
        assertThat(result.getSummary()).contains("Sin sesiones");
        assertThat(result.getRecommendation()).contains("25 minutos");
        // Debe guardar el insight generado con fallback
        verify(aiInsightRepository).save(any(AiInsight.class));
    }

    @Test
    void getCurrentWeekInsight_sinInsight_llmFalla_conDatos_usaFallbackConMinutos() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.empty());

        // Usuario con 3 sesiones esta semana
        List<DailySummary> summaries = List.of(
                DailySummary.builder()
                        .summaryDate(weekStart)
                        .focusedMinutes(60)
                        .sessionsCount(2)
                        .build(),
                DailySummary.builder()
                        .summaryDate(weekStart.plusDays(1))
                        .focusedMinutes(30)
                        .sessionsCount(1)
                        .build()
        );
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        Streak streak = Streak.builder().userId(USER_ID).currentStreak(2).build();
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(streak));

        // LLM falla
        when(groq.llamar(anyString(), anyString()))
                .thenThrow(new RuntimeException("timeout"));

        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        assertThat(result).isNotNull();
        // Con 2 dias activos y 90 minutos: cae en recomendacion "Incrementa tu consistencia"
        assertThat(result.getRecommendation()).contains("consistencia");
        // El mejor dia debe ser Lunes (el de mayor minutos)
        assertThat(result.getBestDay()).isEqualTo("Lunes");
    }

    @Test
    void getCurrentWeekInsight_sinInsight_llmFalla_masde2Dias_masde120Min_fallbackExcelente() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.empty());

        // 5 dias activos con mas de 120 minutos en total
        List<DailySummary> summaries = List.of(
                DailySummary.builder().summaryDate(weekStart).focusedMinutes(40).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(1)).focusedMinutes(35).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(2)).focusedMinutes(30).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(3)).focusedMinutes(20).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(4)).focusedMinutes(25).sessionsCount(1).build()
        );
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("error"));
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        // 150 minutos totales, 5 dias activos: cae en rama "Excelente consistencia"
        assertThat(result.getRecommendation()).contains("Excelente consistencia");
    }

    @Test
    void getCurrentWeekInsight_sinInsight_llmFalla_entre3y4Dias_120MinExactos_fallbackBuenInicio() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.empty());

        // 4 dias activos con exactamente 100 minutos (< 120)
        List<DailySummary> summaries = List.of(
                DailySummary.builder().summaryDate(weekStart).focusedMinutes(25).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(1)).focusedMinutes(25).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(2)).focusedMinutes(25).sessionsCount(1).build(),
                DailySummary.builder().summaryDate(weekStart.plusDays(3)).focusedMinutes(25).sessionsCount(1).build()
        );
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(USER_ID), any(), any()))
                .thenReturn(summaries);

        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("error"));
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        // 100 minutos totales y 4 dias activos (> 2): cae en "Buen inicio"
        assertThat(result.getRecommendation()).contains("Buen inicio");
    }

    // ── getLatestInsight ─────────────────────────────────────────────

    @Test
    void getLatestInsight_conInsight_retornaDTO() {
        AiInsight insight = AiInsight.builder()
                .id(5L)
                .userId(USER_ID)
                .weekStart(LocalDate.now().minusWeeks(1).with(DayOfWeek.MONDAY))
                .summary("Resumen de la semana pasada")
                .bestDay("Miércoles")
                .recommendation("Recomendacion")
                .generatedAt(OffsetDateTime.now().minusDays(3))
                .build();

        when(aiInsightRepository.findTopByUserIdOrderByWeekStartDesc(USER_ID))
                .thenReturn(Optional.of(insight));

        AiInsightDTO result = aiInsightService.getLatestInsight(USER_ID);

        assertThat(result.getSummary()).isEqualTo("Resumen de la semana pasada");
        assertThat(result.getBestDay()).isEqualTo("Miércoles");
    }

    @Test
    void getLatestInsight_sinInsight_retornaVacio() {
        when(aiInsightRepository.findTopByUserIdOrderByWeekStartDesc(USER_ID))
                .thenReturn(Optional.empty());

        AiInsightDTO result = aiInsightService.getLatestInsight(USER_ID);

        assertThat(result).isNotNull();
        assertThat(result.getSummary()).contains("no hay datos");
        assertThat(result.getRecommendation()).contains("primera sesión");
        assertThat(result.getWeekStart()).isNull();
    }

    // ── getCurrentWeekInsight con LLM exitoso ────────────────────────

    @Test
    void getCurrentWeekInsight_sinInsight_llmExitoso_retornaDatosLlm() throws Exception {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        when(aiInsightRepository.findByUserIdAndWeekStart(USER_ID, weekStart))
                .thenReturn(Optional.empty());

        List<DailySummary> summaries = List.of(
                DailySummary.builder()
                        .summaryDate(weekStart.plusDays(1))
                        .focusedMinutes(90)
                        .sessionsCount(3)
                        .build()
        );
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(USER_ID), any(), any()))
                .thenReturn(summaries);
        when(streakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString()))
                .thenReturn("{\"resumen\":\"Buen trabajo\",\"recomendacion\":\"Continúa\",\"diaMasProductivo\":\"Martes\"}");

        ObjectMapper realMapper = new ObjectMapper();
        JsonNode nodo = realMapper.readTree(
                "{\"resumen\":\"Buen trabajo\",\"recomendacion\":\"Continúa\",\"diaMasProductivo\":\"Martes\"}");
        when(objectMapper.readTree(anyString())).thenReturn(nodo);
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiInsightDTO result = aiInsightService.getCurrentWeekInsight(USER_ID);

        assertThat(result.getSummary()).isEqualTo("Buen trabajo");
        assertThat(result.getRecommendation()).isEqualTo("Continúa");
        assertThat(result.getBestDay()).isEqualTo("Martes");
    }

    // ── generarInsightsSemanales ──────────────────────────────────────

    @Test
    void generarInsightsSemanales_sinUsuarios_noInteractuaConRepo() {
        when(dailySummaryRepository.findActiveUserIdsBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        aiInsightService.generarInsightsSemanales();

        verify(aiInsightRepository, never()).save(any());
    }

    @Test
    void generarInsightsSemanales_conUsuarios_generaInsightParaCada() {
        when(dailySummaryRepository.findActiveUserIdsBetween(any(), any()))
                .thenReturn(List.of(1L, 2L));
        when(aiInsightRepository.findByUserIdAndWeekStart(anyLong(), any()))
                .thenReturn(Optional.empty());
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(streakRepository.findByUserId(anyLong())).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("Groq no disponible"));
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        aiInsightService.generarInsightsSemanales();

        verify(aiInsightRepository, times(2)).save(any(AiInsight.class));
    }

    @Test
    void generarInsightsSemanales_insightExistente_eliminaAntesDeRegenerar() {
        AiInsight existente = AiInsight.builder().id(99L).userId(1L).build();
        when(dailySummaryRepository.findActiveUserIdsBetween(any(), any()))
                .thenReturn(List.of(1L));
        when(aiInsightRepository.findByUserIdAndWeekStart(eq(1L), any()))
                .thenReturn(Optional.of(existente));
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(streakRepository.findByUserId(anyLong())).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("error"));
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        aiInsightService.generarInsightsSemanales();

        verify(aiInsightRepository).delete(existente);
        verify(aiInsightRepository).save(any(AiInsight.class));
    }

    @Test
    void generarInsightsSemanales_errorEnUnUsuario_continuaConSiguiente() {
        when(dailySummaryRepository.findActiveUserIdsBetween(any(), any()))
                .thenReturn(List.of(1L, 2L));
        when(aiInsightRepository.findByUserIdAndWeekStart(anyLong(), any()))
                .thenReturn(Optional.empty());
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(1L), any(), any()))
                .thenThrow(new RuntimeException("fallo repositorio"));
        when(dailySummaryRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                eq(2L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(streakRepository.findByUserId(eq(2L))).thenReturn(Optional.empty());
        when(groq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("error"));
        when(aiInsightRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatCode(() -> aiInsightService.generarInsightsSemanales()).doesNotThrowAnyException();
        verify(aiInsightRepository, times(1)).save(any(AiInsight.class));
    }
}
