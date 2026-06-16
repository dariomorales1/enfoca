package online.enfoca.gamificationservice.service;

import online.enfoca.gamificationservice.dto.InsigniaDTO;
import online.enfoca.gamificationservice.dto.PerfilGamificacionDTO;
import online.enfoca.gamificationservice.dto.SessionDoneEvent;
import online.enfoca.gamificationservice.entity.Gamificacion;
import online.enfoca.gamificationservice.entity.Insignia;
import online.enfoca.gamificationservice.entity.UsuarioInsignia;
import online.enfoca.gamificationservice.repository.GamificacionRepository;
import online.enfoca.gamificationservice.repository.InsigniaRepository;
import online.enfoca.gamificationservice.repository.UsuarioInsigniaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GamificationServiceTest {

    @Mock
    private GamificacionRepository gamificacionRepo;

    @Mock
    private InsigniaRepository insigniaRepo;

    @Mock
    private UsuarioInsigniaRepository usuarioInsigniaRepo;

    @InjectMocks
    private GamificationService service;

    private Gamificacion gamificacionBase;

    // ---- Helpers ----

    private Gamificacion crearGamificacion(String usuarioId, int xpTotal, int nivel) {
        Gamificacion g = new Gamificacion();
        g.setId(1L);
        g.setUsuarioId(usuarioId);
        g.setXpTotal(xpTotal);
        g.setNivel(nivel);
        return g;
    }

    private Insignia crearInsignia(Long id, String codigo, String condicion) {
        Insignia ins = new Insignia();
        ins.setId(id);
        ins.setCodigo(codigo);
        ins.setNombre("Insignia " + codigo);
        ins.setCondicion(condicion);
        return ins;
    }

    private UsuarioInsignia crearUsuarioInsignia(String usuarioId, Insignia insignia) {
        UsuarioInsignia ui = new UsuarioInsignia();
        ui.setId(1L);
        ui.setUsuarioId(usuarioId);
        ui.setInsignia(insignia);
        ui.setDesbloqueadaAt(LocalDateTime.now());
        return ui;
    }

    private SessionDoneEvent crearEvento(int totalSesiones, int rachaDias, String tipo) {
        SessionDoneEvent ev = new SessionDoneEvent();
        ev.setUsuarioId("user-123");
        ev.setDuracion(25);
        ev.setTipo(tipo);
        ev.setRachaDias(rachaDias);
        ev.setTotalSesiones(totalSesiones);
        return ev;
    }

    @BeforeEach
    void setUp() {
        gamificacionBase = crearGamificacion("user-123", 0, 1);
    }

    // ============================================================
    // xpParaNivel y calcularNivel (métodos estáticos)
    // ============================================================

    @Test
    @DisplayName("xpParaNivel(1) retorna 0")
    void xpParaNivel_nivel1_retorna0() {
        assertThat(GamificationService.xpParaNivel(1)).isEqualTo(0);
    }

    @Test
    @DisplayName("xpParaNivel(2) retorna 100")
    void xpParaNivel_nivel2_retorna100() {
        assertThat(GamificationService.xpParaNivel(2)).isEqualTo(100);
    }

    @Test
    @DisplayName("xpParaNivel(3) retorna 300")
    void xpParaNivel_nivel3_retorna300() {
        assertThat(GamificationService.xpParaNivel(3)).isEqualTo(300);
    }

    @Test
    @DisplayName("xpParaNivel(4) retorna 600")
    void xpParaNivel_nivel4_retorna600() {
        assertThat(GamificationService.xpParaNivel(4)).isEqualTo(600);
    }

    @Test
    @DisplayName("calcularNivel(0) retorna 1")
    void calcularNivel_xp0_retornaNivel1() {
        assertThat(GamificationService.calcularNivel(0)).isEqualTo(1);
    }

    @Test
    @DisplayName("calcularNivel(99) retorna 1")
    void calcularNivel_xp99_retornaNivel1() {
        assertThat(GamificationService.calcularNivel(99)).isEqualTo(1);
    }

    @Test
    @DisplayName("calcularNivel(100) retorna 2")
    void calcularNivel_xp100_retornaNivel2() {
        assertThat(GamificationService.calcularNivel(100)).isEqualTo(2);
    }

    @Test
    @DisplayName("calcularNivel(300) retorna 3")
    void calcularNivel_xp300_retornaNivel3() {
        assertThat(GamificationService.calcularNivel(300)).isEqualTo(3);
    }

    @Test
    @DisplayName("calcularNivel(600) retorna 4")
    void calcularNivel_xp600_retornaNivel4() {
        assertThat(GamificationService.calcularNivel(600)).isEqualTo(4);
    }

    // ============================================================
    // sumarXP
    // ============================================================

    @Test
    @DisplayName("sumarXP agrega XP al perfil existente y recalcula nivel")
    void sumarXP_perfilExistente_sumaCorrecto() {
        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(gamificacionRepo.save(any(Gamificacion.class))).thenAnswer(inv -> inv.getArgument(0));

        service.sumarXP("user-123", 150);

        verify(gamificacionRepo).save(argThat(g ->
                g.getXpTotal() == 150 && g.getNivel() == 2
        ));
    }

    @Test
    @DisplayName("sumarXP crea perfil nuevo si no existe y suma XP")
    void sumarXP_perfilNuevo_creaYSuma() {
        Gamificacion nuevo = crearGamificacion("user-nuevo", 0, 1);
        when(gamificacionRepo.findByUsuarioId("user-nuevo")).thenReturn(Optional.empty());
        when(gamificacionRepo.save(any(Gamificacion.class))).thenReturn(nuevo);

        service.sumarXP("user-nuevo", 50);

        // Se llama a save al menos una vez (crearPerfil + update)
        verify(gamificacionRepo, atLeast(1)).save(any(Gamificacion.class));
    }

    @Test
    @DisplayName("sumarXP con 0 XP no cambia nivel")
    void sumarXP_ceroXP_noModificaNivel() {
        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(gamificacionRepo.save(any(Gamificacion.class))).thenAnswer(inv -> inv.getArgument(0));

        service.sumarXP("user-123", 0);

        verify(gamificacionRepo).save(argThat(g ->
                g.getXpTotal() == 0 && g.getNivel() == 1
        ));
    }

    @Test
    @DisplayName("sumarXP con 300 XP sube a nivel 3")
    void sumarXP_300XP_nivel3() {
        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(gamificacionRepo.save(any(Gamificacion.class))).thenAnswer(inv -> inv.getArgument(0));

        service.sumarXP("user-123", 300);

        verify(gamificacionRepo).save(argThat(g ->
                g.getXpTotal() == 300 && g.getNivel() == 3
        ));
    }

    // ============================================================
    // verificarInsignias
    // ============================================================

    @Test
    @DisplayName("verificarInsignias desbloquea PRIMERA_SESION cuando totalSesiones >= 1")
    void verificarInsignias_primeraSesion_desbloquea() {
        Insignia ins = crearInsignia(1L, "PRIMERA_SESION", "PRIMERA_SESION");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(argThat(ui ->
                ui.getInsignia().getId().equals(1L) && ui.getUsuarioId().equals("user-123")
        ));
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea si ya fue desbloqueada")
    void verificarInsignias_yaDesbloqueada_noVuelveADesbloquear() {
        Insignia ins = crearInsignia(1L, "PRIMERA_SESION", "PRIMERA_SESION");
        UsuarioInsignia yaDesbloqueada = crearUsuarioInsignia("user-123", ins);
        SessionDoneEvent event = crearEvento(5, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of(yaDesbloqueada));

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea RACHA_7 cuando rachaDias >= 7")
    void verificarInsignias_racha7_desbloquea() {
        Insignia ins = crearInsignia(2L, "RACHA_7", "RACHA_7");
        SessionDoneEvent event = crearEvento(1, 7, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea RACHA_30 cuando rachaDias es 7")
    void verificarInsignias_racha30_noDesbloqueaConRacha7() {
        Insignia ins = crearInsignia(3L, "RACHA_30", "RACHA_30");
        SessionDoneEvent event = crearEvento(1, 7, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea DEEP_FOCUS cuando tipo es DEEP_FOCUS")
    void verificarInsignias_deepFocus_desbloquea() {
        Insignia ins = crearInsignia(4L, "DEEP_FOCUS", "DEEP_FOCUS");
        SessionDoneEvent event = crearEvento(1, 0, "DEEP_FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea XP_500 cuando xpTotal >= 500")
    void verificarInsignias_xp500_desbloquea() {
        Gamificacion gam500 = crearGamificacion("user-123", 500, 2);
        Insignia ins = crearInsignia(5L, "XP_500", "XP_500");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam500));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea XP_2000 con solo 500 XP")
    void verificarInsignias_xp2000_noDesbloqueaCon500() {
        Gamificacion gam500 = crearGamificacion("user-123", 500, 2);
        Insignia ins = crearInsignia(6L, "XP_2000", "XP_2000");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam500));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea NIVEL_5 cuando nivel >= 5")
    void verificarInsignias_nivel5_desbloquea() {
        Gamificacion gam = crearGamificacion("user-123", 1000, 5);
        Insignia ins = crearInsignia(7L, "NIVEL_5", "NIVEL_5");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias ignora insignias con condición null")
    void verificarInsignias_condicionNull_noDesbloquea() {
        Insignia ins = crearInsignia(8L, "SIN_CONDICION", null);
        SessionDoneEvent event = crearEvento(10, 10, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea SESIONES_50 con solo 10 sesiones")
    void verificarInsignias_sesiones50_noDesbloqueaCon10() {
        Insignia ins = crearInsignia(9L, "SESIONES_50", "SESIONES_50");
        SessionDoneEvent event = crearEvento(10, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea SESIONES_10 con 10 sesiones")
    void verificarInsignias_sesiones10_desbloquea() {
        Insignia ins = crearInsignia(10L, "SESIONES_10", "SESIONES_10");
        SessionDoneEvent event = crearEvento(10, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    // ============================================================
    // obtenerPerfil
    // ============================================================

    @Test
    @DisplayName("obtenerPerfil retorna DTO correcto para usuario con XP")
    void obtenerPerfil_retornaDTOCorrecto() {
        Gamificacion gam = crearGamificacion("user-123", 150, 2);
        Insignia ins = crearInsignia(1L, "PRIMERA_SESION", "PRIMERA_SESION");
        UsuarioInsignia ui = crearUsuarioInsignia("user-123", ins);

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of(ui));

        PerfilGamificacionDTO perfil = service.obtenerPerfil("user-123");

        assertThat(perfil.getUsuarioId()).isEqualTo("user-123");
        assertThat(perfil.getXpTotal()).isEqualTo(150);
        assertThat(perfil.getNivel()).isEqualTo(2);
        assertThat(perfil.getXpNivelActual()).isEqualTo(100);  // xpParaNivel(2)
        assertThat(perfil.getXpSiguienteNivel()).isEqualTo(300); // xpParaNivel(3)
        assertThat(perfil.getXpProgreso()).isEqualTo(50); // 150 - 100
        assertThat(perfil.getInsigniasDesbloqueadas()).isEqualTo(1);
        assertThat(perfil.getInsigniasTotales()).isEqualTo(20);
    }

    @Test
    @DisplayName("obtenerPerfil para usuario sin insignias retorna lista vacía de últimas insignias")
    void obtenerPerfil_sinInsignias_ultimasVacias() {
        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        PerfilGamificacionDTO perfil = service.obtenerPerfil("user-123");

        assertThat(perfil.getInsigniasDesbloqueadas()).isEqualTo(0);
        assertThat(perfil.getUltimasInsignias()).isEmpty();
    }

    @Test
    @DisplayName("obtenerPerfil muestra solo las últimas 3 insignias")
    void obtenerPerfil_masde3insignias_muestraSolo3() {
        Gamificacion gam = crearGamificacion("user-123", 600, 4);

        // Crear 4 insignias con tiempos distintos
        Insignia ins1 = crearInsignia(1L, "INS_1", "PRIMERA_SESION");
        Insignia ins2 = crearInsignia(2L, "INS_2", "SESIONES_10");
        Insignia ins3 = crearInsignia(3L, "INS_3", "RACHA_3");
        Insignia ins4 = crearInsignia(4L, "INS_4", "XP_500");

        UsuarioInsignia ui1 = new UsuarioInsignia();
        ui1.setId(1L); ui1.setUsuarioId("user-123"); ui1.setInsignia(ins1);
        ui1.setDesbloqueadaAt(LocalDateTime.now().minusDays(4));

        UsuarioInsignia ui2 = new UsuarioInsignia();
        ui2.setId(2L); ui2.setUsuarioId("user-123"); ui2.setInsignia(ins2);
        ui2.setDesbloqueadaAt(LocalDateTime.now().minusDays(3));

        UsuarioInsignia ui3 = new UsuarioInsignia();
        ui3.setId(3L); ui3.setUsuarioId("user-123"); ui3.setInsignia(ins3);
        ui3.setDesbloqueadaAt(LocalDateTime.now().minusDays(2));

        UsuarioInsignia ui4 = new UsuarioInsignia();
        ui4.setId(4L); ui4.setUsuarioId("user-123"); ui4.setInsignia(ins4);
        ui4.setDesbloqueadaAt(LocalDateTime.now().minusDays(1));

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of(ui1, ui2, ui3, ui4));

        PerfilGamificacionDTO perfil = service.obtenerPerfil("user-123");

        assertThat(perfil.getUltimasInsignias()).hasSize(3);
        assertThat(perfil.getInsigniasDesbloqueadas()).isEqualTo(4);
    }

    // ============================================================
    // obtenerInsignias
    // ============================================================

    @Test
    @DisplayName("obtenerInsignias retorna todas las insignias con estado desbloqueado correcto")
    void obtenerInsignias_retornaEstadoCorrecto() {
        Insignia ins1 = crearInsignia(1L, "PRIMERA_SESION", "PRIMERA_SESION");
        Insignia ins2 = crearInsignia(2L, "SESIONES_10", "SESIONES_10");
        UsuarioInsignia ui = crearUsuarioInsignia("user-123", ins1);

        when(insigniaRepo.findAll()).thenReturn(List.of(ins1, ins2));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of(ui));

        List<InsigniaDTO> resultado = service.obtenerInsignias("user-123");

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getDesbloqueada()).isTrue();
        assertThat(resultado.get(1).getDesbloqueada()).isFalse();
    }

    @Test
    @DisplayName("obtenerInsignias retorna lista vacía cuando no hay insignias en el sistema")
    void obtenerInsignias_sinInsigniasEnSistema_listaVacia() {
        when(insigniaRepo.findAll()).thenReturn(List.of());
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        List<InsigniaDTO> resultado = service.obtenerInsignias("user-123");

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("obtenerInsignias mapea correctamente codigo, nombre e icono")
    void obtenerInsignias_mapeaAtributosCorrectamente() {
        Insignia ins = crearInsignia(1L, "XP_500", "XP_500");
        ins.setDescripcion("Acumular 500 XP");
        ins.setIcono("star.svg");

        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        List<InsigniaDTO> resultado = service.obtenerInsignias("user-123");

        assertThat(resultado).hasSize(1);
        InsigniaDTO dto = resultado.get(0);
        assertThat(dto.getCodigo()).isEqualTo("XP_500");
        assertThat(dto.getNombre()).isEqualTo("Insignia XP_500");
        assertThat(dto.getDescripcion()).isEqualTo("Acumular 500 XP");
        assertThat(dto.getIcono()).isEqualTo("star.svg");
        assertThat(dto.getDesbloqueada()).isFalse();
    }

    // ============================================================
    // condiciones adicionales
    // ============================================================

    @Test
    @DisplayName("verificarInsignias desbloquea RACHA_3 cuando rachaDias >= 3")
    void verificarInsignias_racha3_desbloquea() {
        Insignia ins = crearInsignia(11L, "RACHA_3", "RACHA_3");
        SessionDoneEvent event = crearEvento(1, 3, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea SESIONES_50 con 50 sesiones")
    void verificarInsignias_sesiones50_desbloquea() {
        Insignia ins = crearInsignia(12L, "SESIONES_50", "SESIONES_50");
        SessionDoneEvent event = crearEvento(50, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea XP_5000 con 5000 XP")
    void verificarInsignias_xp5000_desbloquea() {
        Gamificacion gam5000 = crearGamificacion("user-123", 5000, 9);
        Insignia ins = crearInsignia(13L, "XP_5000", "XP_5000");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam5000));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea NIVEL_10 cuando nivel >= 10")
    void verificarInsignias_nivel10_desbloquea() {
        Gamificacion gam = crearGamificacion("user-123", 4500, 10);
        Insignia ins = crearInsignia(14L, "NIVEL_10", "NIVEL_10");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea NIVEL_10 cuando nivel es 5")
    void verificarInsignias_nivel10_noDesbloqueaConNivel5() {
        Gamificacion gam = crearGamificacion("user-123", 1000, 5);
        Insignia ins = crearInsignia(15L, "NIVEL_10", "NIVEL_10");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias no desbloquea condición desconocida (default false)")
    void verificarInsignias_condicionDesconocida_noDesbloquea() {
        Insignia ins = crearInsignia(16L, "CONDICION_RARA", "CONDICION_DESCONOCIDA");
        SessionDoneEvent event = crearEvento(100, 100, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo, never()).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea XP_2000 cuando xpTotal >= 2000")
    void verificarInsignias_xp2000_desbloquea() {
        Gamificacion gam2000 = crearGamificacion("user-123", 2000, 5);
        Insignia ins = crearInsignia(17L, "XP_2000", "XP_2000");
        SessionDoneEvent event = crearEvento(1, 0, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gam2000));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }

    @Test
    @DisplayName("verificarInsignias desbloquea RACHA_30 cuando rachaDias >= 30")
    void verificarInsignias_racha30_desbloquea() {
        Insignia ins = crearInsignia(18L, "RACHA_30", "RACHA_30");
        SessionDoneEvent event = crearEvento(1, 30, "FOCUS");

        when(gamificacionRepo.findByUsuarioId("user-123")).thenReturn(Optional.of(gamificacionBase));
        when(insigniaRepo.findAll()).thenReturn(List.of(ins));
        when(usuarioInsigniaRepo.findByUsuarioId("user-123")).thenReturn(List.of());

        service.verificarInsignias("user-123", event);

        verify(usuarioInsigniaRepo).save(any());
    }
}
