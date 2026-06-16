package online.enfoca.aiservice.mensajeria;

import online.enfoca.aiservice.dominio.Modulo;
import online.enfoca.aiservice.dominio.Tema;
import online.enfoca.aiservice.repositorio.TemaRepositorio;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsumidorPomodoroTest {

    @Mock TemaRepositorio temaRepositorio;
    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;

    @InjectMocks
    ConsumidorPomodoro consumidor;

    private EventoPomodoroCompletado buildEvento(String pomodoroId, String temaId) {
        return new EventoPomodoroCompletado(pomodoroId, "user-1", temaId, "NORMAL", 25 * 60, Instant.now());
    }

    @Test
    void procesarPomodoroCompletado_sinTemaId_ignorado() {
        EventoPomodoroCompletado evento = buildEvento("pomo-1", null);

        consumidor.procesarPomodoroCompletado(evento);

        verifyNoInteractions(temaRepositorio);
    }

    @Test
    void procesarPomodoroCompletado_temaIdEnBlanco_ignorado() {
        EventoPomodoroCompletado evento = buildEvento("pomo-1", "   ");

        consumidor.procesarPomodoroCompletado(evento);

        verifyNoInteractions(temaRepositorio);
    }

    @Test
    void procesarPomodoroCompletado_yaFueProcesado_descartado() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any())).thenReturn(false);

        EventoPomodoroCompletado evento = buildEvento("pomo-dup", UUID.randomUUID().toString());
        consumidor.procesarPomodoroCompletado(evento);

        verifyNoInteractions(temaRepositorio);
    }

    @Test
    void procesarPomodoroCompletado_temaNoEncontrado_marcaProcesado() {
        UUID temaId = UUID.randomUUID();
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(temaRepositorio.findById(temaId)).thenReturn(Optional.empty());

        EventoPomodoroCompletado evento = buildEvento("pomo-2", temaId.toString());
        consumidor.procesarPomodoroCompletado(evento);

        verify(temaRepositorio).findById(temaId);
        verify(temaRepositorio, never()).save(any());
    }

    @Test
    void procesarPomodoroCompletado_incrementaPomodoro() {
        UUID temaId = UUID.randomUUID();
        Tema tema = buildTema(temaId, 3);
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);
        when(temaRepositorio.findById(temaId)).thenReturn(Optional.of(tema));
        when(temaRepositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventoPomodoroCompletado evento = buildEvento("pomo-3", temaId.toString());
        consumidor.procesarPomodoroCompletado(evento);

        assertThat(tema.getPomodorosCompletados()).isEqualTo(1);
        verify(temaRepositorio).save(tema);
    }

    @Test
    void procesarPomodoroCompletado_temaIdInvalido_capturaError() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);

        EventoPomodoroCompletado evento = buildEvento("pomo-err", "no-es-un-uuid");
        consumidor.procesarPomodoroCompletado(evento);

        verifyNoInteractions(temaRepositorio);
    }

    private Tema buildTema(UUID temaId, int pomodorosEstimados) {
        Modulo modulo = Modulo.builder()
                .id(UUID.randomUUID())
                .orden(1)
                .titulo("Módulo test")
                .build();
        return Tema.builder()
                .id(temaId)
                .modulo(modulo)
                .orden(1)
                .titulo("Tema test")
                .pomodorosEstimados(pomodorosEstimados)
                .build();
    }
}
