package online.enfoca.aiservice.servicio;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.dominio.*;
import online.enfoca.aiservice.dto.*;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.enums.NivelPlan;
import online.enfoca.aiservice.ia.ServicioIa;
import online.enfoca.aiservice.ia.prompt.ConstructorPrompt;
import online.enfoca.aiservice.repositorio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicioPlanEstudioTest {

    @Mock PlanEstudioRepositorio planRepositorio;
    @Mock ModuloRepositorio moduloRepositorio;
    @Mock TemaRepositorio temaRepositorio;
    @Mock ValidacionRepositorio validacionRepositorio;
    @Mock ProgramacionRepositorio programacionRepositorio;
    @Mock FeedbackRepositorio feedbackRepositorio;
    @Mock ServicioIa servicioIa;
    @Mock ConstructorPrompt constructorPrompt;

    private ServicioPlanEstudio servicio;

    private static final String USUARIO_ID = "user-1";
    private static final String JSON_PLAN = """
            {"modulos":[{"orden":1,"titulo":"Módulo 1","temas":[{"orden":1,"titulo":"Tema 1","pomodoros_estimados":3}]}]}
            """;

    @BeforeEach
    void setUp() {
        servicio = new ServicioPlanEstudio(
                planRepositorio, moduloRepositorio, temaRepositorio,
                validacionRepositorio, programacionRepositorio, feedbackRepositorio,
                servicioIa, constructorPrompt, new ObjectMapper());
    }

    private PlanEstudio buildPlan(EstadoPlan estado) {
        return PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .titulo("Python avanzado")
                .objetivo("Dominar Python")
                .nivel(NivelPlan.BASICO)
                .estado(estado)
                .build();
    }

    private Modulo buildModuloConTema(PlanEstudio plan, boolean temaCompletado) {
        Modulo modulo = Modulo.builder()
                .id(UUID.randomUUID())
                .plan(plan)
                .orden(1)
                .titulo("Módulo test")
                .build();
        Tema tema = Tema.builder()
                .id(UUID.randomUUID())
                .modulo(modulo)
                .orden(1)
                .titulo("Tema test")
                .completado(temaCompletado)
                .build();
        modulo.setTemas(new ArrayList<>(List.of(tema)));
        return modulo;
    }

    // ── crear ──────────────────────────────────────────────────────────────────

    @Test
    void crear_sinMaestroExistente_generaConIA() {
        CrearPlanRequest request = new CrearPlanRequest("Python avanzado", "2h/día", "Dominar Python", NivelPlan.INTERMEDIO);
        when(planRepositorio.findMaestrosPorKeyword(any())).thenReturn(Collections.emptyList());
        when(constructorPrompt.promptGeneracion(request)).thenReturn(new String[]{"sys", "user"});
        when(servicioIa.generar(eq(USUARIO_ID), anyString(), anyString())).thenReturn(JSON_PLAN);
        when(planRepositorio.countByUsuarioId(USUARIO_ID)).thenReturn(0L);
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(moduloRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlanEstudioResponse result = servicio.crear(USUARIO_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.titulo()).isEqualTo("Python avanzado");
        verify(servicioIa).generar(eq(USUARIO_ID), anyString(), anyString());
    }

    @Test
    void crear_conMaestroRelevante_clonaPlanExistente() {
        PlanEstudio maestro = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("otro-usuario")
                .titulo("Python avanzado")
                .objetivo("Aprender Python")
                .nivel(NivelPlan.INTERMEDIO)
                .estado(EstadoPlan.CONGELADO)
                .build();
        when(planRepositorio.findMaestrosPorKeyword(any())).thenReturn(List.of(maestro));
        when(planRepositorio.findById(maestro.getId())).thenReturn(Optional.of(maestro));
        when(planRepositorio.countByUsuarioId(USUARIO_ID)).thenReturn(2L);
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CrearPlanRequest request = new CrearPlanRequest("Python avanzado", "2h/día", "Aprender", NivelPlan.INTERMEDIO);
        PlanEstudioResponse result = servicio.crear(USUARIO_ID, request);

        assertThat(result).isNotNull();
        verify(servicioIa, never()).generar(anyString(), anyString(), anyString());
    }

    // ── listar ─────────────────────────────────────────────────────────────────

    @Test
    void listarDeUsuario_retornaListaOrdenada() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findByUsuarioIdOrderByCreadoEnDesc(USUARIO_ID)).thenReturn(List.of(plan));

        List<PlanEstudioResponse> result = servicio.listarDeUsuario(USUARIO_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).titulo()).isEqualTo("Python avanzado");
    }

    // ── obtener ────────────────────────────────────────────────────────────────

    @Test
    void obtener_propietario_retornaPlan() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        PlanEstudioResponse result = servicio.obtener(plan.getId(), USUARIO_ID);

        assertThat(result.titulo()).isEqualTo("Python avanzado");
    }

    @Test
    void obtener_planComunidad_retornaPlan() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("comunidad")
                .titulo("Plan comunitario")
                .build();
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        PlanEstudioResponse result = servicio.obtener(plan.getId(), USUARIO_ID);

        assertThat(result.esComunitario()).isTrue();
    }

    @Test
    void obtener_sinAcceso_lanzaSecurityException() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("otro-usuario")
                .titulo("Plan ajeno")
                .build();
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.obtener(plan.getId(), USUARIO_ID))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void obtener_planNoExiste_lanzaNoSuchElement() {
        UUID id = UUID.randomUUID();
        when(planRepositorio.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.obtener(id, USUARIO_ID))
                .isInstanceOf(NoSuchElementException.class);
    }

    // ── eliminar ───────────────────────────────────────────────────────────────

    @Test
    void eliminar_propietario_eliminaPlan() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        servicio.eliminar(plan.getId(), USUARIO_ID);

        verify(planRepositorio).delete(plan);
    }

    @Test
    void eliminar_sinAcceso_lanzaSecurityException() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("otro-usuario")
                .titulo("Plan ajeno")
                .build();
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.eliminar(plan.getId(), USUARIO_ID))
                .isInstanceOf(SecurityException.class);
        verify(planRepositorio, never()).delete(any());
    }

    // ── toggleTema ─────────────────────────────────────────────────────────────

    @Test
    void toggleTema_marcaCompletadoYModuloQuedaListo() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ToggleTemaResponse result = servicio.toggleTema(tema.getId(), USUARIO_ID);

        assertThat(result.tema().completado()).isTrue();
        assertThat(result.moduloCompletado()).isTrue();
    }

    @Test
    void toggleTema_desmarcaCompletado() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, true);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ToggleTemaResponse result = servicio.toggleTema(tema.getId(), USUARIO_ID);

        assertThat(result.tema().completado()).isFalse();
        assertThat(result.moduloCompletado()).isFalse();
    }

    @Test
    void toggleTema_sinAcceso_lanzaSecurityException() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("otro-usuario")
                .titulo("Plan ajeno")
                .build();
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));

        assertThatThrownBy(() -> servicio.toggleTema(tema.getId(), USUARIO_ID))
                .isInstanceOf(SecurityException.class);
    }

    // ── clonar ─────────────────────────────────────────────────────────────────

    @Test
    void clonar_planCongelado_exitoso() {
        PlanEstudio original = buildPlan(EstadoPlan.CONGELADO);
        when(planRepositorio.findById(original.getId())).thenReturn(Optional.of(original));
        when(planRepositorio.countByUsuarioId("user-2")).thenReturn(1L);
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlanEstudioResponse result = servicio.clonar(original.getId(), "user-2");

        assertThat(result).isNotNull();
        assertThat(result.titulo()).isEqualTo("Python avanzado");
    }

    @Test
    void clonar_planNoCongelado_lanzaIllegalState() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.clonar(plan.getId(), "user-2"))
                .isInstanceOf(IllegalStateException.class);
    }

    // ── obtenerCatalogo ────────────────────────────────────────────────────────

    @Test
    void obtenerCatalogo_retornaPlanesCongelados() {
        PlanEstudio plan = buildPlan(EstadoPlan.CONGELADO);
        when(planRepositorio.findByEstadoOrderByCreadoEnDesc(EstadoPlan.CONGELADO)).thenReturn(List.of(plan));

        List<PlanEstudioResponse> result = servicio.obtenerCatalogo();

        assertThat(result).hasSize(1);
    }

    // ── listarEnRevision ───────────────────────────────────────────────────────

    @Test
    void listarEnRevision_retornaPlanes() {
        PlanEstudio plan = buildPlan(EstadoPlan.EN_REVISION);
        when(planRepositorio.findEnRevisionParaUsuario(USUARIO_ID)).thenReturn(List.of(plan));

        List<PlanEstudioResponse> result = servicio.listarEnRevision(USUARIO_ID);

        assertThat(result).hasSize(1);
    }

    // ── agregarValidacion ──────────────────────────────────────────────────────

    @Test
    void agregarValidacion_planEnMejora_lanzaIllegalState() {
        PlanEstudio plan = buildPlan(EstadoPlan.EN_MEJORA);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.agregarValidacion(plan.getId(), "user-2", new ValidacionRequest(5, "ok")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("proceso de mejora");
    }

    @Test
    void agregarValidacion_propietario_lanzaIllegalState() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.agregarValidacion(plan.getId(), USUARIO_ID, new ValidacionRequest(5, "ok")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("propio plan");
    }

    @Test
    void agregarValidacion_yaPorEsteUsuario_lanzaIllegalState() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(validacionRepositorio.existsByPlanIdAndUsuarioId(plan.getId(), "user-2")).thenReturn(true);

        assertThatThrownBy(() -> servicio.agregarValidacion(plan.getId(), "user-2", new ValidacionRequest(5, "ok")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Ya valoraste");
    }

    @Test
    void agregarValidacion_planActivo_transitaAEnRevision() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(validacionRepositorio.existsByPlanIdAndUsuarioId(plan.getId(), "user-2")).thenReturn(false);
        when(validacionRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.agregarValidacion(plan.getId(), "user-2", new ValidacionRequest(5, "excelente"));

        assertThat(plan.getEstado()).isEqualTo(EstadoPlan.EN_REVISION);
        verify(planRepositorio).save(plan);
    }

    @Test
    void agregarValidacion_planCongelado_bajoRatio_descataloga() {
        PlanEstudio plan = buildPlan(EstadoPlan.CONGELADO);
        plan.setTotalValidaciones(19);
        for (int i = 0; i < 3; i++) {
            plan.getValidaciones().add(Validacion.builder().usuarioId("v" + i).puntaje(5).plan(plan).build());
        }
        for (int i = 3; i < 19; i++) {
            plan.getValidaciones().add(Validacion.builder().usuarioId("v" + i).puntaje(2).plan(plan).build());
        }
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(validacionRepositorio.existsByPlanIdAndUsuarioId(plan.getId(), "user-2")).thenReturn(false);
        when(validacionRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.agregarValidacion(plan.getId(), "user-2", new ValidacionRequest(1, "malo"));

        assertThat(plan.getEstado()).isEqualTo(EstadoPlan.EN_REVISION);
    }

    @Test
    void agregarValidacion_conClon_redirigePlanOriginal() {
        PlanEstudio original = buildPlan(EstadoPlan.EN_REVISION);
        UUID originalId = original.getId();

        PlanEstudio clon = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .titulo("Python avanzado")
                .originalPlanId(originalId)
                .estado(EstadoPlan.ACTIVO)
                .build();

        when(planRepositorio.findById(clon.getId())).thenReturn(Optional.of(clon));
        when(planRepositorio.findById(originalId)).thenReturn(Optional.of(original));
        when(validacionRepositorio.existsByPlanIdAndUsuarioId(originalId, "user-2")).thenReturn(false);
        when(validacionRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.agregarValidacion(clon.getId(), "user-2", new ValidacionRequest(5, "ok"));

        verify(validacionRepositorio).existsByPlanIdAndUsuarioId(originalId, "user-2");
    }

    // ── evaluarPlan ────────────────────────────────────────────────────────────

    @Test
    void evaluarPlan_yaCongelado_noHaceNada() {
        PlanEstudio plan = buildPlan(EstadoPlan.CONGELADO);
        plan.setRatioValidaciones(0.95);

        servicio.evaluarPlan(plan);

        verify(planRepositorio, never()).save(any());
    }

    @Test
    void evaluarPlan_ratioSobre90_congela() {
        PlanEstudio plan = buildPlan(EstadoPlan.EN_REVISION);
        plan.setRatioValidaciones(0.95);
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.evaluarPlan(plan);

        assertThat(plan.getEstado()).isEqualTo(EstadoPlan.CONGELADO);
        verify(planRepositorio).save(plan);
    }

    @Test
    void evaluarPlan_ratioBajo89_marcaEnMejora_yRegeneraPlan() {
        PlanEstudio plan = buildPlan(EstadoPlan.EN_REVISION);
        plan.setRatioValidaciones(0.5);
        when(constructorPrompt.promptMejora(any(), anyString())).thenReturn(new String[]{"sys", "user"});
        when(servicioIa.generar(anyString(), anyString(), anyString())).thenReturn(JSON_PLAN);
        doNothing().when(moduloRepositorio).deleteByPlanId(any());
        when(moduloRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.evaluarPlan(plan);

        assertThat(plan.getEstado()).isEqualTo(EstadoPlan.ACTIVO);
    }

    // ── registrarFeedback ──────────────────────────────────────────────────────

    @Test
    void registrarFeedback_sinAcceso_lanzaSecurityException() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> servicio.registrarFeedback(plan.getId(), "user-2", new FeedbackRequest("MUY_BASICO", null)))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void registrarFeedback_duplicado_lanzaIllegalState() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(feedbackRepositorio.existsByPlanMaestroIdAndUsuarioId(plan.getId(), USUARIO_ID)).thenReturn(true);

        assertThatThrownBy(() -> servicio.registrarFeedback(plan.getId(), USUARIO_ID, new FeedbackRequest("MUY_BASICO", null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("feedback");
    }

    @Test
    void registrarFeedback_valido_mejoraElPlan() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(feedbackRepositorio.existsByPlanMaestroIdAndUsuarioId(plan.getId(), USUARIO_ID)).thenReturn(false);
        when(feedbackRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(constructorPrompt.promptMejoraPersonal(anyString(), anyString(), anyString(), any())).thenReturn(new String[]{"sys", "user"});
        when(servicioIa.generar(anyString(), anyString(), anyString())).thenReturn(JSON_PLAN);
        doNothing().when(moduloRepositorio).deleteByPlanId(any());
        when(moduloRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(feedbackRepositorio.countByPlanMaestroId(any())).thenReturn(3L);
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlanEstudioResponse result = servicio.registrarFeedback(plan.getId(), USUARIO_ID, new FeedbackRequest("MUY_BASICO", "Muy fácil"));

        assertThat(result).isNotNull();
        verify(feedbackRepositorio).save(any());
        verify(servicioIa).generar(anyString(), anyString(), anyString());
    }

    // ── generarCuestionario ────────────────────────────────────────────────────

    @Test
    void generarCuestionario_retornaCuestionario() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        when(moduloRepositorio.findById(modulo.getId())).thenReturn(Optional.of(modulo));
        when(constructorPrompt.promptCuestionario(anyString(), anyString())).thenReturn(new String[]{"sys", "user"});
        String jsonCuestionario = """
                {"preguntas":[{"texto":"¿Qué es Python?","opciones":["A","B"],"respuesta_correcta":0,"explicacion":"Un lenguaje"}]}
                """;
        when(servicioIa.generar(anyString(), anyString(), anyString())).thenReturn(jsonCuestionario);

        CuestionarioResponse result = servicio.generarCuestionario(modulo.getId(), USUARIO_ID);

        assertThat(result.preguntas()).hasSize(1);
        assertThat(result.preguntas().get(0).texto()).isEqualTo("¿Qué es Python?");
    }

    @Test
    void generarCuestionario_sinAcceso_lanzaSecurityException() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("otro-usuario")
                .titulo("Plan ajeno")
                .build();
        Modulo modulo = buildModuloConTema(plan, false);
        when(moduloRepositorio.findById(modulo.getId())).thenReturn(Optional.of(modulo));

        assertThatThrownBy(() -> servicio.generarCuestionario(modulo.getId(), USUARIO_ID))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void generarCuestionario_respuestaIAInvalida_lanzaRuntimeException() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        when(moduloRepositorio.findById(modulo.getId())).thenReturn(Optional.of(modulo));
        when(constructorPrompt.promptCuestionario(anyString(), anyString())).thenReturn(new String[]{"sys", "user"});
        when(servicioIa.generar(anyString(), anyString(), anyString())).thenReturn("json-invalido-{{{");

        assertThatThrownBy(() -> servicio.generarCuestionario(modulo.getId(), USUARIO_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("cuestionario");
    }

    @Test
    void registrarFeedback_umbralSuperado_regeneraMaestro() {
        UUID maestroId = UUID.randomUUID();
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        plan.setOriginalPlanId(maestroId);

        PlanEstudio maestro = PlanEstudio.builder()
                .id(maestroId)
                .usuarioId("original-user")
                .titulo("Python avanzado")
                .estado(EstadoPlan.ACTIVO)
                .build();

        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(feedbackRepositorio.existsByPlanMaestroIdAndUsuarioId(maestroId, USUARIO_ID)).thenReturn(false);
        when(feedbackRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(constructorPrompt.promptMejoraPersonal(anyString(), anyString(), anyString(), any())).thenReturn(new String[]{"sys", "user"});
        when(servicioIa.generar(anyString(), anyString(), anyString())).thenReturn(JSON_PLAN);
        doNothing().when(moduloRepositorio).deleteByPlanId(any());
        when(moduloRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        // Umbral superado
        when(feedbackRepositorio.countByPlanMaestroId(maestroId)).thenReturn(12L);
        when(planRepositorio.findById(maestroId)).thenReturn(Optional.of(maestro));
        List<Object[]> filasFeedback = new ArrayList<>();
        filasFeedback.add(new Object[]{"MUY_BASICO", "Muy sencillo"});
        when(feedbackRepositorio.findMotivoYDetalleByPlanMaestroId(maestroId)).thenReturn(filasFeedback);
        when(constructorPrompt.promptMejoraComunitaria(anyString(), anyString())).thenReturn(new String[]{"sys", "user"});
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.registrarFeedback(plan.getId(), USUARIO_ID, new FeedbackRequest("MUY_BASICO", "Fácil"));

        verify(feedbackRepositorio).findMotivoYDetalleByPlanMaestroId(maestroId);
        verify(constructorPrompt).promptMejoraComunitaria(anyString(), anyString());
    }

    @Test
    void agregarValidacion_congelado_ratioOk_noCambiaEstado() {
        PlanEstudio plan = buildPlan(EstadoPlan.CONGELADO);
        plan.setTotalValidaciones(5);
        // 5 validaciones positivas → ratio = 5/6 ≈ 0.83 >= 0.65, total < 20
        for (int i = 0; i < 5; i++) {
            plan.getValidaciones().add(Validacion.builder().usuarioId("v" + i).puntaje(5).plan(plan).build());
        }
        when(planRepositorio.findById(plan.getId())).thenReturn(Optional.of(plan));
        when(validacionRepositorio.existsByPlanIdAndUsuarioId(plan.getId(), "user-2")).thenReturn(false);
        when(validacionRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(planRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.agregarValidacion(plan.getId(), "user-2", new ValidacionRequest(5, "ok"));

        assertThat(plan.getEstado()).isEqualTo(EstadoPlan.CONGELADO);
    }

    // ── programarFechasTema ────────────────────────────────────────────────────

    @Test
    void programarFechasTema_guardaFechas() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProgramarTemaRequest request = new ProgramarTemaRequest(List.of(LocalDate.now(), LocalDate.now().plusDays(1)));
        servicio.programarFechasTema(tema.getId(), USUARIO_ID, request);

        assertThat(tema.getProgramaciones()).hasSize(2);
        verify(temaRepositorio).save(tema);
    }

    // ── obtenerCalendario ──────────────────────────────────────────────────────

    @Test
    void obtenerCalendario_retornaAgrupado() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        LocalDate hoy = LocalDate.now();
        Programacion prog = Programacion.builder().tema(tema).fecha(hoy).build();
        when(programacionRepositorio.findByUsuarioIdAndFechaBetween(USUARIO_ID, hoy, hoy.plusDays(7)))
                .thenReturn(List.of(prog));

        List<ProgramacionCalendarioDTO> result = servicio.obtenerCalendario(USUARIO_ID, hoy, hoy.plusDays(7));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).fecha()).isEqualTo(hoy.toString());
    }

    // ── eliminarProgramacion ───────────────────────────────────────────────────

    @Test
    void eliminarProgramacion_llamaRepositorio() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        LocalDate fecha = LocalDate.now();
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));

        servicio.eliminarProgramacion(tema.getId(), USUARIO_ID, fecha);

        verify(programacionRepositorio).deleteByTemaIdAndFecha(tema.getId(), fecha);
    }

    // ── registrarSesionHoy ─────────────────────────────────────────────────────

    @Test
    void registrarSesionHoy_creaEntradaSiNoExiste() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));
        when(programacionRepositorio.existsByTemaIdAndFecha(eq(tema.getId()), any(LocalDate.class))).thenReturn(false);
        when(programacionRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        servicio.registrarSesionHoy(tema.getId(), USUARIO_ID);

        verify(programacionRepositorio).save(any());
    }

    @Test
    void registrarSesionHoy_noCreaDuplicado() {
        PlanEstudio plan = buildPlan(EstadoPlan.ACTIVO);
        Modulo modulo = buildModuloConTema(plan, false);
        Tema tema = modulo.getTemas().get(0);
        when(temaRepositorio.findById(tema.getId())).thenReturn(Optional.of(tema));
        when(programacionRepositorio.existsByTemaIdAndFecha(eq(tema.getId()), any(LocalDate.class))).thenReturn(true);

        servicio.registrarSesionHoy(tema.getId(), USUARIO_ID);

        verify(programacionRepositorio, never()).save(any());
    }
}
