package online.enfoca.pomodoroservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import online.enfoca.pomodoroservice.dto.StartSessionRequest;
import online.enfoca.pomodoroservice.exception.GlobalExceptionHandler;
import online.enfoca.pomodoroservice.exception.InvalidSessionStateException;
import online.enfoca.pomodoroservice.exception.ResourceNotFoundException;
import online.enfoca.pomodoroservice.model.entity.PomodoroSession;
import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.model.enums.SessionType;
import online.enfoca.pomodoroservice.service.PomodoroService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PomodoroControllerTest {

    @Mock
    private PomodoroService service;

    @InjectMocks
    private PomodoroController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private PomodoroSession sesionBase;

    @BeforeEach
    void setUp() {
        // Se registra el GlobalExceptionHandler para que los handlers de error funcionen en standaloneSetup
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sesionBase = new PomodoroSession();
        sesionBase.setId(1L);
        sesionBase.setUserId("user-123");
        sesionBase.setTopicId(10L);
        sesionBase.setSessionType(SessionType.FOCUS);
        sesionBase.setDurationMinutes(25);
        sesionBase.setStatus(SessionStatus.PREPARING);
    }

    // ---- GET /pomodoro-sessions ----

    @Test
    @DisplayName("GET /pomodoro-sessions retorna 200 con lista de sesiones del usuario")
    void getHistory_retorna200ConLista() throws Exception {
        PomodoroSession sesion2 = new PomodoroSession();
        sesion2.setId(2L);
        sesion2.setUserId("user-123");
        sesion2.setSessionType(SessionType.SHORT_BREAK);
        sesion2.setDurationMinutes(5);
        sesion2.setStatus(SessionStatus.COMPLETED);
        sesion2.setStartTime(LocalDateTime.now().minusMinutes(30));
        sesion2.setEndTime(LocalDateTime.now().minusMinutes(25));

        when(service.getSessionsByUser("user-123")).thenReturn(List.of(sesionBase, sesion2));

        mockMvc.perform(get("/pomodoro-sessions")
                        .header("X-User-Id", "user-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userId").value("user-123"))
                .andExpect(jsonPath("$[0].status").value("PREPARING"));
    }

    @Test
    @DisplayName("GET /pomodoro-sessions retorna 200 con lista vacía")
    void getHistory_listaVacia_retorna200() throws Exception {
        when(service.getSessionsByUser("user-sin-sesiones")).thenReturn(List.of());

        mockMvc.perform(get("/pomodoro-sessions")
                        .header("X-User-Id", "user-sin-sesiones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ---- POST /pomodoro-sessions/start ----

    @Test
    @DisplayName("POST /pomodoro-sessions/start retorna 201 con sesión creada")
    void start_retorna201ConSesionCreada() throws Exception {
        StartSessionRequest request = new StartSessionRequest("user-123", 10L, SessionType.FOCUS, 25);
        when(service.startSession(any(StartSessionRequest.class))).thenReturn(sesionBase);

        mockMvc.perform(post("/pomodoro-sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PREPARING"))
                .andExpect(jsonPath("$.sessionType").value("FOCUS"))
                .andExpect(jsonPath("$.durationMinutes").value(25));
    }

    @Test
    @DisplayName("POST /pomodoro-sessions/start con SHORT_BREAK retorna 201")
    void start_shortBreak_retorna201() throws Exception {
        PomodoroSession sesionBreak = new PomodoroSession();
        sesionBreak.setId(3L);
        sesionBreak.setUserId("user-456");
        sesionBreak.setSessionType(SessionType.SHORT_BREAK);
        sesionBreak.setDurationMinutes(15);
        sesionBreak.setStatus(SessionStatus.PREPARING);

        StartSessionRequest request = new StartSessionRequest("user-456", null, SessionType.SHORT_BREAK, 15);
        when(service.startSession(any(StartSessionRequest.class))).thenReturn(sesionBreak);

        mockMvc.perform(post("/pomodoro-sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionType").value("SHORT_BREAK"))
                .andExpect(jsonPath("$.status").value("PREPARING"));
    }

    // ---- PATCH /pomodoro-sessions/{id}/begin ----

    @Test
    @DisplayName("PATCH /pomodoro-sessions/1/begin retorna 200 con sesión en STARTED")
    void begin_retorna200SesionStarted() throws Exception {
        PomodoroSession sesionStarted = new PomodoroSession();
        sesionStarted.setId(1L);
        sesionStarted.setUserId("user-123");
        sesionStarted.setSessionType(SessionType.FOCUS);
        sesionStarted.setDurationMinutes(25);
        sesionStarted.setStatus(SessionStatus.STARTED);
        sesionStarted.setStartTime(LocalDateTime.now());

        when(service.beginSession(1L)).thenReturn(sesionStarted);

        mockMvc.perform(patch("/pomodoro-sessions/1/begin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("STARTED"));
    }

    @Test
    @DisplayName("PATCH /pomodoro-sessions/999/begin retorna 404 cuando sesión no existe")
    void begin_sesionNoExiste_retorna404() throws Exception {
        when(service.beginSession(999L)).thenThrow(new ResourceNotFoundException("Pomodoro session with id 999 not found"));

        mockMvc.perform(patch("/pomodoro-sessions/999/begin"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PATCH /pomodoro-sessions/2/begin retorna 500 cuando sesión no está en PREPARING")
    void begin_estadoInvalido_retorna500() throws Exception {
        // InvalidSessionStateException no está mapeado en GlobalExceptionHandler como 409;
        // cae en el handler genérico que devuelve 500
        when(service.beginSession(2L)).thenThrow(new InvalidSessionStateException("Session cannot be started because it is not in PREPARING state"));

        mockMvc.perform(patch("/pomodoro-sessions/2/begin"))
                .andExpect(status().isInternalServerError());
    }

    // ---- PATCH /pomodoro-sessions/{id}/finish ----

    @Test
    @DisplayName("PATCH /pomodoro-sessions/2/finish?status=COMPLETED retorna 200")
    void finish_retorna200SesionCompleted() throws Exception {
        PomodoroSession sesionTerminada = new PomodoroSession();
        sesionTerminada.setId(2L);
        sesionTerminada.setUserId("user-123");
        sesionTerminada.setSessionType(SessionType.FOCUS);
        sesionTerminada.setDurationMinutes(25);
        sesionTerminada.setStatus(SessionStatus.COMPLETED);
        sesionTerminada.setStartTime(LocalDateTime.now().minusMinutes(25));
        sesionTerminada.setEndTime(LocalDateTime.now());

        when(service.finishSession(eq(2L), eq(SessionStatus.COMPLETED))).thenReturn(sesionTerminada);

        mockMvc.perform(patch("/pomodoro-sessions/2/finish")
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("PATCH /pomodoro-sessions/2/finish?status=ABORTED retorna 200")
    void finish_statusAborted_retorna200() throws Exception {
        PomodoroSession sesionAbortada = new PomodoroSession();
        sesionAbortada.setId(2L);
        sesionAbortada.setUserId("user-123");
        sesionAbortada.setSessionType(SessionType.FOCUS);
        sesionAbortada.setDurationMinutes(25);
        sesionAbortada.setStatus(SessionStatus.ABORTED);
        sesionAbortada.setEndTime(LocalDateTime.now());

        when(service.finishSession(eq(2L), eq(SessionStatus.ABORTED))).thenReturn(sesionAbortada);

        mockMvc.perform(patch("/pomodoro-sessions/2/finish")
                        .param("status", "ABORTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ABORTED"));
    }

    @Test
    @DisplayName("PATCH /pomodoro-sessions/777/finish retorna 404 cuando sesión no existe")
    void finish_sesionNoExiste_retorna404() throws Exception {
        when(service.finishSession(eq(777L), any(SessionStatus.class)))
                .thenThrow(new ResourceNotFoundException("Pomodoro session with id 777 not found"));

        mockMvc.perform(patch("/pomodoro-sessions/777/finish")
                        .param("status", "COMPLETED"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PATCH /pomodoro-sessions/1/finish retorna 500 cuando sesión no está en STARTED")
    void finish_estadoInvalido_retorna500() throws Exception {
        // InvalidSessionStateException cae en handler genérico → 500
        when(service.finishSession(eq(1L), any(SessionStatus.class)))
                .thenThrow(new InvalidSessionStateException("Pomodoro session with id 1 is already finished"));

        mockMvc.perform(patch("/pomodoro-sessions/1/finish")
                        .param("status", "COMPLETED"))
                .andExpect(status().isInternalServerError());
    }
}
