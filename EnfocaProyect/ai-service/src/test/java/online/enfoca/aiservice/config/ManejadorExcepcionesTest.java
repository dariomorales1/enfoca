package online.enfoca.aiservice.config;

import online.enfoca.aiservice.exception.LimitePeticionesException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.assertThat;

class ManejadorExcepcionesTest {

    private final ManejadorExcepciones manejador = new ManejadorExcepciones();

    @Test
    void noEncontrado_retorna404() {
        ResponseEntity<Map<String, Object>> response =
                manejador.noEncontrado(new NoSuchElementException("Plan no encontrado"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsEntry("estado", 404);
    }

    @Test
    void noAutorizado_retorna403() {
        ResponseEntity<Map<String, Object>> response =
                manejador.noAutorizado(new SecurityException("Acceso denegado"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("estado", 403);
    }

    @Test
    void limiteSuperado_retorna429() {
        ResponseEntity<Map<String, Object>> response =
                manejador.limiteSuperado(new LimitePeticionesException("Límite alcanzado"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getBody()).containsEntry("estado", 429);
    }

    @Test
    void estadoInvalido_retorna409() {
        ResponseEntity<Map<String, Object>> response =
                manejador.estadoInvalido(new IllegalStateException("Estado no válido"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("estado", 409);
    }

    @Test
    void error_retorna500() {
        ResponseEntity<Map<String, Object>> response =
                manejador.error(new RuntimeException("Error inesperado"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("estado", 500);
    }
}
