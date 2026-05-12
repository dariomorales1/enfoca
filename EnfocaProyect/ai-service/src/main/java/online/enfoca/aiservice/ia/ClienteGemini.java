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
public class ClienteGemini implements ProveedorIa {

    private static final Logger log = LoggerFactory.getLogger(ClienteGemini.class);

    private final PropiedadesIa propiedades;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ClienteGemini(PropiedadesIa propiedades, ObjectMapper objectMapper) {
        this.propiedades = propiedades;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(propiedades.gemini().url())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public String llamar(String mensajeSistema, String mensajeUsuario) {
        String promptCombinado = mensajeSistema + "\n\n" + mensajeUsuario;

        Map<String, Object> cuerpo = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", promptCombinado)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "responseMimeType", "application/json"
                )
        );

        String urlConClave = propiedades.gemini().url() + "?key=" + propiedades.gemini().apiKey();

        try {
            String respuestaRaw = restClient.post()
                    .uri(urlConClave)
                    .body(cuerpo)
                    .retrieve()
                    .body(String.class);

            JsonNode nodo = objectMapper.readTree(respuestaRaw);
            String contenido = nodo.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText();

            log.info("Respuesta Gemini recibida ({} caracteres)", contenido.length());
            return contenido;

        } catch (Exception e) {
            log.error("Error al llamar a Gemini: {}", e.getMessage());
            throw new RuntimeException("Gemini no disponible: " + e.getMessage(), e);
        }
    }

    @Override
    public String nombre() {
        return "gemini";
    }
}
