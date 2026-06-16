package online.enfoca.aiservice.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.dominio.Tema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TemaResponse(
        UUID id,
        int orden,
        String titulo,
        int pomodorosEstimados,
        int pomodorosCompletados,
        boolean completado,
        LocalDateTime completadoEn,
        String guiaSocratica,
        List<String> subtemas
) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static TemaResponse desde(Tema tema) {
        List<String> subtemas = null;
        if (tema.getSubtemas() != null) {
            try {
                subtemas = MAPPER.readValue(tema.getSubtemas(), new TypeReference<>() {});
            } catch (Exception ignored) {}
        }
        return new TemaResponse(
                tema.getId(),
                tema.getOrden(),
                tema.getTitulo(),
                tema.getPomodorosEstimados(),
                tema.getPomodorosCompletados(),
                tema.isCompletado(),
                tema.getCompletadoEn(),
                tema.getGuiaSocratica(),
                subtemas
        );
    }
}
