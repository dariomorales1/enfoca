package online.enfoca.aiservice.controller;

import jakarta.validation.Valid;
import online.enfoca.aiservice.dto.*;
import online.enfoca.aiservice.servicio.ServicioPlanEstudio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/planes-estudio")
public class PlanEstudioController {

    private final ServicioPlanEstudio servicio;

    public PlanEstudioController(ServicioPlanEstudio servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public ResponseEntity<PlanEstudioResponse> crear(
            @RequestHeader("X-User-Id") String usuarioId,
            @Valid @RequestBody CrearPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(usuarioId, request));
    }

    @GetMapping
    public ResponseEntity<List<PlanEstudioResponse>> listar(
            @RequestHeader("X-User-Id") String usuarioId) {
        return ResponseEntity.ok(servicio.listarDeUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanEstudioResponse> obtener(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String usuarioId) {
        return ResponseEntity.ok(servicio.obtener(id, usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String usuarioId) {
        servicio.eliminar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validaciones")
    public ResponseEntity<Void> validar(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String usuarioId,
            @Valid @RequestBody ValidacionRequest request) {
        servicio.agregarValidacion(id, usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/temas/{temaId}/completado")
    public ResponseEntity<TemaResponse> toggleTema(
            @PathVariable UUID temaId,
            @RequestHeader("X-User-Id") String usuarioId) {
        return ResponseEntity.ok(servicio.toggleTema(temaId, usuarioId));
    }

    @GetMapping("/catalogo")
    public ResponseEntity<List<PlanEstudioResponse>> catalogo() {
        return ResponseEntity.ok(servicio.obtenerCatalogo());
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("ai-service OK");
    }
}
