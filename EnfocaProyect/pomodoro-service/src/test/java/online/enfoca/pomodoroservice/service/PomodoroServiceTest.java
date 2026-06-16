package online.enfoca.pomodoroservice.service;

import online.enfoca.pomodoroservice.dto.StartSessionRequest;
import online.enfoca.pomodoroservice.exception.InvalidSessionStateException;
import online.enfoca.pomodoroservice.exception.ResourceNotFoundException;
import online.enfoca.pomodoroservice.model.entity.PomodoroSession;
import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.model.enums.SessionType;
import online.enfoca.pomodoroservice.repository.PomodoroRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PomodoroServiceTest {

    @Mock
    private PomodoroRepository repository;

    @InjectMocks
    private PomodoroService service;

    private PomodoroSession sessionPreparando;
    private PomodoroSession sessionStarted;

    @BeforeEach
    void setUp() {
        sessionPreparando = new PomodoroSession();
        sessionPreparando.setId(1L);
        sessionPreparando.setUserId("user-123");
        sessionPreparando.setTopicId(10L);
        sessionPreparando.setSessionType(SessionType.FOCUS);
        sessionPreparando.setDurationMinutes(25);
        sessionPreparando.setStatus(SessionStatus.PREPARING);

        sessionStarted = new PomodoroSession();
        sessionStarted.setId(2L);
        sessionStarted.setUserId("user-123");
        sessionStarted.setTopicId(10L);
        sessionStarted.setSessionType(SessionType.FOCUS);
        sessionStarted.setDurationMinutes(25);
        sessionStarted.setStatus(SessionStatus.STARTED);
        sessionStarted.setStartTime(LocalDateTime.now().minusMinutes(10));
    }

    // ---- getSessionsByUser ----

    @Test
    @DisplayName("getSessionsByUser retorna lista de sesiones del usuario")
    void getSessionsByUser_retornaLista() {
        List<PomodoroSession> lista = List.of(sessionPreparando, sessionStarted);
        when(repository.findByUserIdOrderByStartTimeDesc("user-123")).thenReturn(lista);

        List<PomodoroSession> resultado = service.getSessionsByUser("user-123");

        assertThat(resultado).hasSize(2);
        assertThat(resultado).containsExactlyInAnyOrder(sessionPreparando, sessionStarted);
        verify(repository, times(1)).findByUserIdOrderByStartTimeDesc("user-123");
    }

    @Test
    @DisplayName("getSessionsByUser retorna lista vacía cuando no hay sesiones")
    void getSessionsByUser_listaVacia() {
        when(repository.findByUserIdOrderByStartTimeDesc("user-sin-sesiones")).thenReturn(List.of());

        List<PomodoroSession> resultado = service.getSessionsByUser("user-sin-sesiones");

        assertThat(resultado).isEmpty();
    }

    // ---- startSession ----

    @Test
    @DisplayName("startSession crea sesión con estado PREPARING y guarda en repositorio")
    void startSession_creaSessionConEstadoPreparing() {
        StartSessionRequest request = new StartSessionRequest("user-123", 10L, SessionType.FOCUS, 25);
        when(repository.save(any(PomodoroSession.class))).thenAnswer(inv -> {
            PomodoroSession s = inv.getArgument(0);
            s.setId(99L);
            return s;
        });

        PomodoroSession resultado = service.startSession(request);

        assertThat(resultado.getStatus()).isEqualTo(SessionStatus.PREPARING);
        assertThat(resultado.getUserId()).isEqualTo("user-123");
        assertThat(resultado.getTopicId()).isEqualTo(10L);
        assertThat(resultado.getSessionType()).isEqualTo(SessionType.FOCUS);
        assertThat(resultado.getDurationMinutes()).isEqualTo(25);
        verify(repository, times(1)).save(any(PomodoroSession.class));
    }

    @Test
    @DisplayName("startSession con tipo SHORT_BREAK crea sesión correctamente")
    void startSession_conShortBreak() {
        StartSessionRequest request = new StartSessionRequest("user-456", null, SessionType.SHORT_BREAK, 5);
        when(repository.save(any(PomodoroSession.class))).thenAnswer(inv -> inv.getArgument(0));

        PomodoroSession resultado = service.startSession(request);

        assertThat(resultado.getSessionType()).isEqualTo(SessionType.SHORT_BREAK);
        assertThat(resultado.getTopicId()).isNull();
        assertThat(resultado.getStatus()).isEqualTo(SessionStatus.PREPARING);
    }

    // ---- beginSession ----

    @Test
    @DisplayName("beginSession cambia estado a STARTED y setea startTime")
    void beginSession_exitoso() {
        when(repository.findById(1L)).thenReturn(Optional.of(sessionPreparando));
        when(repository.save(any(PomodoroSession.class))).thenAnswer(inv -> inv.getArgument(0));

        PomodoroSession resultado = service.beginSession(1L);

        assertThat(resultado.getStatus()).isEqualTo(SessionStatus.STARTED);
        assertThat(resultado.getStartTime()).isNotNull();
        assertThat(resultado.getStartTime()).isBeforeOrEqualTo(LocalDateTime.now());
        verify(repository).save(sessionPreparando);
    }

    @Test
    @DisplayName("beginSession lanza ResourceNotFoundException si la sesión no existe")
    void beginSession_sesionNoExiste_lanzaResourceNotFoundException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.beginSession(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("beginSession lanza InvalidSessionStateException si la sesión no está en PREPARING")
    void beginSession_estadoNoEsPreparing_lanzaInvalidSessionStateException() {
        when(repository.findById(2L)).thenReturn(Optional.of(sessionStarted));

        assertThatThrownBy(() -> service.beginSession(2L))
                .isInstanceOf(InvalidSessionStateException.class)
                .hasMessageContaining("PREPARING");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("beginSession lanza InvalidSessionStateException si la sesión está COMPLETED")
    void beginSession_estadoCompleted_lanzaInvalidSessionStateException() {
        PomodoroSession sesionTerminada = new PomodoroSession();
        sesionTerminada.setId(3L);
        sesionTerminada.setStatus(SessionStatus.COMPLETED);
        when(repository.findById(3L)).thenReturn(Optional.of(sesionTerminada));

        assertThatThrownBy(() -> service.beginSession(3L))
                .isInstanceOf(InvalidSessionStateException.class);
    }

    // ---- finishSession ----

    @Test
    @DisplayName("finishSession con COMPLETED cambia estado y setea endTime")
    void finishSession_exitosoCompleted() {
        when(repository.findById(2L)).thenReturn(Optional.of(sessionStarted));
        when(repository.save(any(PomodoroSession.class))).thenAnswer(inv -> inv.getArgument(0));

        PomodoroSession resultado = service.finishSession(2L, SessionStatus.COMPLETED);

        assertThat(resultado.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(resultado.getEndTime()).isNotNull();
        assertThat(resultado.getEndTime()).isBeforeOrEqualTo(LocalDateTime.now());
        verify(repository).save(sessionStarted);
    }

    @Test
    @DisplayName("finishSession con ABORTED cambia estado a ABORTED")
    void finishSession_exitosoAborted() {
        when(repository.findById(2L)).thenReturn(Optional.of(sessionStarted));
        when(repository.save(any(PomodoroSession.class))).thenAnswer(inv -> inv.getArgument(0));

        PomodoroSession resultado = service.finishSession(2L, SessionStatus.ABORTED);

        assertThat(resultado.getStatus()).isEqualTo(SessionStatus.ABORTED);
        assertThat(resultado.getEndTime()).isNotNull();
    }

    @Test
    @DisplayName("finishSession lanza ResourceNotFoundException si la sesión no existe")
    void finishSession_sesionNoExiste_lanzaResourceNotFoundException() {
        when(repository.findById(777L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.finishSession(777L, SessionStatus.COMPLETED))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("777");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("finishSession lanza InvalidSessionStateException si la sesión no está en STARTED")
    void finishSession_estadoNoEsStarted_lanzaInvalidSessionStateException() {
        when(repository.findById(1L)).thenReturn(Optional.of(sessionPreparando));

        assertThatThrownBy(() -> service.finishSession(1L, SessionStatus.COMPLETED))
                .isInstanceOf(InvalidSessionStateException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("finishSession lanza InvalidSessionStateException si la sesión ya está COMPLETED")
    void finishSession_estadoYaCompleted_lanzaInvalidSessionStateException() {
        PomodoroSession sesionTerminada = new PomodoroSession();
        sesionTerminada.setId(5L);
        sesionTerminada.setStatus(SessionStatus.COMPLETED);
        when(repository.findById(5L)).thenReturn(Optional.of(sesionTerminada));

        assertThatThrownBy(() -> service.finishSession(5L, SessionStatus.COMPLETED))
                .isInstanceOf(InvalidSessionStateException.class)
                .hasMessageContaining("5");
    }
}
