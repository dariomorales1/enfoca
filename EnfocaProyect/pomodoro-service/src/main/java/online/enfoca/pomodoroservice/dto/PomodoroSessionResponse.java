package online.enfoca.pomodoroservice.dto;

import online.enfoca.pomodoroservice.model.enums.SessionStatus;
import online.enfoca.pomodoroservice.model.enums.SessionType;
import java.time.LocalDateTime;

public record PomodoroSessionResponse (
        Long id,
        String userId,
        Long topicId,
        SessionType sessionType,
        Integer durationMinutes,
        LocalDateTime startTime,
        LocalDateTime endTime,
        SessionStatus status
){}
