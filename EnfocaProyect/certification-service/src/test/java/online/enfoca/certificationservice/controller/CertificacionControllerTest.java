package online.enfoca.certificationservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.certificationservice.dominio.Certificado;
import online.enfoca.certificationservice.dto.*;
import online.enfoca.certificationservice.enums.EstadoExamen;
import online.enfoca.certificationservice.servicio.ServicioCertificacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CertificacionControllerTest {

    @Mock
    private ServicioCertificacion servicio;

    @InjectMocks
    private CertificacionController controller;

    private MockMvc mockMvc;
    private ObjectMapper mapper;

    private static final String USUARIO_ID  = "user-123";
    private static final UUID   PLAN_ID     = UUID.randomUUID();
    private static final String PLAN_TITULO = "Python Basico";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        mapper  = new ObjectMapper();
    }

    // ── POST /certificacion/examenes/iniciar ──────────────────────────

    @Test
    void iniciar_solicitudValida_retorna201() throws Exception {
        IniciarExamenRequest request = new IniciarExamenRequest(
                PLAN_ID, PLAN_TITULO, Collections.emptyList());

        ExamenResponse response = new ExamenResponse(
                UUID.randomUUID(), PLAN_TITULO, 1, EstadoExamen.EN_CURSO,
                Collections.emptyList());

        when(servicio.iniciarExamen(eq(USUARIO_ID), any(IniciarExamenRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/certificacion/examenes/iniciar")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.intento").value(1))
                .andExpect(jsonPath("$.estado").value("EN_CURSO"));
    }

    @Test
    void iniciar_certificadoYaExiste_propaga409() throws Exception {
        IniciarExamenRequest request = new IniciarExamenRequest(
                PLAN_ID, PLAN_TITULO, Collections.emptyList());

        when(servicio.iniciarExamen(eq(USUARIO_ID), any()))
                .thenThrow(new IllegalStateException("Ya obtuviste el certificado"));

        mockMvc.perform(post("/certificacion/examenes/iniciar")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ya obtuviste el certificado"));
    }

    // ── POST /certificacion/examenes/{id}/responder ───────────────────

    @Test
    void responder_solicitudValida_retorna200() throws Exception {
        UUID examenId = UUID.randomUUID();
        Map<UUID, Integer> respuestas = Map.of(UUID.randomUUID(), 0, UUID.randomUUID(), 1);
        ResponderExamenRequest request = new ResponderExamenRequest(respuestas);

        ResultadoExamenResponse resultado = new ResultadoExamenResponse(
                examenId, EstadoExamen.APROBADO, 8, 10,
                true, 0, Collections.emptyList(),
                UUID.randomUUID(), UUID.randomUUID());

        when(servicio.responderExamen(eq(examenId), eq(USUARIO_ID), any()))
                .thenReturn(resultado);

        mockMvc.perform(post("/certificacion/examenes/" + examenId + "/responder")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aprobado").value(true))
                .andExpect(jsonPath("$.puntaje").value(8));
    }

    @Test
    void responder_examenReprobado_retorna200ConTemas() throws Exception {
        UUID examenId = UUID.randomUUID();
        ResponderExamenRequest request = new ResponderExamenRequest(Map.of());

        ResultadoExamenResponse resultado = new ResultadoExamenResponse(
                examenId, EstadoExamen.REPROBADO, 5, 10,
                false, 1,
                List.of("Funciones", "Clases"),
                null, null);

        when(servicio.responderExamen(eq(examenId), eq(USUARIO_ID), any()))
                .thenReturn(resultado);

        mockMvc.perform(post("/certificacion/examenes/" + examenId + "/responder")
                        .header("X-User-Id", USUARIO_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aprobado").value(false))
                .andExpect(jsonPath("$.intentosRestantes").value(1))
                .andExpect(jsonPath("$.temasARepasar[0]").value("Funciones"));
    }

    // ── GET /certificacion/certificados ───────────────────────────────

    @Test
    void listar_conCertificados_retornaLista() throws Exception {
        Certificado cert = Certificado.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .puntaje(9)
                .codigoVerificacion(UUID.randomUUID())
                .build();

        when(servicio.listarCertificados(USUARIO_ID)).thenReturn(List.of(cert));

        mockMvc.perform(get("/certificacion/certificados")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].planTitulo").value(PLAN_TITULO))
                .andExpect(jsonPath("$[0].puntaje").value(9));
    }

    @Test
    void listar_sinCertificados_retornaListaVacia() throws Exception {
        when(servicio.listarCertificados(USUARIO_ID)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/certificacion/certificados")
                        .header("X-User-Id", USUARIO_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ── GET /certificacion/verificar/{codigo} ─────────────────────────

    @Test
    void verificar_codigoValido_retorna200ConCertificado() throws Exception {
        UUID codigo = UUID.randomUUID();
        Certificado cert = Certificado.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .puntaje(10)
                .codigoVerificacion(codigo)
                .build();

        when(servicio.verificar(codigo)).thenReturn(Optional.of(cert));

        mockMvc.perform(get("/certificacion/verificar/" + codigo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planTitulo").value(PLAN_TITULO));
    }

    @Test
    void verificar_codigoInvalido_retorna404() throws Exception {
        UUID codigo = UUID.randomUUID();
        when(servicio.verificar(codigo)).thenReturn(Optional.empty());

        mockMvc.perform(get("/certificacion/verificar/" + codigo))
                .andExpect(status().isNotFound());
    }
}
