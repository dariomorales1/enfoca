package online.enfoca.gamificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import online.enfoca.gamificationservice.dto.InsigniaDTO;
import online.enfoca.gamificationservice.dto.PerfilGamificacionDTO;
import online.enfoca.gamificationservice.dto.SessionDoneEvent;
import online.enfoca.gamificationservice.entity.Gamificacion;
import online.enfoca.gamificationservice.entity.Insignia;
import online.enfoca.gamificationservice.entity.UsuarioInsignia;
import online.enfoca.gamificationservice.repository.GamificacionRepository;
import online.enfoca.gamificationservice.repository.InsigniaRepository;
import online.enfoca.gamificationservice.repository.UsuarioInsigniaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final GamificacionRepository gamificacionRepo;
    private final InsigniaRepository insigniaRepo;
    private final UsuarioInsigniaRepository usuarioInsigniaRepo;

    @Transactional
    public void sumarXP(String usuarioId, int xp) {
        Gamificacion gam = gamificacionRepo.findByUsuarioId(usuarioId)
                .orElseGet(() -> crearPerfil(usuarioId));

        gam.setXpTotal(gam.getXpTotal() + xp);
        gam.setNivel(calcularNivel(gam.getXpTotal()));
        gamificacionRepo.save(gam);

        log.info("Usuario {} ganó {} XP. Total: {} XP, Nivel: {}",
                usuarioId, xp, gam.getXpTotal(), gam.getNivel());
    }

    @Transactional
    public void verificarInsignias(String usuarioId, SessionDoneEvent event) {
        Gamificacion gam = gamificacionRepo.findByUsuarioId(usuarioId)
                .orElseGet(() -> crearPerfil(usuarioId));

        List<Insignia> todas = insigniaRepo.findAll();
        List<Long> yaDesbloqueadas = usuarioInsigniaRepo
                .findByUsuarioId(usuarioId)
                .stream()
                .map(ui -> ui.getInsignia().getId())
                .collect(Collectors.toList());

        for (Insignia insignia : todas) {
            if (yaDesbloqueadas.contains(insignia.getId())) continue;
            if (insignia.getCondicion() == null) continue;

            if (cumpleCondicion(insignia, gam, event)) {
                UsuarioInsignia ui = new UsuarioInsignia();
                ui.setUsuarioId(usuarioId);
                ui.setInsignia(insignia);
                usuarioInsigniaRepo.save(ui);
                log.info("Usuario {} desbloqueó: {}", usuarioId, insignia.getNombre());
            }
        }
    }

    public PerfilGamificacionDTO obtenerPerfil(String usuarioId) {
        Gamificacion gam = gamificacionRepo.findByUsuarioId(usuarioId)
                .orElseGet(() -> crearPerfil(usuarioId));

        int nivelActual = gam.getNivel();
        int xpNivelActual = xpParaNivel(nivelActual);
        int xpSiguienteNivel = xpParaNivel(nivelActual + 1);

        List<UsuarioInsignia> desbloqueadas = usuarioInsigniaRepo.findByUsuarioId(usuarioId);
        List<InsigniaDTO> ultimas3 = desbloqueadas.stream()
                .sorted((a, b) -> b.getDesbloqueadaAt().compareTo(a.getDesbloqueadaAt()))
                .limit(3)
                .map(this::toInsigniaDTO)
                .collect(Collectors.toList());

        return PerfilGamificacionDTO.builder()
                .usuarioId(usuarioId)
                .xpTotal(gam.getXpTotal())
                .nivel(nivelActual)
                .xpNivelActual(xpNivelActual)
                .xpSiguienteNivel(xpSiguienteNivel)
                .xpProgreso(gam.getXpTotal() - xpNivelActual)
                .insigniasDesbloqueadas(desbloqueadas.size())
                .insigniasTotales(20)
                .ultimasInsignias(ultimas3)
                .build();
    }

    public List<InsigniaDTO> obtenerInsignias(String usuarioId) {
        List<Insignia> todas = insigniaRepo.findAll();
        List<Long> desbloqueadasIds = usuarioInsigniaRepo
                .findByUsuarioId(usuarioId)
                .stream()
                .map(ui -> ui.getInsignia().getId())
                .collect(Collectors.toList());

        return todas.stream().map(ins -> InsigniaDTO.builder()
                .id(ins.getId())
                .codigo(ins.getCodigo())
                .nombre(ins.getNombre())
                .descripcion(ins.getDescripcion())
                .icono(ins.getIcono())
                .desbloqueada(desbloqueadasIds.contains(ins.getId()))
                .build()
        ).collect(Collectors.toList());
    }

    private Gamificacion crearPerfil(String usuarioId) {
        Gamificacion g = new Gamificacion();
        g.setUsuarioId(usuarioId);
        return gamificacionRepo.save(g);
    }

    public static int xpParaNivel(int nivel) {
        int xp = 0;
        for (int i = 1; i < nivel; i++) xp += i * 100;
        return xp;
    }

    public static int calcularNivel(int xpTotal) {
        int nivel = 1;
        while (xpTotal >= xpParaNivel(nivel + 1)) nivel++;
        return nivel;
    }

    private boolean cumpleCondicion(Insignia ins, Gamificacion gam, SessionDoneEvent ev) {
        return switch (ins.getCondicion()) {
            case "PRIMERA_SESION" -> ev.getTotalSesiones() >= 1;
            case "SESIONES_10"    -> ev.getTotalSesiones() >= 10;
            case "SESIONES_50"    -> ev.getTotalSesiones() >= 50;
            case "RACHA_3"        -> ev.getRachaDias() >= 3;
            case "RACHA_7"        -> ev.getRachaDias() >= 7;
            case "RACHA_30"       -> ev.getRachaDias() >= 30;
            case "XP_500"         -> gam.getXpTotal() >= 500;
            case "XP_2000"        -> gam.getXpTotal() >= 2000;
            case "XP_5000"        -> gam.getXpTotal() >= 5000;
            case "DEEP_FOCUS"     -> "DEEP_FOCUS".equals(ev.getTipo());
            case "NIVEL_5"        -> gam.getNivel() >= 5;
            case "NIVEL_10"       -> gam.getNivel() >= 10;
            default               -> false;
        };
    }

    private InsigniaDTO toInsigniaDTO(UsuarioInsignia ui) {
        return InsigniaDTO.builder()
                .id(ui.getInsignia().getId())
                .codigo(ui.getInsignia().getCodigo())
                .nombre(ui.getInsignia().getNombre())
                .icono(ui.getInsignia().getIcono())
                .desbloqueada(true)
                .desbloqueadaAt(ui.getDesbloqueadaAt())
                .build();
    }
}