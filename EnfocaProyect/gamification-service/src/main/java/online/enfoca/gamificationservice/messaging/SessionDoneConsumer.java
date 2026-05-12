package online.enfoca.gamificationservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import online.enfoca.gamificationservice.dto.SessionDoneEvent;
import online.enfoca.gamificationservice.service.GamificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionDoneConsumer {

    private final GamificationService gamificationService;

    @RabbitListener(queues = "${app.rabbitmq.queue.session-done:gamification.session.done}")
    public void onSessionDone(SessionDoneEvent event) {
        log.info("Evento session.done recibido: usuario={}, duración={}min",
                event.getUsuarioId(), event.getDuracion());

        int xp = event.getDuracion() >= 50 ? 110 : 50;
        gamificationService.sumarXP(event.getUsuarioId(), xp);
        gamificationService.verificarInsignias(event.getUsuarioId(), event);
    }
}