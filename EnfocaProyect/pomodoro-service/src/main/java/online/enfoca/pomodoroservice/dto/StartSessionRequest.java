package online.enfoca.pomodoroservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import online.enfoca.pomodoroservice.model.enums.SessionType;

public record StartSessionRequest(

        @NotBlank (message = "The userId is required")
        String userId,

        Long topicId,

        @NotNull (message = "The sessionType is required")
        SessionType sessionType,

        @NotNull (message = "The duration is required")
        @Min(value = 15, message = "Minimum 15 minute")
        @Max(value = 240, message = "Maximum 240 minutes") //revisar estos datos por si se quieren actualizar los min y max
        Integer durationMinutes
) {}
