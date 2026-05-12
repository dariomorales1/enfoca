package online.enfoca.aiservice.ia.prompt;

import jakarta.annotation.PostConstruct;
import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.dto.CrearPlanRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class ConstructorPrompt {

    private static final Logger log = LoggerFactory.getLogger(ConstructorPrompt.class);

    private final ResourceLoader resourceLoader;

    private String sistemaPlan;
    private String plantillaPlan;
    private String sistemaMejora;
    private String plantillaMejora;

    public ConstructorPrompt(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void cargarPrompts() throws IOException {
        this.sistemaPlan    = leer("classpath:prompts/sistema-generacion.txt");
        this.plantillaPlan  = leer("classpath:prompts/usuario-generacion.txt");
        this.sistemaMejora  = leer("classpath:prompts/sistema-mejora.txt");
        this.plantillaMejora = leer("classpath:prompts/usuario-mejora.txt");
        log.info("Prompts de IA cargados desde resources/prompts/");
    }

    public String[] promptGeneracion(CrearPlanRequest request) {
        String usuario = plantillaPlan
                .replace("{materia}", request.materia())
                .replace("{tiempo}", request.tiempoDisponible())
                .replace("{objetivo}", request.objetivo() != null ? request.objetivo() : "Aprender los fundamentos del tema")
                .replace("{nivel}", request.nivelEfectivo().name());
        return new String[]{ sistemaPlan, usuario };
    }

    public String[] promptMejora(PlanEstudio plan, String planJson) {
        String usuario = plantillaMejora
                .replace("{plan_json}", planJson);
        return new String[]{ sistemaMejora, usuario };
    }

    private String leer(String ubicacion) throws IOException {
        Resource resource = resourceLoader.getResource(ubicacion);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }
}
