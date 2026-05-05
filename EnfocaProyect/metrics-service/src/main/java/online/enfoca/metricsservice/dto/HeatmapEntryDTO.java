package online.enfoca.metricsservice.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatmapEntryDTO {
    private LocalDate date;
    private int focusedMinutes;
    private int intensity; // 0-4 para el color del heatmap
}