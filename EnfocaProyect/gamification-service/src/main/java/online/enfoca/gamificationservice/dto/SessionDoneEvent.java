package online.enfoca.gamificationservice.dto;

import lombok.Data;

@Data
public class SessionDoneEvent {
    private String usuarioId;
    private Integer duracion;
    private String tipo;
    private Integer rachaDias;
    private Integer totalSesiones;
}