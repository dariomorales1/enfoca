package online.enfoca.aiservice.ia;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.config.PropiedadesIa;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class ClienteGroqTest {

    private ClienteGroq buildCliente() {
        PropiedadesIa.Groq groq = new PropiedadesIa.Groq("test-key", "http://localhost:1/groq", "test-model");
        PropiedadesIa propiedades = new PropiedadesIa("groq", groq, null, null);
        return new ClienteGroq(propiedades, new ObjectMapper());
    }

    @Test
    void nombre_retornaGroq() {
        assertThat(buildCliente().nombre()).isEqualTo("groq");
    }

    @Test
    void llamar_errorDeConexion_lanzaRuntimeException() {
        assertThatThrownBy(() -> buildCliente().llamar("sistema", "usuario"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Groq no disponible");
    }
}
