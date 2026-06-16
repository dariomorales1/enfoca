package online.enfoca.aiservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.config.ManejadorExcepciones;
import online.enfoca.aiservice.dto.*;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.enums.NivelPlan;
import online.enfoca.aiservice.servicio.ServicioPlanEstudio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PlanEstudioControllerTest {

    @Mock
    private ServicioPlanEstudio servicio;

    @InjectMocks
    private PlanEstudioController controller;

    private MockMvc mockMvc;
    private ObjectMapper mapper;

    private static final String USUARIO_ID = "user-1";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ManejadorExcepciones())
                .build();
        mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
    }

    private PlanEstudioResponse buildPlanResponse() {
        return new PlanEstudioResponse(
                UUID.randomUUID(), "Python avanzado", "Objetivo", NivelPlan.BASICO,
                EstadoPlan.ACTIVO, 0.0, 0, null, "#8b5cf6",
                false, false, null, Collections.emptyList(),
                new ProgresoResponse(0, 0, 0));
    }

    @Test
    void crear_retorna201() throws Exception {
        CrearPlanRequest request = new CrearPlanRequest("Python avanzado", "2h/día", "Objetivo", NivelPlan.BASICO);
        when(servicio.crear(eq(USUARIO_ID), any())).thenReturn(buildPlanResponse());

        mockMvc.perform(post("/planes-estudio")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Python avanzado"));
    }

    @Test
    void listar_retorna200() throws Exception {
        when(servicio.listarDeUsuario(USUARIO_ID)).thenReturn(List.of(buildPlanResponse()));

        mockMvc.perform(get("/planes-estudio")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Python avanzado"));
    }

    @Test
    void obtener_retorna200() throws Exception {
        UUID planId = UUID.randomUUID();
        when(servicio.obtener(eq(planId), eq(USUARIO_ID))).thenReturn(buildPlanResponse());

        mockMvc.perform(get("/planes-estudio/" + planId)
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk());
    }

    @Test
    void obtener_noEncontrado_retorna404() throws Exception {
        UUID planId = UUID.randomUUID();
        when(servicio.obtener(eq(planId), eq(USUARIO_ID))).thenThrow(new NoSuchElementException("Plan no encontrado"));

        mockMvc.perform(get("/planes-estudio/" + planId)
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminar_retorna204() throws Exception {
        UUID planId = UUID.randomUUID();
        doNothing().when(servicio).eliminar(eq(planId), eq(USUARIO_ID));

        mockMvc.perform(delete("/planes-estudio/" + planId)
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isNoContent());
    }

    @Test
    void validar_retorna201() throws Exception {
        UUID planId = UUID.randomUUID();
        ValidacionRequest request = new ValidacionRequest(5, "Excelente");
        doNothing().when(servicio).agregarValidacion(eq(planId), eq(USUARIO_ID), any());

        mockMvc.perform(post("/planes-estudio/" + planId + "/validaciones")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void toggleTema_retorna200() throws Exception {
        UUID temaId = UUID.randomUUID();
        ToggleTemaResponse response = new ToggleTemaResponse(
                new TemaResponse(temaId, 1, "Tema test", 3, 0, true, null, null, null),
                false, UUID.randomUUID(), "Módulo test");
        when(servicio.toggleTema(eq(temaId), eq(USUARIO_ID))).thenReturn(response);

        mockMvc.perform(patch("/planes-estudio/temas/" + temaId + "/completado")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tema.completado").value(true));
    }

    @Test
    void generarCuestionario_retorna200() throws Exception {
        UUID moduloId = UUID.randomUUID();
        CuestionarioResponse response = new CuestionarioResponse(moduloId, "Módulo test", Collections.emptyList());
        when(servicio.generarCuestionario(eq(moduloId), eq(USUARIO_ID))).thenReturn(response);

        mockMvc.perform(post("/planes-estudio/modulos/" + moduloId + "/cuestionario")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moduloTitulo").value("Módulo test"));
    }

    @Test
    void catalogo_retorna200() throws Exception {
        when(servicio.obtenerCatalogo()).thenReturn(List.of(buildPlanResponse()));

        mockMvc.perform(get("/planes-estudio/catalogo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void enRevision_retorna200() throws Exception {
        when(servicio.listarEnRevision(USUARIO_ID)).thenReturn(List.of(buildPlanResponse()));

        mockMvc.perform(get("/planes-estudio/en-revision")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk());
    }

    @Test
    void clonar_retorna201() throws Exception {
        UUID planId = UUID.randomUUID();
        when(servicio.clonar(eq(planId), eq(USUARIO_ID))).thenReturn(buildPlanResponse());

        mockMvc.perform(post("/planes-estudio/" + planId + "/clonar")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isCreated());
    }

    @Test
    void feedback_retorna200() throws Exception {
        UUID planId = UUID.randomUUID();
        FeedbackRequest request = new FeedbackRequest("MUY_BASICO", "Demasiado fácil");
        when(servicio.registrarFeedback(eq(planId), eq(USUARIO_ID), any())).thenReturn(buildPlanResponse());

        mockMvc.perform(post("/planes-estudio/" + planId + "/feedback")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void ping_retornaOk() throws Exception {
        mockMvc.perform(get("/planes-estudio/ping"))
                .andExpect(status().isOk());
    }

    @Test
    void programarTema_retorna200() throws Exception {
        UUID temaId = UUID.randomUUID();
        ProgramarTemaRequest request = new ProgramarTemaRequest(List.of(LocalDate.now()));
        doNothing().when(servicio).programarFechasTema(eq(temaId), eq(USUARIO_ID), any());

        mockMvc.perform(post("/planes-estudio/temas/" + temaId + "/programar")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void obtenerCalendario_retorna200() throws Exception {
        LocalDate inicio = LocalDate.now();
        LocalDate fin = inicio.plusDays(7);
        when(servicio.obtenerCalendario(eq(USUARIO_ID), eq(inicio), eq(fin))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/planes-estudio/programacion")
                        .header("X-User-Id", USUARIO_ID)
                        .param("fechaInicio", inicio.toString())
                        .param("fechaFin", fin.toString()))
                .andExpect(status().isOk());
    }

    @Test
    void eliminarProgramacion_retorna204() throws Exception {
        UUID temaId = UUID.randomUUID();
        LocalDate fecha = LocalDate.now();
        doNothing().when(servicio).eliminarProgramacion(eq(temaId), eq(USUARIO_ID), eq(fecha));

        mockMvc.perform(delete("/planes-estudio/temas/" + temaId + "/programacion/" + fecha)
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isNoContent());
    }

    @Test
    void registrarSesionHoy_retorna200() throws Exception {
        UUID temaId = UUID.randomUUID();
        doNothing().when(servicio).registrarSesionHoy(eq(temaId), eq(USUARIO_ID));

        mockMvc.perform(post("/planes-estudio/temas/" + temaId + "/sesion-hoy")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk());
    }
}
