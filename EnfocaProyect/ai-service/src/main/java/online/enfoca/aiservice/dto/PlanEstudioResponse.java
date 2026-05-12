package online.enfoca.aiservice.dto;

import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.enums.NivelPlan;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PlanEstudioResponse(
        UUID id,
        String titulo,
        String objetivo,
        NivelPlan nivel,
        EstadoPlan estado,
        double ratioValidaciones,
        int totalValidaciones,
        LocalDateTime creadoEn,
        List<ModuloResponse> modulos,
        ProgresoResponse progreso
) {
    public static PlanEstudioResponse desde(PlanEstudio plan) {
        List<ModuloResponse> modulos = plan.getModulos().stream()
                .map(ModuloResponse::desde)
                .toList();

        long totalTemas = modulos.stream().mapToLong(m -> m.temas().size()).sum();
        long temasCompletados = modulos.stream()
                .flatMap(m -> m.temas().stream())
                .filter(TemaResponse::completado)
                .count();

        ProgresoResponse progreso = new ProgresoResponse(
                (int) totalTemas,
                (int) temasCompletados,
                totalTemas > 0 ? Math.round((double) temasCompletados / totalTemas * 100) : 0
        );

        return new PlanEstudioResponse(
                plan.getId(),
                plan.getTitulo(),
                plan.getObjetivo(),
                plan.getNivel(),
                plan.getEstado(),
                plan.getRatioValidaciones(),
                plan.getTotalValidaciones(),
                plan.getCreadoEn(),
                modulos,
                progreso
        );
    }
}
