package online.enfoca.aiservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import online.enfoca.aiservice.enums.NivelPlan;

public record CrearPlanRequest(

        @NotBlank(message = "La materia es obligatoria")
        @Size(max = 200, message = "La materia no puede superar 200 caracteres")
        String materia,

        @NotBlank(message = "El tiempo disponible es obligatorio")
        String tiempoDisponible,

        @Size(max = 1000, message = "El objetivo no puede superar 1000 caracteres")
        String objetivo,

        NivelPlan nivel
) {
    public NivelPlan nivelEfectivo() {
        return nivel != null ? nivel : NivelPlan.BASICO;
    }
}
