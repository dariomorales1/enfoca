package online.enfoca.pomodoroservice.mapper;

import online.enfoca.pomodoroservice.dto.PomodoroSessionResponse;
import online.enfoca.pomodoroservice.model.entity.PomodoroSession;

public final class PomodoroMapper {

    private PomodoroMapper() {
        throw new UnsupportedOperationException("PomodoroMapper is a utility class and cannot be instantiated");
    }

    public static PomodoroSessionResponse toResponse(PomodoroSession session) {
        if (session == null) {
            return null;
        }

        return new PomodoroSessionResponse(
                session.getId(),
                session.getUserId(),
                session.getTopicId(),
                session.getSessionType(),
                session.getDurationMinutes(),
                session.getStartTime(),
                session.getEndTime(),
                session.getStatus()
        );
    }

}
