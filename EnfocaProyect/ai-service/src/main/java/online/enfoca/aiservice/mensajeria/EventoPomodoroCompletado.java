package online.enfoca.aiservice.mensajeria;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record EventoPomodoroCompletado(
        @JsonProperty("pomodoroId")   String pomodoroId,
        @JsonProperty("usuarioId")    String usuarioId,
        @JsonProperty("temaId")       String temaId,
        @JsonProperty("intensidad")   String intensidad,
        @JsonProperty("duracionFocoSegundos") int duracionFocoSegundos,
        @JsonProperty("completadaEn") Instant completadaEn
) {}
