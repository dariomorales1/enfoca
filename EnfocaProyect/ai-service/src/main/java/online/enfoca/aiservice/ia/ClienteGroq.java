package online.enfoca.aiservice.ia;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.config.PropiedadesIa;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class ClienteGroq implements ProveedorIa {

    private static final Logger log = LoggerFactory.getLogger(ClienteGroq.class);

    private final PropiedadesIa propiedades;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ClienteGroq(PropiedadesIa propiedades, ObjectMapper objectMapper) {
        this.propiedades = propiedades;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(propiedades.groq().url())
                .defaultHeader("Authorization", "Bearer " + propiedades.groq().apiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public String llamar(String mensajeSistema, String mensajeUsuario) {
        Map<String, Object> cuerpo = Map.of(
                "model", propiedades.groq().modelo(),
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", mensajeSistema),
                        Map.of("role", "user", "content", mensajeUsuario)
                )
        );

        try {
            String respuestaRaw = restClient.post()
                    .body(cuerpo)
                    .retrieve()
                    .body(String.class);

            JsonNode nodo = objectMapper.readTree(respuestaRaw);
            String contenido = nodo.path("choices").path(0)
                    .path("message").path("content").asText();

            log.info("Respuesta Groq recibida ({} caracteres)", contenido.length());
            return contenido;

        } catch (Exception e) {
            log.error("Error al llamar a Groq: {}", e.getMessage());
            throw new RuntimeException("Groq no disponible: " + e.getMessage(), e);
        }
    }

    @Override
    public String nombre() {
        return "groq";
    }
}
