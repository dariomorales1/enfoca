package online.enfoca.gamificationservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PerfilGamificacionDTO {
    private String usuarioId;
    private Integer xpTotal;
    private Integer nivel;
    private Integer xpNivelActual;
    private Integer xpSiguienteNivel;
    private Integer xpProgreso;
    private Integer insigniasDesbloqueadas;
    private Integer insigniasTotales;
    private List<InsigniaDTO> ultimasInsignias;
}