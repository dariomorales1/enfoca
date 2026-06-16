package online.enfoca.certificationservice.servicio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.certificationservice.dominio.*;
import online.enfoca.certificationservice.dto.*;
import online.enfoca.certificationservice.enums.EstadoExamen;
import online.enfoca.certificationservice.ia.ClienteGroqCert;
import online.enfoca.certificationservice.repositorio.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ServicioCertificacionTest {

    @Mock
    private PreguntaConocimientoRepositorio preguntaRepo;

    @Mock
    private ExamenRepositorio examenRepo;

    @Mock
    private CertificadoRepositorio certificadoRepo;

    @Mock
    private ClienteGroqCert groq;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ServicioCertificacion servicio;

    // ── Constantes de prueba ─────────────────────────────────────────

    private static final String USUARIO_ID = "user-123";
    private static final UUID   PLAN_ID    = UUID.randomUUID();
    private static final String PLAN_TITULO = "Python Basico";

    // ── Helpers ──────────────────────────────────────────────────────

    /** Construye una solicitud basica de examen */
    private IniciarExamenRequest buildRequest() {
        return new IniciarExamenRequest(PLAN_ID, PLAN_TITULO, Collections.emptyList());
    }

    /** Construye N preguntas de conocimiento con respuesta correcta en indice 0 */
    private List<PreguntaConocimiento> buildPreguntas(int cantidad) {
        List<PreguntaConocimiento> lista = new ArrayList<>();
        for (int i = 0; i < cantidad; i++) {
            lista.add(PreguntaConocimiento.builder()
                    .id(UUID.randomUUID())
                    .planMaestroId(PLAN_ID)
                    .moduloTitulo("Modulo " + i)
                    .texto("Pregunta " + i)
                    .opciones("[\"A\",\"B\",\"C\",\"D\"]")
                    .respuestaCorrecta(0)
                    .build());
        }
        return lista;
    }

    /**
     * Construye un Examen con 10 preguntas, cada PreguntaExamen con su PreguntaConocimiento.
     * Permite configurar las UUIDs de las PreguntaExamen para usar en respuestas.
     */
    private Examen buildExamenConPreguntas(UUID examenId) {
        Examen examen = Examen.builder()
                .id(examenId)
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .estado(EstadoExamen.EN_CURSO)
                .build();

        List<PreguntaExamen> preguntas = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            PreguntaConocimiento pc = PreguntaConocimiento.builder()
                    .id(UUID.randomUUID())
                    .planMaestroId(PLAN_ID)
                    .moduloTitulo("Modulo " + i)
                    .texto("Pregunta " + i)
                    .opciones("[\"A\",\"B\",\"C\",\"D\"]")
                    .respuestaCorrecta(0)
                    .build();

            PreguntaExamen pe = PreguntaExamen.builder()
                    .id(UUID.randomUUID())
                    .examen(examen)
                    .pregunta(pc)
                    .orden(i + 1)
                    .build();
            preguntas.add(pe);
        }
        examen.setPreguntas(preguntas);
        return examen;
    }

    // ── iniciarExamen — casos normales ───────────────────────────────

    @Test
    void iniciarExamen_primerIntento_creaExamenCorrectamente() throws Exception {
        // Sin certificado previo
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        // Sin intentos previos
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(0);
        // Sin examen en curso
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(false);
        // Pool suficiente (>= 25 para no llamar generarPool)
        when(preguntaRepo.countByPlanMaestroId(PLAN_ID)).thenReturn(30L);

        List<PreguntaConocimiento> preguntas = buildPreguntas(10);
        when(preguntaRepo.findDiezAleatorias(PLAN_ID)).thenReturn(preguntas);
        when(preguntaRepo.saveAll(anyList())).thenReturn(preguntas);

        Examen examenGuardado = Examen.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .intento(1)
                .estado(EstadoExamen.EN_CURSO)
                .preguntas(new ArrayList<>())
                .build();

        // Primer save retorna examen sin preguntas, segundo con preguntas
        when(examenRepo.save(any(Examen.class)))
                .thenReturn(examenGuardado)
                .thenAnswer(inv -> {
                    Examen e = inv.getArgument(0);
                    // Asignar IDs a las preguntas del examen para que toExamenResponse funcione
                    e.getPreguntas().forEach(pe -> {
                        if (pe.getId() == null) {
                            // PreguntaExamen no tiene setter de id accesible directamente,
                            // pero @Builder ya lo asigna con UUID al persistir. Para el test
                            // basta con que el objeto no sea null.
                        }
                    });
                    return e;
                });

        when(objectMapper.readValue(anyString(), any(com.fasterxml.jackson.databind.type.CollectionType.class)))
                .thenReturn(List.of("A", "B", "C", "D"));
        when(objectMapper.getTypeFactory())
                .thenReturn(new ObjectMapper().getTypeFactory());

        ExamenResponse response = servicio.iniciarExamen(USUARIO_ID, buildRequest());

        assertThat(response).isNotNull();
        assertThat(response.intento()).isEqualTo(1);
        assertThat(response.estado()).isEqualTo(EstadoExamen.EN_CURSO);
        verify(examenRepo, times(2)).save(any(Examen.class));
        // No debe llamar al Groq si el pool ya tiene 30 preguntas
        verifyNoInteractions(groq);
    }

    @Test
    void iniciarExamen_examenEnCurso_retornaExamenExistente() throws Exception {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(1);
        // Hay examen en curso
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(true);

        Examen enCurso = buildExamenConPreguntas(UUID.randomUUID());
        when(examenRepo.findByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO))
                .thenReturn(Optional.of(enCurso));

        when(objectMapper.readValue(anyString(), any(com.fasterxml.jackson.databind.type.CollectionType.class)))
                .thenReturn(List.of("A", "B", "C", "D"));
        when(objectMapper.getTypeFactory())
                .thenReturn(new ObjectMapper().getTypeFactory());

        ExamenResponse response = servicio.iniciarExamen(USUARIO_ID, buildRequest());

        assertThat(response.id()).isEqualTo(enCurso.getId());
        // No debe crear nuevo examen
        verify(examenRepo, never()).save(any());
    }

    // ── iniciarExamen — casos de error ────────────────────────────────

    @Test
    void iniciarExamen_conCertificadoPrevio_lanzaExcepcion() {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(true);

        assertThatThrownBy(() -> servicio.iniciarExamen(USUARIO_ID, buildRequest()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("certificado");
    }

    @Test
    void iniciarExamen_intentosAgotados_lanzaExcepcion() {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        // 2 intentos usados = maximo (MAX_INTENTOS=2)
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(2);

        assertThatThrownBy(() -> servicio.iniciarExamen(USUARIO_ID, buildRequest()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Agotaste");
    }

    @Test
    void iniciarExamen_poolInsuficiente_lanzaExcepcionSiGroqFalla() {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(0);
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(false);
        // Pool insuficiente (< 25)
        when(preguntaRepo.countByPlanMaestroId(PLAN_ID)).thenReturn(5L);

        // Groq falla al generar preguntas
        when(groq.generarPreguntas(anyString(), anyString()))
                .thenThrow(new RuntimeException("Groq no disponible"));

        assertThatThrownBy(() -> servicio.iniciarExamen(USUARIO_ID, buildRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("banco de preguntas");
    }

    // ── responderExamen — aprobado ────────────────────────────────────

    @Test
    void responderExamen_aprobado_emiteCertificado() {
        UUID examenId = UUID.randomUUID();
        Examen examen = buildExamenConPreguntas(examenId);

        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));
        when(examenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Certificado cert = Certificado.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .puntaje(10)
                .codigoVerificacion(UUID.randomUUID())
                .build();
        when(certificadoRepo.save(any())).thenReturn(cert);

        // Construir respuestas: respuesta 0 (correcta) para las 10 preguntas
        Map<UUID, Integer> respuestas = new HashMap<>();
        examen.getPreguntas().forEach(pe -> respuestas.put(pe.getId(), 0));
        ResponderExamenRequest request = new ResponderExamenRequest(respuestas);

        ResultadoExamenResponse resultado = servicio.responderExamen(examenId, USUARIO_ID, request);

        assertThat(resultado.aprobado()).isTrue();
        assertThat(resultado.puntaje()).isEqualTo(10);
        assertThat(resultado.certificadoId()).isEqualTo(cert.getId());
        assertThat(resultado.codigoVerificacion()).isEqualTo(cert.getCodigoVerificacion());
        assertThat(resultado.temasARepasar()).isEmpty();
        verify(certificadoRepo).save(any(Certificado.class));
    }

    @Test
    void responderExamen_reprobado_noEmiteCertificado() {
        UUID examenId = UUID.randomUUID();
        Examen examen = buildExamenConPreguntas(examenId);

        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));
        when(examenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        // 1 intento usado (el actual que se esta finalizando como REPROBADO)
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID)).thenReturn(1);
        // Temas a repasar
        when(preguntaRepo.findModuloYTemaPorIds(anyList())).thenReturn(Collections.emptyList());

        // Solo 3 correctas (< 7): respuesta 1 incorrecta para las 10 preguntas
        Map<UUID, Integer> respuestas = new HashMap<>();
        List<PreguntaExamen> preguntas = examen.getPreguntas();
        for (int i = 0; i < 10; i++) {
            // Las primeras 3 responden correctamente (indice 0), las otras 7 incorrectamente (indice 1)
            respuestas.put(preguntas.get(i).getId(), i < 3 ? 0 : 1);
        }
        ResponderExamenRequest request = new ResponderExamenRequest(respuestas);

        ResultadoExamenResponse resultado = servicio.responderExamen(examenId, USUARIO_ID, request);

        assertThat(resultado.aprobado()).isFalse();
        assertThat(resultado.puntaje()).isEqualTo(3);
        assertThat(resultado.estado()).isEqualTo(EstadoExamen.REPROBADO);
        assertThat(resultado.intentosRestantes()).isEqualTo(1);
        verifyNoInteractions(certificadoRepo);
    }

    @Test
    void responderExamen_exactamente7Correctas_aprueba() {
        UUID examenId = UUID.randomUUID();
        Examen examen = buildExamenConPreguntas(examenId);

        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));
        when(examenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Certificado cert = Certificado.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .puntaje(7)
                .codigoVerificacion(UUID.randomUUID())
                .build();
        when(certificadoRepo.save(any())).thenReturn(cert);

        // 7 correctas, 3 incorrectas
        Map<UUID, Integer> respuestas = new HashMap<>();
        List<PreguntaExamen> preguntas = examen.getPreguntas();
        for (int i = 0; i < 10; i++) {
            respuestas.put(preguntas.get(i).getId(), i < 7 ? 0 : 1);
        }

        ResultadoExamenResponse resultado = servicio.responderExamen(
                examenId, USUARIO_ID, new ResponderExamenRequest(respuestas));

        assertThat(resultado.aprobado()).isTrue();
        assertThat(resultado.puntaje()).isEqualTo(7);
    }

    // ── responderExamen — casos de error ─────────────────────────────

    @Test
    void responderExamen_examenNoExiste_lanzaExcepcion() {
        UUID examenId = UUID.randomUUID();
        when(examenRepo.findById(examenId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.responderExamen(
                examenId, USUARIO_ID, new ResponderExamenRequest(Map.of())))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("no encontrado");
    }

    @Test
    void responderExamen_usuarioDiferente_lanzaSecurityException() {
        UUID examenId = UUID.randomUUID();
        Examen examen = Examen.builder()
                .id(examenId)
                .usuarioId("otro-usuario")
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .estado(EstadoExamen.EN_CURSO)
                .preguntas(new ArrayList<>())
                .build();
        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));

        assertThatThrownBy(() -> servicio.responderExamen(
                examenId, USUARIO_ID, new ResponderExamenRequest(Map.of())))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Acceso no autorizado");
    }

    @Test
    void responderExamen_examenYaFinalizado_lanzaExcepcion() {
        UUID examenId = UUID.randomUUID();
        Examen examen = Examen.builder()
                .id(examenId)
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .estado(EstadoExamen.APROBADO) // ya finalizado
                .preguntas(new ArrayList<>())
                .build();
        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));

        assertThatThrownBy(() -> servicio.responderExamen(
                examenId, USUARIO_ID, new ResponderExamenRequest(Map.of())))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("finalizado");
    }

    // ── responderExamen con temas a repasar ───────────────────────────

    @Test
    void responderExamen_reprobado_retornaTemasARepasar() {
        UUID examenId = UUID.randomUUID();
        Examen examen = buildExamenConPreguntas(examenId);

        when(examenRepo.findById(examenId)).thenReturn(Optional.of(examen));
        when(examenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID)).thenReturn(1);

        // Temas a repasar para las preguntas incorrectas
        Object[] tema1 = {"Modulo A", "Tema X"};
        Object[] tema2 = {"Modulo B", null};  // null temaTitulo: usa moduloTitulo
        when(preguntaRepo.findModuloYTemaPorIds(anyList()))
                .thenReturn(List.of(tema1, tema2));

        // 0 correctas
        Map<UUID, Integer> respuestas = new HashMap<>();
        examen.getPreguntas().forEach(pe -> respuestas.put(pe.getId(), 1));

        ResultadoExamenResponse resultado = servicio.responderExamen(
                examenId, USUARIO_ID, new ResponderExamenRequest(respuestas));

        assertThat(resultado.aprobado()).isFalse();
        assertThat(resultado.temasARepasar()).contains("Tema X", "Modulo B");
    }

    // ── listarCertificados ────────────────────────────────────────────

    @Test
    void listarCertificados_delegaAlRepositorio() {
        List<Certificado> certs = List.of(
                Certificado.builder()
                        .usuarioId(USUARIO_ID)
                        .planMaestroId(PLAN_ID)
                        .planTitulo(PLAN_TITULO)
                        .puntaje(8)
                        .build()
        );
        when(certificadoRepo.findByUsuarioIdOrderByEmitidoEnDesc(USUARIO_ID))
                .thenReturn(certs);

        List<Certificado> resultado = servicio.listarCertificados(USUARIO_ID);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getPlanTitulo()).isEqualTo(PLAN_TITULO);
        verify(certificadoRepo).findByUsuarioIdOrderByEmitidoEnDesc(USUARIO_ID);
    }

    @Test
    void listarCertificados_sinCertificados_retornaListaVacia() {
        when(certificadoRepo.findByUsuarioIdOrderByEmitidoEnDesc(USUARIO_ID))
                .thenReturn(Collections.emptyList());

        List<Certificado> resultado = servicio.listarCertificados(USUARIO_ID);

        assertThat(resultado).isEmpty();
    }

    // ── verificar ────────────────────────────────────────────────────

    @Test
    void verificar_codigoValido_retornaCertificado() {
        UUID codigo = UUID.randomUUID();
        Certificado cert = Certificado.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .codigoVerificacion(codigo)
                .planTitulo(PLAN_TITULO)
                .build();
        when(certificadoRepo.findByCodigoVerificacion(codigo))
                .thenReturn(Optional.of(cert));

        Optional<Certificado> resultado = servicio.verificar(codigo);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getCodigoVerificacion()).isEqualTo(codigo);
    }

    @Test
    void verificar_codigoInvalido_retornaEmpty() {
        UUID codigo = UUID.randomUUID();
        when(certificadoRepo.findByCodigoVerificacion(codigo))
                .thenReturn(Optional.empty());

        Optional<Certificado> resultado = servicio.verificar(codigo);

        assertThat(resultado).isEmpty();
    }

    // ── iniciarExamen — segundo intento con seleccion inteligente ─────

    @Test
    void iniciarExamen_segundoIntento_usaSeleccionInteligente() throws Exception {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        // 1 intento previo
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(1);
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(false);
        when(preguntaRepo.countByPlanMaestroId(PLAN_ID)).thenReturn(30L);

        // Para el segundo intento: 4 incorrectas + 6 nuevas = 10
        List<PreguntaConocimiento> incorrectas = buildPreguntas(4);
        List<PreguntaConocimiento> nuevas = buildPreguntas(6);
        when(preguntaRepo.findIncorrectasPrevias(USUARIO_ID, PLAN_ID, 4)).thenReturn(incorrectas);
        when(preguntaRepo.findNuevasNoVistas(USUARIO_ID, PLAN_ID, 6)).thenReturn(nuevas);
        when(preguntaRepo.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        Examen examenGuardado = Examen.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .intento(2)
                .estado(EstadoExamen.EN_CURSO)
                .preguntas(new ArrayList<>())
                .build();
        when(examenRepo.save(any())).thenReturn(examenGuardado);

        when(objectMapper.readValue(anyString(), any(com.fasterxml.jackson.databind.type.CollectionType.class)))
                .thenReturn(List.of("A", "B", "C", "D"));
        when(objectMapper.getTypeFactory())
                .thenReturn(new ObjectMapper().getTypeFactory());

        ExamenResponse response = servicio.iniciarExamen(USUARIO_ID, buildRequest());

        assertThat(response).isNotNull();
        // En segundo intento se usan findIncorrectasPrevias y findNuevasNoVistas
        verify(preguntaRepo).findIncorrectasPrevias(USUARIO_ID, PLAN_ID, 4);
        verify(preguntaRepo).findNuevasNoVistas(USUARIO_ID, PLAN_ID, 6);
        // No debe usar findDiezAleatorias para el segundo intento con pool completo
        verify(preguntaRepo, never()).findDiezAleatorias(PLAN_ID);
    }

    @Test
    void iniciarExamen_poolInsuficiente_groqExitoso_creaPoolYFallaAlSeleccionar() throws Exception {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(0);
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(false);
        // Pool insuficiente → llama generarPool
        when(preguntaRepo.countByPlanMaestroId(PLAN_ID)).thenReturn(5L);

        ObjectMapper realMapper = new ObjectMapper();
        JsonNode respGroq = realMapper.readTree("""
                {"preguntas":[
                    {"moduloTitulo":"Módulo 1","temaTitulo":"Tema A","texto":"¿Qué es Python?",
                     "opciones":["A","B","C","D"],"respuestaCorrecta":0,"explicacion":"Python es un lenguaje."}
                ]}
                """);
        when(groq.generarPreguntas(anyString(), anyString())).thenReturn(respGroq);
        when(objectMapper.writeValueAsString(any())).thenReturn("[\"A\",\"B\",\"C\",\"D\"]");
        when(preguntaRepo.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        // Después de generar pool → seleccionarPreguntas devuelve lista vacía → lanza excepción
        when(preguntaRepo.findDiezAleatorias(PLAN_ID)).thenReturn(Collections.emptyList());

        IniciarExamenRequest reqConModulos = new IniciarExamenRequest(
                PLAN_ID, PLAN_TITULO,
                List.of(new IniciarExamenRequest.ModuloDTO("Módulo 1", List.of("Tema A"))));

        assertThatThrownBy(() -> servicio.iniciarExamen(USUARIO_ID, reqConModulos))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insuficiente");

        verify(groq).generarPreguntas(anyString(), anyString());
        verify(preguntaRepo, atLeastOnce()).saveAll(anyList());
    }

    @Test
    void iniciarExamen_segundoIntento_completaConAleatoriasAlFaltarNuevas() throws Exception {
        when(certificadoRepo.existsByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID))
                .thenReturn(false);
        when(examenRepo.countByUsuarioIdAndPlanMaestroId(USUARIO_ID, PLAN_ID)).thenReturn(1);
        when(examenRepo.existsByUsuarioIdAndPlanMaestroIdAndEstado(
                USUARIO_ID, PLAN_ID, EstadoExamen.EN_CURSO)).thenReturn(false);
        when(preguntaRepo.countByPlanMaestroId(PLAN_ID)).thenReturn(30L);

        // Solo 2 incorrectas y 3 nuevas (total = 5, faltan 5 mas)
        List<PreguntaConocimiento> incorrectas = buildPreguntas(2);
        List<PreguntaConocimiento> nuevas = buildPreguntas(3);
        List<PreguntaConocimiento> aleatorias = buildPreguntas(10);

        when(preguntaRepo.findIncorrectasPrevias(USUARIO_ID, PLAN_ID, 4)).thenReturn(incorrectas);
        when(preguntaRepo.findNuevasNoVistas(USUARIO_ID, PLAN_ID, 8)).thenReturn(nuevas);
        when(preguntaRepo.findDiezAleatorias(PLAN_ID)).thenReturn(aleatorias);
        when(preguntaRepo.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        Examen examenGuardado = Examen.builder()
                .id(UUID.randomUUID())
                .usuarioId(USUARIO_ID)
                .planMaestroId(PLAN_ID)
                .planTitulo(PLAN_TITULO)
                .intento(2)
                .estado(EstadoExamen.EN_CURSO)
                .preguntas(new ArrayList<>())
                .build();
        when(examenRepo.save(any())).thenReturn(examenGuardado);

        when(objectMapper.readValue(anyString(), any(com.fasterxml.jackson.databind.type.CollectionType.class)))
                .thenReturn(List.of("A", "B", "C", "D"));
        when(objectMapper.getTypeFactory())
                .thenReturn(new ObjectMapper().getTypeFactory());

        ExamenResponse response = servicio.iniciarExamen(USUARIO_ID, buildRequest());

        assertThat(response).isNotNull();
        // Cuando hay pocas nuevas, se completa con aleatorias
        verify(preguntaRepo).findDiezAleatorias(PLAN_ID);
    }
}
