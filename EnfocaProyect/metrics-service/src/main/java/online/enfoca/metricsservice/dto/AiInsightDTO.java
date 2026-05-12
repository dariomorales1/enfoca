package online.enfoca.metricsservice.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsightDTO {
    private LocalDate weekStart;
    private String summary;
    private String bestDay;
    private String recommendation;
    private OffsetDateTime generatedAt;
}