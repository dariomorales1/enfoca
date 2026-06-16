package online.enfoca.aiservice.ia.prompt;

import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.dto.CrearPlanRequest;
import online.enfoca.aiservice.enums.NivelPlan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.io.IOException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ConstructorPromptTest {

    private ConstructorPrompt constructorPrompt;

    @BeforeEach
    void setUp() throws IOException {
        constructorPrompt = new ConstructorPrompt(new DefaultResourceLoader());
        constructorPrompt.cargarPrompts();
    }

    @Test
    void promptGeneracion_conObjetivo_retornaArregloDos() {
        CrearPlanRequest request = new CrearPlanRequest("Python", "2h/día", "Aprender Python", NivelPlan.BASICO);
        String[] result = constructorPrompt.promptGeneracion(request);

        assertThat(result).hasSize(2);
        assertThat(result[0]).isNotBlank();
        assertThat(result[1]).isNotBlank();
    }

    @Test
    void promptGeneracion_sinObjetivo_usaObjetivoDefault() {
        CrearPlanRequest request = new CrearPlanRequest("Álgebra lineal", "1h/día", null, NivelPlan.INTERMEDIO);
        String[] result = constructorPrompt.promptGeneracion(request);

        assertThat(result).hasSize(2);
        assertThat(result[1]).contains("Aprender los fundamentos del tema");
    }

    @Test
    void promptMejora_retornaArregloDos() {
        PlanEstudio plan = PlanEstudio.builder()
                .id(UUID.randomUUID())
                .titulo("Python")
                .build();
        String[] result = constructorPrompt.promptMejora(plan, "{\"titulo\":\"Python\"}");

        assertThat(result).hasSize(2);
        assertThat(result[0]).isNotBlank();
    }

    @Test
    void promptMejoraPersonal_conDetalle_retornaArregloDos() {
        String[] result = constructorPrompt.promptMejoraPersonal(
                "{}", "MUY_BASICO", "Muy básico para mi nivel", "Me pareció demasiado sencillo");

        assertThat(result).hasSize(2);
        assertThat(result[0]).isNotBlank();
    }

    @Test
    void promptMejoraPersonal_sinDetalle_usaTextoDefault() {
        String[] result = constructorPrompt.promptMejoraPersonal(
                "{}", "MUY_BASICO", "Muy básico para mi nivel", null);

        assertThat(result).hasSize(2);
        assertThat(result[1]).contains("Sin detalle adicional");
    }

    @Test
    void promptMejoraPersonal_detalleEnBlanco_usaTextoDefault() {
        String[] result = constructorPrompt.promptMejoraPersonal(
                "{}", "MUY_BASICO", "Muy básico", "   ");

        assertThat(result).hasSize(2);
        assertThat(result[1]).contains("Sin detalle adicional");
    }

    @Test
    void promptMejoraComunitaria_retornaArregloDos() {
        String[] result = constructorPrompt.promptMejoraComunitaria(
                "{}", "- Muy básico: 3 usuarios\n- Muy avanzado: 2 usuarios");

        assertThat(result).hasSize(2);
        assertThat(result[0]).isNotBlank();
    }

    @Test
    void promptCuestionario_retornaArregloDos() {
        String[] result = constructorPrompt.promptCuestionario(
                "Programación orientada a objetos", "- Clases\n- Herencia\n- Polimorfismo");

        assertThat(result).hasSize(2);
        assertThat(result[0]).isNotBlank();
    }
}
