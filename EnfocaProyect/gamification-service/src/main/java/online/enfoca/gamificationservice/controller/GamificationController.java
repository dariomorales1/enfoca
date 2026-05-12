package online.enfoca.gamificationservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import online.enfoca.gamificationservice.dto.InsigniaDTO;
import online.enfoca.gamificationservice.dto.PerfilGamificacionDTO;
import online.enfoca.gamificationservice.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamification")
@RequiredArgsConstructor
@Tag(name = "Gamification", description = "XP, niveles e insignias")
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/{usuarioId}/perfil")
    @Operation(summary = "Perfil de gamificación del usuario")
    public ResponseEntity<PerfilGamificacionDTO> obtenerPerfil(@PathVariable String usuarioId) {
        return ResponseEntity.ok(gamificationService.obtenerPerfil(usuarioId));
    }

    @GetMapping("/{usuarioId}/insignias")
    @Operation(summary = "Todas las insignias con estado desbloqueado/bloqueado")
    public ResponseEntity<List<InsigniaDTO>> obtenerInsignias(@PathVariable String usuarioId) {
        return ResponseEntity.ok(gamificationService.obtenerInsignias(usuarioId));
    }
}