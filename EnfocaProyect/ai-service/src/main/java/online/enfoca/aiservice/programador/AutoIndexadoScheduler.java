package online.enfoca.aiservice.programador;

import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.repositorio.PlanEstudioRepositorio;
import online.enfoca.aiservice.servicio.ServicioPlanEstudio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AutoIndexadoScheduler {

    private static final Logger log = LoggerFactory.getLogger(AutoIndexadoScheduler.class);
    private static final int UMBRAL_VALIDACIONES = 50;

    private final PlanEstudioRepositorio planRepositorio;
    private final ServicioPlanEstudio servicioPlan;

    public AutoIndexadoScheduler(PlanEstudioRepositorio planRepositorio,
                                 ServicioPlanEstudio servicioPlan) {
        this.planRepositorio = planRepositorio;
        this.servicioPlan = servicioPlan;
    }

    // Todos los días a las 03:00 hora de Chile
    @Scheduled(cron = "0 0 3 * * *", zone = "America/Santiago")
    public void ejecutar() {
        log.info("Iniciando auto-indexado nocturno...");

        List<PlanEstudio> candidatos = planRepositorio.findParaAutoIndexado(UMBRAL_VALIDACIONES);
        log.info("{} planes candidatos para evaluación", candidatos.size());

        for (PlanEstudio plan : candidatos) {
            try {
                servicioPlan.evaluarPlan(plan);
            } catch (Exception e) {
                log.error("Error evaluando plan {}: {}", plan.getId(), e.getMessage());
            }
        }

        log.info("Auto-indexado nocturno completado");
    }
}
