package online.enfoca.pomodoroservice.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import online.enfoca.pomodoroservice.dto.StartSessionRequest;
import online.enfoca.pomodoroservice.exception.InvalidSessionStateException;
import online.enfoca.pomodoroservice.exception.ResourceNotFoundException;
import online.enfoca.pomodoroservice.model.entity.PomodoroSession;
import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.repository.PomodoroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class PomodoroService {

    @Autowired
    private PomodoroRepository repository;

    @CircuitBreaker(name = "pomodoroService", fallbackMethod = "fallbackFinishSession")
    public PomodoroSession startSession(StartSessionRequest request) {
        PomodoroSession session = new PomodoroSession();

        session.setUserId(request.userId());
        session.setTopicId(request.topicId());
        session.setSessionType(request.sessionType());
        session.setDurationMinutes(request.durationMinutes());

        session.setStartTime(LocalDateTime.now());
        session.setStatus(SessionStatus.STARTED);

        PomodoroSession savedSession = repository.save(session);

        log.info("[POMODORO START] Session iniciate | ID: {} | User: {} | Minutes: {}",
                savedSession.getId(), savedSession.getUserId(), savedSession.getDurationMinutes());

        return savedSession;
    }

    public PomodoroSession finishSession(Long id, SessionStatus finalStatus) {
        PomodoroSession session = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pomodoro session with id " + id + " not found"));

        if (session.getStatus() != SessionStatus.STARTED) {
            throw new InvalidSessionStateException("Pomodoro session with id " + id + " is already finished");
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(finalStatus);

        PomodoroSession savedSession = repository.save(session);

        //simulacion de RabbitMQ en logs
        log.info("[RabbitMQ EVENT] -> Sending message for session finished...");

        return savedSession;

    }

    public PomodoroSession fallbackFinishSession(Long sessionId, SessionStatus status, Exception ex) {
        log.error("🚨 CIRCUIT BREAKER ACTIVE: Failed to save session or emit event. Reason: {}", ex.getMessage());

        throw new RuntimeException("The session service is temporarily unavailable. Please try again later.");
    }

}
