package online.enfoca.aiservice.dto;

import online.enfoca.aiservice.dominio.Tema;

import java.time.LocalDateTime;
import java.util.UUID;

public record TemaResponse(
        UUID id,
        int orden,
        String titulo,
        int pomodorosEstimados,
        int pomodorosCompletados,
        boolean completado,
        LocalDateTime completadoEn
) {
    public static TemaResponse desde(Tema tema) {
        return new TemaResponse(
                tema.getId(),
                tema.getOrden(),
                tema.getTitulo(),
                tema.getPomodorosEstimados(),
                tema.getPomodorosCompletados(),
                tema.isCompletado(),
                tema.getCompletadoEn()
        );
    }
}
