package online.enfoca.metricsservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricsSummaryDTO {
    private int focusedMinutesToday;
    private int focusedMinutesWeek;
    private int focusedMinutesMonth;
    private int focusedMinutesTotal;
    private int currentStreak;
    private int longestStreak;
    private int sessionsToday;
    private double retentionRate; // porcentaje calculado
}