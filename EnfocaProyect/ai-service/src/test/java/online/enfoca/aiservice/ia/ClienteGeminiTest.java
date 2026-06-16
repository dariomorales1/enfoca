package online.enfoca.aiservice.ia;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.config.PropiedadesIa;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class ClienteGeminiTest {

    private ClienteGemini buildCliente() {
        PropiedadesIa.Gemini gemini = new PropiedadesIa.Gemini("test-key", "http://localhost:1/gemini");
        PropiedadesIa propiedades = new PropiedadesIa("gemini", null, gemini, null);
        return new ClienteGemini(propiedades, new ObjectMapper());
    }

    @Test
    void nombre_retornaGemini() {
        assertThat(buildCliente().nombre()).isEqualTo("gemini");
    }

    @Test
    void llamar_errorDeConexion_lanzaRuntimeException() {
        assertThatThrownBy(() -> buildCliente().llamar("sistema", "usuario"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Gemini no disponible");
    }
}
