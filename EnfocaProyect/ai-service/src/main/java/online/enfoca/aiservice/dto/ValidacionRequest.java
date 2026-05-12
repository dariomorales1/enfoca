package online.enfoca.aiservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ValidacionRequest(

        @NotNull(message = "El puntaje es obligatorio")
        @Min(value = 1, message = "El puntaje mínimo es 1")
        @Max(value = 5, message = "El puntaje máximo es 5")
        Integer puntaje,

        @Size(max = 500, message = "El comentario no puede superar 500 caracteres")
        String comentario
) {}
