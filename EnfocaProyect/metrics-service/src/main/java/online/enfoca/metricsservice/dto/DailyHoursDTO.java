package online.enfoca.metricsservice.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyHoursDTO {
    private LocalDate date;
    private int focusedMinutes;
    private int sessionsCount;
}