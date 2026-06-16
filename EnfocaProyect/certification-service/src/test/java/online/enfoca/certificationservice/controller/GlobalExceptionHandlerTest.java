package online.enfoca.certificationservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleIllegalState_retorna409Conflict() {
        ResponseEntity<Map<String, String>> resp =
                handler.handleIllegalState(new IllegalStateException("Ya existe"));

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(resp.getBody()).containsEntry("message", "Ya existe");
    }

    @Test
    void handleSecurity_retorna403Forbidden() {
        ResponseEntity<Map<String, String>> resp =
                handler.handleSecurity(new SecurityException("Acceso denegado"));

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(resp.getBody()).containsEntry("message", "Acceso denegado");
    }

    @Test
    void handleNotFound_retorna404NotFound() {
        ResponseEntity<Map<String, String>> resp =
                handler.handleNotFound(new NoSuchElementException("No encontrado"));

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(resp.getBody()).containsEntry("message", "No encontrado");
    }
}
