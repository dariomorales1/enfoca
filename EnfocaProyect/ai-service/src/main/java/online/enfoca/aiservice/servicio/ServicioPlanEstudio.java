package online.enfoca.aiservice.servicio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.enfoca.aiservice.dominio.*;
import online.enfoca.aiservice.dto.*;
import online.enfoca.aiservice.repositorio.FeedbackRepositorio;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.ia.ServicioIa;
import online.enfoca.aiservice.ia.prompt.ConstructorPrompt;
import online.enfoca.aiservice.repositorio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import online.enfoca.aiservice.dto.ProgramacionCalendarioDTO;
import online.enfoca.aiservice.dto.TemaCalendarioDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Arrays;
import java.util.stream.Collectors;

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
    private final ProgramacionRepositorio programacionRepositorio;
    private final FeedbackRepositorio feedbackRepositorio;
    private final ServicioIa servicioIa;
    private final ConstructorPrompt constructorPrompt;
    private final ObjectMapper objectMapper;

    public ServicioPlanEstudio(PlanEstudioRepositorio planRepositorio,
                               ModuloRepositorio moduloRepositorio,
                               TemaRepositorio temaRepositorio,
                               ValidacionRepositorio validacionRepositorio,
                               ProgramacionRepositorio programacionRepositorio,
                               FeedbackRepositorio feedbackRepositorio,
                               ServicioIa servicioIa,
                               ConstructorPrompt constructorPrompt,
                               ObjectMapper objectMapper) {
        this.planRepositorio = planRepositorio;
        this.moduloRepositorio = moduloRepositorio;
        this.temaRepositorio = temaRepositorio;
        this.validacionRepositorio = validacionRepositorio;
        this.programacionRepositorio = programacionRepositorio;
        this.feedbackRepositorio = feedbackRepositorio;
        this.servicioIa = servicioIa;
        this.constructorPrompt = constructorPrompt;
        this.objectMapper = objectMapper;
    }

    private static final String[] PALETA_COLORES = {
        "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
        "#ef4444", "#ec4899", "#3b82f6", "#f97316"
    };

    private static final Set<String> STOPWORDS = Set.of(
        "de","del","la","el","en","con","para","los","las","un","una","y","o",
        "que","a","al","se","su","por","es","son","mas","mi","mis","este","esta",
        "the","of","in","and","or","for","to","an","is","are","my","with","how"
    );

    @Transactional
    public PlanEstudioResponse crear(String usuarioId, CrearPlanRequest request) {
        Optional<PlanEstudio> maestro = buscarMaestroRelevante(request.materia(), usuarioId);

        if (maestro.isPresent()) {
            PlanEstudio original = maestro.get();
            log.info("Plan relevante encontrado ({}) para '{}', clonando para usuario {}",
                    original.getId(), request.materia(), usuarioId);
            return clonar(original.getId(), usuarioId);
        }

        // No existe — generar con IA
        String[] prompts = constructorPrompt.promptGeneracion(request);
        String respuestaIa = servicioIa.generar(usuarioId, prompts[0], prompts[1]);

        long totalPlanes = planRepositorio.countByUsuarioId(usuarioId);
        String color = PALETA_COLORES[(int)(totalPlanes % PALETA_COLORES.length)];

        PlanEstudio plan = PlanEstudio.builder()
                .usuarioId(usuarioId)
                .titulo(request.materia())
                .objetivo(request.objetivo())
                .nivel(request.nivelEfectivo())
                .color(color)
                .build();

        plan = planRepositorio.save(plan);
        plan.setModulos(parsearModulos(respuestaIa, plan));
        planRepositorio.save(plan);

        log.info("Nuevo plan generado con IA para usuario {}: {}", usuarioId, plan.getId());
        return PlanEstudioResponse.desde(plan);
    }

    // Busca el plan maestro más relevante comparando todas las keywords de la consulta
    private Optional<PlanEstudio> buscarMaestroRelevante(String materia, String usuarioId) {
        List<String> keywords = extraerKeywords(materia);
        if (keywords.isEmpty()) return Optional.empty();

        // Recolectar candidatos únicos de todas las keywords
        Map<UUID, PlanEstudio> vistos = new LinkedHashMap<>();
        for (String kw : keywords) {
            planRepositorio.findMaestrosPorKeyword(kw).stream()
                    .filter(p -> !usuarioId.equals(p.getUsuarioId()))
                    .forEach(p -> vistos.putIfAbsent(p.getId(), p));
        }

        if (vistos.isEmpty()) return Optional.empty();

        // Puntuar cada candidato: keywords que aparecen en su título u objetivo
        return vistos.values().stream()
                .max(Comparator.comparingLong((PlanEstudio p) -> {
                    String haystack = normalizar(p.getTitulo() + " " + (p.getObjetivo() != null ? p.getObjetivo() : ""));
                    return keywords.stream().filter(haystack::contains).count();
                }).thenComparingInt(p -> switch (p.getEstado()) {
                    case CONGELADO   -> 2;
                    case EN_REVISION -> 1;
                    default          -> 0;
                }).thenComparingInt(PlanEstudio::getTotalValidaciones));
    }

    private List<String> extraerKeywords(String materia) {
        return Arrays.stream(normalizar(materia).split("\\s+"))
                .filter(w -> w.length() > 2 && !STOPWORDS.contains(w))
                .distinct()
                .collect(Collectors.toList());
    }

    private String normalizar(String texto) {
        return texto.toLowerCase()
                .replaceAll("[áàâä]", "a").replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i").replaceAll("[óòôö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("[^a-z0-9 ]", "")
                .trim();
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
        boolean esPropietario = usuarioId.equals(plan.getUsuarioId());
        boolean esComunitario = "comunidad".equals(plan.getUsuarioId());
        if (!esPropietario && !esComunitario) {
            throw new SecurityException("Acceso no autorizado al plan");
        }
        return PlanEstudioResponse.desde(plan, usuarioId);
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

    private static final double UMBRAL_DESCATALOGADO = 0.65;
    private static final int    MIN_VOTOS_DESCATALOGADO = 20;

    private static final int UMBRAL_FEEDBACK_MAESTRO = 10;

    private static final Map<String, String> MOTIVO_LABEL = Map.of(
        "MUY_BASICO",        "Muy básico para mi nivel",
        "MUY_AVANZADO",      "Demasiado avanzado",
        "MAL_ESTRUCTURADO",  "Mal estructurado / sin orden lógico",
        "MUY_EXTENSO",       "Demasiado extenso",
        "FUERA_DE_TEMA",     "Se desvió del tema",
        "OTRO",              "Otro motivo"
    );

    @Transactional
    public PlanEstudioResponse registrarFeedback(UUID planId, String usuarioId, FeedbackRequest request) {
        PlanEstudio plan = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));

        if (!usuarioId.equals(plan.getUsuarioId())) {
            throw new SecurityException("Solo puedes mejorar tu propio plan.");
        }

        // El maestro es el original (o el plan mismo si no es clon)
        UUID maestroId = plan.getOriginalPlanId() != null ? plan.getOriginalPlanId() : planId;

        if (feedbackRepositorio.existsByPlanMaestroIdAndUsuarioId(maestroId, usuarioId)) {
            throw new IllegalStateException("Ya enviaste feedback para este plan.");
        }

        // 1. Guardar feedback asociado al maestro
        feedbackRepositorio.save(FeedbackPlan.builder()
                .planMaestroId(maestroId)
                .usuarioId(usuarioId)
                .motivo(request.motivo())
                .detalle(request.detalle())
                .build());

        // 2. Mejorar la copia personal del usuario con IA
        String planJson;
        try { planJson = objectMapper.writeValueAsString(PlanEstudioResponse.desde(plan)); }
        catch (Exception e) { planJson = "{}"; }
        String motivoLabel = MOTIVO_LABEL.getOrDefault(request.motivo(), request.motivo());
        String[] prompts = constructorPrompt.promptMejoraPersonal(planJson, request.motivo(), motivoLabel, request.detalle());
        String respuestaIa = servicioIa.generar(usuarioId, prompts[0], prompts[1]);

        moduloRepositorio.deleteByPlanId(planId);
        plan.getModulos().clear();
        plan.setModulos(parsearModulos(respuestaIa, plan));
        planRepositorio.save(plan);

        log.info("Feedback registrado y plan {} mejorado para usuario {}", planId, usuarioId);

        // 3. Verificar si el maestro necesita regeneración por acumulación de feedbacks
        verificarUmbralFeedback(maestroId);

        return PlanEstudioResponse.desde(plan, usuarioId);
    }

    private void verificarUmbralFeedback(UUID maestroId) {
        long totalFeedbacks = feedbackRepositorio.countByPlanMaestroId(maestroId);
        if (totalFeedbacks < UMBRAL_FEEDBACK_MAESTRO) return;

        PlanEstudio maestro = planRepositorio.findById(maestroId).orElse(null);
        if (maestro == null || maestro.getEstado() == EstadoPlan.EN_MEJORA) return;

        // Construir resumen de feedbacks para el prompt
        List<Object[]> rows = feedbackRepositorio.findMotivoYDetalleByPlanMaestroId(maestroId);
        Map<String, Long> conteo = rows.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        r -> (String) r[0], java.util.stream.Collectors.counting()));

        StringBuilder resumen = new StringBuilder();
        conteo.forEach((motivo, count) ->
                resumen.append("- ").append(MOTIVO_LABEL.getOrDefault(motivo, motivo))
                       .append(": ").append(count).append(" usuarios\n"));

        rows.stream()
            .filter(r -> r[1] != null && !((String) r[1]).isBlank())
            .limit(5)
            .forEach(r -> resumen.append("  Detalle: \"").append(r[1]).append("\"\n"));

        log.info("Maestro {} superó {} feedbacks — regenerando", maestroId, UMBRAL_FEEDBACK_MAESTRO);
        maestro.setEstado(EstadoPlan.EN_MEJORA);
        planRepositorio.save(maestro);

        try {
            String planJson = objectMapper.writeValueAsString(PlanEstudioResponse.desde(maestro));
            String[] prompts = constructorPrompt.promptMejoraComunitaria(planJson, resumen.toString());
            String respuestaIa = servicioIa.generar(maestro.getUsuarioId(), prompts[0], prompts[1]);

            moduloRepositorio.deleteByPlanId(maestroId);
            maestro.getModulos().clear();
            maestro.setModulos(parsearModulos(respuestaIa, maestro));
            maestro.setEstado(EstadoPlan.ACTIVO);
            maestro.setTotalValidaciones(0);
            maestro.setRatioValidaciones(0.0);
            planRepositorio.save(maestro);

            log.info("Maestro {} regenerado exitosamente con feedbacks comunitarios", maestroId);
        } catch (Exception e) {
            log.error("Error regenerando maestro {}: {}", maestroId, e.getMessage());
            maestro.setEstado(EstadoPlan.ACTIVO);
            planRepositorio.save(maestro);
        }
    }

    @Transactional(readOnly = true)
    public List<PlanEstudioResponse> listarEnRevision(String usuarioId) {
        return planRepositorio.findEnRevisionParaUsuario(usuarioId)
                .stream()
                .map(p -> PlanEstudioResponse.desde(p, usuarioId))
                .toList();
    }

    @Transactional
    public void agregarValidacion(UUID planId, String usuarioId, ValidacionRequest request) {
        PlanEstudio plan = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));

        // Si el usuario valida su clon, redirigir al plan original para acumular correctamente
        final UUID planIdEfectivo;
        if (plan.getOriginalPlanId() != null) {
            planIdEfectivo = plan.getOriginalPlanId();
            plan = planRepositorio.findById(planIdEfectivo)
                    .orElseThrow(() -> new NoSuchElementException("Plan original no encontrado"));
        } else {
            planIdEfectivo = planId;
        }

        if (plan.getEstado() == EstadoPlan.EN_MEJORA) {
            throw new IllegalStateException("El plan está en proceso de mejora y no acepta valoraciones.");
        }
        if (usuarioId.equals(plan.getUsuarioId())) {
            throw new IllegalStateException("No puedes valorar tu propio plan.");
        }
        if (validacionRepositorio.existsByPlanIdAndUsuarioId(planIdEfectivo, usuarioId)) {
            throw new IllegalStateException("Ya valoraste este plan.");
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

        if (plan.getEstado() == EstadoPlan.CONGELADO) {
            // Plan comunitario: descatalogar si el ratio cae demasiado
            if (plan.getTotalValidaciones() >= MIN_VOTOS_DESCATALOGADO
                    && plan.getRatioValidaciones() < UMBRAL_DESCATALOGADO) {
                plan.setEstado(EstadoPlan.EN_REVISION);
                log.info("Plan {} descatalogado — ratio {}", planId, plan.getRatioValidaciones());
            }
        } else {
            if (plan.getEstado() == EstadoPlan.ACTIVO) {
                plan.setEstado(EstadoPlan.EN_REVISION);
            }
            if (plan.getTotalValidaciones() >= UMBRAL_VALIDACIONES) {
                log.info("Plan {} alcanzó {} validaciones — ejecutando auto-indexado", planId, UMBRAL_VALIDACIONES);
                evaluarPlan(plan);
                return;
            }
        }

        planRepositorio.save(plan);
    }

    @Transactional
    public ToggleTemaResponse toggleTema(UUID temaId, String usuarioId) {
        Tema tema = temaRepositorio.findById(temaId)
                .orElseThrow(() -> new NoSuchElementException("Tema no encontrado: " + temaId));

        Modulo modulo = tema.getModulo();
        PlanEstudio plan = modulo.getPlan();
        if (!usuarioId.equals(plan.getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al tema");
        }

        boolean nuevoEstado = !tema.isCompletado();
        tema.setCompletado(nuevoEstado);
        tema.setCompletadoEn(nuevoEstado ? LocalDateTime.now() : null);
        temaRepositorio.save(tema);

        // Verificar si el módulo quedó completamente terminado
        boolean moduloCompletado = modulo.getTemas().stream().allMatch(Tema::isCompletado);

        log.info("Tema {} marcado completado={} por usuario {} — módulo completado: {}", temaId, nuevoEstado, usuarioId, moduloCompletado);
        return new ToggleTemaResponse(TemaResponse.desde(tema), moduloCompletado, modulo.getId(), modulo.getTitulo());
    }

    @Transactional(readOnly = true)
    public CuestionarioResponse generarCuestionario(UUID moduloId, String usuarioId) {
        Modulo modulo = moduloRepositorio.findById(moduloId)
                .orElseThrow(() -> new NoSuchElementException("Módulo no encontrado: " + moduloId));

        if (!usuarioId.equals(modulo.getPlan().getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al módulo");
        }

        String temasLista = modulo.getTemas().stream()
                .map(t -> "- " + t.getTitulo())
                .collect(Collectors.joining("\n"));

        String[] prompts = constructorPrompt.promptCuestionario(modulo.getTitulo(), temasLista);
        String respuestaIa = servicioIa.generar(usuarioId, prompts[0], prompts[1]);

        try {
            JsonNode raiz = objectMapper.readTree(respuestaIa);
            JsonNode nodoPreguntas = raiz.path("preguntas");
            List<CuestionarioResponse.PreguntaDTO> preguntas = new ArrayList<>();

            for (JsonNode nodo : nodoPreguntas) {
                List<String> opciones = new ArrayList<>();
                nodo.path("opciones").forEach(o -> opciones.add(o.asText()));
                preguntas.add(new CuestionarioResponse.PreguntaDTO(
                        nodo.path("texto").asText(),
                        opciones,
                        nodo.path("respuesta_correcta").asInt(0),
                        nodo.path("explicacion").asText("")
                ));
            }
            return new CuestionarioResponse(moduloId, modulo.getTitulo(), preguntas);
        } catch (Exception e) {
            log.error("Error al parsear cuestionario para módulo {}: {}", moduloId, e.getMessage());
            throw new RuntimeException("Error al generar el cuestionario");
        }
    }

    @Transactional
    public PlanEstudioResponse clonar(UUID planId, String usuarioId) {
        PlanEstudio original = planRepositorio.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan no encontrado: " + planId));
        if (original.getEstado() != EstadoPlan.CONGELADO) {
            throw new IllegalStateException("Solo se pueden agregar planes de la biblioteca comunitaria.");
        }

        long totalPlanes = planRepositorio.countByUsuarioId(usuarioId);
        String color = PALETA_COLORES[(int)(totalPlanes % PALETA_COLORES.length)];

        // El originalPlanId apunta siempre al plan raíz (sin clonar)
        UUID originalId = original.getOriginalPlanId() != null ? original.getOriginalPlanId() : original.getId();

        PlanEstudio copia = PlanEstudio.builder()
                .usuarioId(usuarioId)
                .titulo(original.getTitulo())
                .objetivo(original.getObjetivo())
                .nivel(original.getNivel())
                .color(color)
                .originalPlanId(originalId)
                .build();

        copia = planRepositorio.save(copia);

        List<Modulo> modulos = new ArrayList<>();
        for (Modulo modOrig : original.getModulos()) {
            Modulo mod = Modulo.builder()
                    .plan(copia)
                    .orden(modOrig.getOrden())
                    .titulo(modOrig.getTitulo())
                    .temas(new ArrayList<>())
                    .build();
            mod = moduloRepositorio.save(mod);

            List<Tema> temas = new ArrayList<>();
            for (Tema temaOrig : modOrig.getTemas()) {
                Tema tema = Tema.builder()
                        .modulo(mod)
                        .orden(temaOrig.getOrden())
                        .titulo(temaOrig.getTitulo())
                        .pomodorosEstimados(temaOrig.getPomodorosEstimados())
                        .guiaSocratica(temaOrig.getGuiaSocratica())
                        .subtemas(temaOrig.getSubtemas())
                        .build();
                temas.add(temaRepositorio.save(tema));
            }
            mod.setTemas(temas);
            modulos.add(mod);
        }
        copia.setModulos(modulos);
        planRepositorio.save(copia);

        log.info("Plan comunitario {} clonado para usuario {} → nuevo plan {}", planId, usuarioId, copia.getId());
        return PlanEstudioResponse.desde(copia);
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
                    String guiaSocratica = null;
                    JsonNode nodoGuia = nodoTema.path("guia_socratica");
                    if (!nodoGuia.isMissingNode() && !nodoGuia.isNull()) {
                        try { guiaSocratica = objectMapper.writeValueAsString(nodoGuia); } catch (Exception ignored) {}
                    }
                    String subtemas = null;
                    JsonNode nodoSubtemas = nodoTema.path("subtemas");
                    if (!nodoSubtemas.isMissingNode() && !nodoSubtemas.isNull() && nodoSubtemas.isArray()) {
                        try { subtemas = objectMapper.writeValueAsString(nodoSubtemas); } catch (Exception ignored) {}
                    }
                    Tema tema = Tema.builder()
                            .modulo(modulo)
                            .orden(nodoTema.path("orden").asInt(temas.size() + 1))
                            .titulo(nodoTema.path("titulo").asText("Tema sin título"))
                            .pomodorosEstimados(Math.max(1, nodoTema.path("pomodoros_estimados").asInt(3)))
                            .guiaSocratica(guiaSocratica)
                            .subtemas(subtemas)
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

    @Transactional
    public void programarFechasTema(UUID temaId, String usuarioId, ProgramarTemaRequest request) {
        Tema tema = temaRepositorio.findById(temaId)
                .orElseThrow(() -> new NoSuchElementException("Tema no encontrado: " + temaId));

        if (!usuarioId.equals(tema.getModulo().getPlan().getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al tema");
        }

        // Limpiamos las fechas anteriores que tuviera este tema para sobrescribir con la nueva "alarma"
        tema.getProgramaciones().clear();

        // Agregamos las nuevas fechas
        for (LocalDate fecha : request.fechas()) {
            Programacion prog = Programacion.builder()
                    .tema(tema)
                    .fecha(fecha)
                    .build();
            tema.getProgramaciones().add(prog);
        }

        temaRepositorio.save(tema);
        log.info("Tema {} programado para {} fechas por el usuario {}", temaId, request.fechas().size(), usuarioId);
    }

    public List<ProgramacionCalendarioDTO> obtenerCalendario(String usuarioId, LocalDate fechaInicio, LocalDate fechaFin) {
        List<Programacion> programaciones = programacionRepositorio
                .findByUsuarioIdAndFechaBetween(usuarioId, fechaInicio, fechaFin);

        Map<LocalDate, List<Programacion>> porFecha = programaciones.stream()
                .collect(Collectors.groupingBy(Programacion::getFecha));

        return porFecha.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    List<TemaCalendarioDTO> temas = entry.getValue().stream()
                            .map(p -> new TemaCalendarioDTO(
                                    p.getTema().getId(),
                                    p.getTema().getTitulo(),
                                    p.getTema().getModulo().getTitulo(),
                                    p.getTema().getModulo().getPlan().getTitulo(),
                                    p.getTema().getModulo().getPlan().getColor(),
                                    p.getTema().isCompletado(),
                                    p.getTema().getPomodorosCompletados(),
                                    p.getTema().getPomodorosEstimados()))
                            .collect(Collectors.toList());
                    return new ProgramacionCalendarioDTO(entry.getKey().toString(), temas);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarProgramacion(UUID temaId, String usuarioId, LocalDate fecha) {
        Tema tema = temaRepositorio.findById(temaId)
                .orElseThrow(() -> new NoSuchElementException("Tema no encontrado: " + temaId));
        if (!usuarioId.equals(tema.getModulo().getPlan().getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al tema");
        }
        programacionRepositorio.deleteByTemaIdAndFecha(temaId, fecha);
        log.info("Programación de {} para {} eliminada por usuario {}", temaId, fecha, usuarioId);
    }

    @Transactional
    public void registrarSesionHoy(UUID temaId, String usuarioId) {
        Tema tema = temaRepositorio.findById(temaId)
                .orElseThrow(() -> new NoSuchElementException("Tema no encontrado: " + temaId));

        if (!usuarioId.equals(tema.getModulo().getPlan().getUsuarioId())) {
            throw new SecurityException("Acceso no autorizado al tema");
        }

        LocalDate hoy = LocalDate.now();
        if (!programacionRepositorio.existsByTemaIdAndFecha(temaId, hoy)) {
            Programacion prog = Programacion.builder().tema(tema).fecha(hoy).build();
            programacionRepositorio.save(prog);
            log.info("Sesión de hoy registrada en calendario para tema {} usuario {}", temaId, usuarioId);
        }
    }

}
