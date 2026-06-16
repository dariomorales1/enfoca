package online.enfoca.gamificationservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import online.enfoca.gamificationservice.dto.InsigniaDTO;
import online.enfoca.gamificationservice.dto.PerfilGamificacionDTO;
import online.enfoca.gamificationservice.service.GamificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class GamificationControllerTest {

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private GamificationController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private PerfilGamificacionDTO perfilBase;
    private List<InsigniaDTO> insigniasBase;

    @BeforeEach
    void setUp() {
        // standaloneSetup no carga Security, MockMvc funciona sin autenticación
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        perfilBase = PerfilGamificacionDTO.builder()
                .usuarioId("user-123")
                .xpTotal(150)
                .nivel(2)
                .xpNivelActual(100)
                .xpSiguienteNivel(300)
                .xpProgreso(50)
                .insigniasDesbloqueadas(1)
                .insigniasTotales(20)
                .ultimasInsignias(List.of())
                .build();

        InsigniaDTO ins1 = InsigniaDTO.builder()
                .id(1L)
                .codigo("PRIMERA_SESION")
                .nombre("Primera Sesión")
                .icono("trophy.svg")
                .desbloqueada(true)
                .desbloqueadaAt(LocalDateTime.now().minusDays(1))
                .build();

        InsigniaDTO ins2 = InsigniaDTO.builder()
                .id(2L)
                .codigo("SESIONES_10")
                .nombre("10 Sesiones")
                .icono("medal.svg")
                .desbloqueada(false)
                .build();

        insigniasBase = List.of(ins1, ins2);
    }

    // ---- GET /gamification/perfil ----

    @Test
    @DisplayName("GET /gamification/perfil retorna 200 con perfil del usuario autenticado")
    void obtenerPerfilPropio_retorna200() throws Exception {
        when(gamificationService.obtenerPerfil("user-123")).thenReturn(perfilBase);

        mockMvc.perform(get("/gamification/perfil")
                        .header("X-User-Id", "user-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value("user-123"))
                .andExpect(jsonPath("$.xpTotal").value(150))
                .andExpect(jsonPath("$.nivel").value(2))
                .andExpect(jsonPath("$.xpNivelActual").value(100))
                .andExpect(jsonPath("$.xpSiguienteNivel").value(300))
                .andExpect(jsonPath("$.xpProgreso").value(50))
                .andExpect(jsonPath("$.insigniasDesbloqueadas").value(1))
                .andExpect(jsonPath("$.insigniasTotales").value(20));
    }

    @Test
    @DisplayName("GET /gamification/perfil con nivel 1 y 0 XP retorna 200")
    void obtenerPerfilPropio_nivel1_retorna200() throws Exception {
        PerfilGamificacionDTO perfilNivel1 = PerfilGamificacionDTO.builder()
                .usuarioId("user-nuevo")
                .xpTotal(0)
                .nivel(1)
                .xpNivelActual(0)
                .xpSiguienteNivel(100)
                .xpProgreso(0)
                .insigniasDesbloqueadas(0)
                .insigniasTotales(20)
                .ultimasInsignias(List.of())
                .build();

        when(gamificationService.obtenerPerfil("user-nuevo")).thenReturn(perfilNivel1);

        mockMvc.perform(get("/gamification/perfil")
                        .header("X-User-Id", "user-nuevo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nivel").value(1))
                .andExpect(jsonPath("$.xpTotal").value(0))
                .andExpect(jsonPath("$.insigniasDesbloqueadas").value(0));
    }

    // ---- GET /gamification/{usuarioId}/perfil ----

    @Test
    @DisplayName("GET /gamification/user-123/perfil retorna 200 con perfil por ID")
    void obtenerPerfil_porPathVariable_retorna200() throws Exception {
        when(gamificationService.obtenerPerfil("user-123")).thenReturn(perfilBase);

        mockMvc.perform(get("/gamification/user-123/perfil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value("user-123"))
                .andExpect(jsonPath("$.xpTotal").value(150))
                .andExpect(jsonPath("$.nivel").value(2));
    }

    @Test
    @DisplayName("GET /gamification/user-456/perfil retorna 200 con perfil de otro usuario")
    void obtenerPerfil_otroUsuario_retorna200() throws Exception {
        PerfilGamificacionDTO perfilOtro = PerfilGamificacionDTO.builder()
                .usuarioId("user-456")
                .xpTotal(600)
                .nivel(4)
                .xpNivelActual(600)
                .xpSiguienteNivel(1000)
                .xpProgreso(0)
                .insigniasDesbloqueadas(3)
                .insigniasTotales(20)
                .ultimasInsignias(List.of())
                .build();

        when(gamificationService.obtenerPerfil("user-456")).thenReturn(perfilOtro);

        mockMvc.perform(get("/gamification/user-456/perfil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value("user-456"))
                .andExpect(jsonPath("$.nivel").value(4))
                .andExpect(jsonPath("$.xpTotal").value(600));
    }

    // ---- GET /gamification/{usuarioId}/insignias ----

    @Test
    @DisplayName("GET /gamification/user-123/insignias retorna 200 con lista de insignias")
    void obtenerInsignias_retorna200ConLista() throws Exception {
        when(gamificationService.obtenerInsignias("user-123")).thenReturn(insigniasBase);

        mockMvc.perform(get("/gamification/user-123/insignias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].codigo").value("PRIMERA_SESION"))
                .andExpect(jsonPath("$[0].desbloqueada").value(true))
                .andExpect(jsonPath("$[1].codigo").value("SESIONES_10"))
                .andExpect(jsonPath("$[1].desbloqueada").value(false));
    }

    @Test
    @DisplayName("GET /gamification/user-123/insignias retorna 200 con lista vacía")
    void obtenerInsignias_listaVacia_retorna200() throws Exception {
        when(gamificationService.obtenerInsignias("user-sin-insignias")).thenReturn(List.of());

        mockMvc.perform(get("/gamification/user-sin-insignias/insignias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /gamification/user-123/insignias mapea correctamente nombre e icono")
    void obtenerInsignias_mapeaAtributos() throws Exception {
        InsigniaDTO ins = InsigniaDTO.builder()
                .id(1L)
                .codigo("XP_500")
                .nombre("Acumulador")
                .icono("star.svg")
                .desbloqueada(true)
                .build();

        when(gamificationService.obtenerInsignias("user-123")).thenReturn(List.of(ins));

        mockMvc.perform(get("/gamification/user-123/insignias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Acumulador"))
                .andExpect(jsonPath("$[0].icono").value("star.svg"));
    }
}
