package online.enfoca.metricsservice.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyHoursDTO {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private int totalFocusedMinutes;
    private int totalSessions;
}