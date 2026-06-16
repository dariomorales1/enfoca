package online.enfoca.certificationservice.ia;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class ClienteGroqCertTest {

    private ClienteGroqCert buildCliente() {
        return new ClienteGroqCert(
                "test-key",
                "http://localhost:1/groq",
                "test-model",
                new ObjectMapper());
    }

    @Test
    void generarPreguntas_errorDeConexion_lanzaRuntimeException() {
        assertThatThrownBy(() -> buildCliente().generarPreguntas("sistema", "usuario"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Groq no disponible");
    }
}
