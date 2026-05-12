package online.enfoca.gamificationservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InsigniaDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String icono;
    private Boolean desbloqueada;
    private LocalDateTime desbloqueadaAt;
}