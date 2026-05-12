package online.enfoca.aiservice.dto;

import online.enfoca.aiservice.dominio.Modulo;

import java.util.List;
import java.util.UUID;

public record ModuloResponse(
        UUID id,
        int orden,
        String titulo,
        List<TemaResponse> temas
) {
    public static ModuloResponse desde(Modulo modulo) {
        return new ModuloResponse(
                modulo.getId(),
                modulo.getOrden(),
                modulo.getTitulo(),
                modulo.getTemas().stream().map(TemaResponse::desde).toList()
        );
    }
}
