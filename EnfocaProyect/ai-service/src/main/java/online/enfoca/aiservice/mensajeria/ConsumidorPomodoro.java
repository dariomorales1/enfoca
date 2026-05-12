package online.enfoca.aiservice.mensajeria;

import online.enfoca.aiservice.dominio.Tema;
import online.enfoca.aiservice.repositorio.TemaRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Component
public class ConsumidorPomodoro {

    private static final Logger log = LoggerFactory.getLogger(ConsumidorPomodoro.class);
    private static final String PREFIJO_IDEMPOTENTE = "ia:idempotente:pomodoro:";

    private final TemaRepositorio temaRepositorio;
    private final StringRedisTemplate redis;

    public ConsumidorPomodoro(TemaRepositorio temaRepositorio, StringRedisTemplate redis) {
        this.temaRepositorio = temaRepositorio;
        this.redis = redis;
    }

    @RabbitListener(queues = "${enfoca.rabbit.cola-pomodoro:pomodoro.completado.planes}")
    public void procesarPomodoroCompletado(EventoPomodoroCompletado evento) {
        log.debug("Evento recibido: pomodoroId={}, temaId={}", evento.pomodoroId(), evento.temaId());

        if (evento.temaId() == null || evento.temaId().isBlank()) {
            log.debug("Evento sin temaId — ignorado");
            return;
        }

        if (yaFueProcesado(evento.pomodoroId())) {
            log.warn("Evento {} ya procesado — descartado (idempotencia)", evento.pomodoroId());
            return;
        }

        try {
            UUID temaId = UUID.fromString(evento.temaId());
            Optional<Tema> temaOpt = temaRepositorio.findById(temaId);

            if (temaOpt.isEmpty()) {
                log.debug("Tema {} no encontrado en planes — evento ignorado", temaId);
                marcarProcesado(evento.pomodoroId());
                return;
            }

            Tema tema = temaOpt.get();
            tema.incrementarPomodoro();
            temaRepositorio.save(tema);

            marcarProcesado(evento.pomodoroId());
            log.info("Pomodoro registrado en tema {} ({}/{})",
                    temaId, tema.getPomodorosCompletados(), tema.getPomodorosEstimados());

        } catch (IllegalArgumentException e) {
            log.error("temaId inválido en evento {}: {}", evento.pomodoroId(), evento.temaId());
        }
    }

    private boolean yaFueProcesado(String pomodoroId) {
        String clave = PREFIJO_IDEMPOTENTE + pomodoroId;
        return Boolean.FALSE.equals(redis.opsForValue().setIfAbsent(clave, "1", Duration.ofHours(24)));
    }

    private void marcarProcesado(String pomodoroId) {
        String clave = PREFIJO_IDEMPOTENTE + pomodoroId;
        redis.opsForValue().setIfAbsent(clave, "1", Duration.ofHours(24));
    }
}
