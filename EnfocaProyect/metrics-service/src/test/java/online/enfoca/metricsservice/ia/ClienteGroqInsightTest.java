package online.enfoca.metricsservice.ia;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class ClienteGroqInsightTest {

    private ClienteGroqInsight buildCliente() {
        return new ClienteGroqInsight(
                "test-key",
                "http://localhost:1/groq",
                "test-model",
                new ObjectMapper());
    }

    @Test
    void llamar_errorDeConexion_lanzaRuntimeException() {
        assertThatThrownBy(() -> buildCliente().llamar("sistema", "usuario"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Groq no disponible");
    }
}
