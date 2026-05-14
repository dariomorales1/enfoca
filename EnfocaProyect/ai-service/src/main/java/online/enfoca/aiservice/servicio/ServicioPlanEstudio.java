package online.enfoca.aiservice.servicio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.dominio.Modulo;
import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.dominio.Tema;
import online.enfoca.aiservice.dominio.Validacion;
import online.enfoca.aiservice.dto.*;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.ia.ServicioIa;
import online.enfoca.aiservice.ia.prompt.ConstructorPrompt;
import online.enfoca.aiservice.repositorio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ServicioPlanEstudio {

    private static final Logger log = LoggerFactory.getLogger(ServicioPlanEstudio.class);
    private static final int UMBRAL_VALIDACIONES = 50;
    private static final double UMBRAL_CONGELADO = 0.90;
    private static final double UMBRAL_MEJORA = 0.89;

    private final PlanEstudioRepositorio planRepositorio;
    private final ModuloRepositorio moduloRepositorio;
    private final TemaRepositorio temaRepositorio;
    private final ValidacionRepositorio validacionRepositorio;
    private final ServicioIa servicioIa;
    private final ConstructorPrompt constructorPrompt;
    private final ObjectMapper objectMapper;

    public ServicioPlanEstudio(PlanEstudioRepositorio planRepositorio,
                               ModuloRepositorio moduloRepositorio,
                               TemaRepositorio temaRepositorio,
                               ValidacionRepositorio validacionRepositorio,
                               ServicioIa servicioIa,
                               ConstructorPrompt constructorPrompt,
                               ObjectMapper objectMapper) {
        this.planRepositorio = planRepositorio;
        this.moduloRepositorio = moduloRepositorio;
        this.temaRepositorio = temaRepositorio;
        this.validacionRepositorio = validacionRepositorio;
        this.servicioIa = servicioIa;
        this.constructorPrompt = constructorPrompt;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PlanEstudioResponse crear(String usuarioId, CrearPlanRequest request) {
        String[] prompts = constructorPrompt.promptGeneracion(request);
        String respuestaIa = servicioIa.generar(usuarioId, prompts[0], prompts[1]);

        PlanEstudio plan = PlanEstudio.builder()
                .usuarioId(usuarioId)
                .titulo(request.materia())
                .objetivo(request.objetivo())
                .nivel(request.nivelEfectivo())
                .build();

        plan = planRepositorio.save(plan);
        plan.setModulos(parsearModulos(respuestaIa, plan));
        planRepositorio.save(plan);

        log.info("Plan creado para usuario {}: {}", usuarioId, plan.getId());
        return PlanEstudioResponse.desde(plan);
    }

    @Transactional(readOnly = true)
    public List<PlanEstudioResponse> listarDeUsuario(String usuarioId) {
        return planRepositorio.findByUsuarioIdOrderByCreadoEnDesc(usuarioId)
                .stream()
                .map(PlanEstudioResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlanEstudioResponse obtener(UUID planId, String usuarioId) {
        PlanEstudio plan = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));
        if (!usuarioId.equals(plan.getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al plan");
        }
        return PlanEstudioResponse.desde(plan);
    }

    @Transactional
    public void eliminar(UUID planId, String usuarioId) {
        PlanEstudio plan = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));
        if (!usuarioId.equals(plan.getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al plan");
        }
        planRepositorio.delete(plan);
        log.info("Plan {} eliminado por usuario {}", planId, usuarioId);
    }

    @Transactional
    public void agregarValidacion(UUID planId, String usuarioId, ValidacionRequest request) {
        PlanEstudio plan = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));

        if (plan.getEstado() == EstadoPlan.EN_MEJORA) {
            throw new IllegalStateException("El plan está en proceso de mejora y no acepta validaciones.");
        }
        if (plan.getEstado() == EstadoPlan.CONGELADO) {
            throw new IllegalStateException("El plan ya está congelado.");
        }
        if (validacionRepositorio.existsByPlanIdAndUsuarioId(planId, usuarioId)) {
            throw new IllegalStateException("Ya validaste este plan.");
        }

        Validacion validacion = Validacion.builder()
                .plan(plan)
                .usuarioId(usuarioId)
                .puntaje(request.puntaje())
                .comentario(request.comentario())
                .build();

        validacionRepositorio.save(validacion);
        plan.getValidaciones().add(validacion);
        plan.setTotalValidaciones(plan.getTotalValidaciones() + 1);
        plan.recalcularRatio();

        if (plan.getEstado() == EstadoPlan.ACTIVO) {
            plan.setEstado(EstadoPlan.EN_REVISION);
        }

        planRepositorio.save(plan);

        if (plan.getTotalValidaciones() == UMBRAL_VALIDACIONES) {
            log.info("Plan {} alcanzó {} validaciones — ejecutando auto-indexado inmediato", planId, UMBRAL_VALIDACIONES);
            evaluarPlan(plan);
        }
    }

    @Transactional
    public TemaResponse toggleTema(UUID temaId, String usuarioId) {
        Tema tema = temaRepositorio.findById(temaId)
                .orElseThrow(() -> new NoSuchElementException("Tema no encontrado: " + temaId));

        PlanEstudio plan = tema.getModulo().getPlan();
        if (!usuarioId.equals(plan.getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al tema");
        }

        boolean nuevoEstado = !tema.isCompletado();
        tema.setCompletado(nuevoEstado);
        tema.setCompletadoEn(nuevoEstado ? LocalDateTime.now() : null);
        temaRepositorio.save(tema);

        log.info("Tema {} marcado completado={} por usuario {}", temaId, nuevoEstado, usuarioId);
        return TemaResponse.desde(tema);
    }

    @Transactional(readOnly = true)
    public List<PlanEstudioResponse> obtenerCatalogo() {
        return planRepositorio.findByEstadoOrderByCreadoEnDesc(EstadoPlan.CONGELADO)
                .stream()
                .map(PlanEstudioResponse::desde)
                .toList();
    }

    @Transactional
    public void evaluarPlan(PlanEstudio plan) {
        if (plan.getEstado() == EstadoPlan.CONGELADO) return;

        double ratio = plan.getRatioValidaciones();
        log.info("Evaluando plan {} — ratio: {}", plan.getId(), ratio);

        if (ratio >= UMBRAL_CONGELADO) {
            plan.setEstado(EstadoPlan.CONGELADO);
            planRepositorio.save(plan);
            log.info("Plan {} congelado con ratio {}", plan.getId(), ratio);
        } else if (ratio < UMBRAL_MEJORA) {
            plan.setEstado(EstadoPlan.EN_MEJORA);
            planRepositorio.save(plan);
            log.info("Plan {} marcado EN_MEJORA con ratio {}", plan.getId(), ratio);
            regenerarPlan(plan);
        }
    }

    @Transactional
    public void regenerarPlan(PlanEstudio plan) {
        try {
            String planJson = objectMapper.writeValueAsString(PlanEstudioResponse.desde(plan));
            String[] prompts = constructorPrompt.promptMejora(plan, planJson);
            String respuestaIa = servicioIa.generar(plan.getUsuarioId(), prompts[0], prompts[1]);

            moduloRepositorio.deleteByPlanId(plan.getId());
            plan.getModulos().clear();

            List<Modulo> nuevosModulos = parsearModulos(respuestaIa, plan);
            plan.setModulos(nuevosModulos);
            plan.setEstado(EstadoPlan.ACTIVO);
            planRepositorio.save(plan);

            log.info("Plan {} regenerado exitosamente", plan.getId());
        } catch (Exception e) {
            log.error("Error al regenerar plan {}: {}", plan.getId(), e.getMessage());
            plan.setEstado(EstadoPlan.ACTIVO);
            planRepositorio.save(plan);
        }
    }

    private List<Modulo> parsearModulos(String respuestaIa, PlanEstudio plan) {
        List<Modulo> modulos = new ArrayList<>();
        try {
            JsonNode raiz = objectMapper.readTree(respuestaIa);
            JsonNode nodoModulos = raiz.path("modulos");

            for (JsonNode nodoModulo : nodoModulos) {
                Modulo modulo = Modulo.builder()
                        .plan(plan)
                        .orden(nodoModulo.path("orden").asInt(modulos.size() + 1))
                        .titulo(nodoModulo.path("titulo").asText("Módulo sin título"))
                        .temas(new ArrayList<>())
                        .build();

                modulo = moduloRepositorio.save(modulo);

                JsonNode nodoTemas = nodoModulo.path("temas");
                List<Tema> temas = new ArrayList<>();
                for (JsonNode nodoTema : nodoTemas) {
                    Tema tema = Tema.builder()
                            .modulo(modulo)
                            .orden(nodoTema.path("orden").asInt(temas.size() + 1))
                            .titulo(nodoTema.path("titulo").asText("Tema sin título"))
                            .pomodorosEstimados(Math.max(1, nodoTema.path("pomodoros_estimados").asInt(3)))
                            .build();
                    temas.add(temaRepositorio.save(tema));
                }
                modulo.setTemas(temas);
                modulos.add(modulo);
            }
        } catch (Exception e) {
            log.error("Error al parsear respuesta de la IA: {}", e.getMessage());
        }
        return modulos;
    }
}
