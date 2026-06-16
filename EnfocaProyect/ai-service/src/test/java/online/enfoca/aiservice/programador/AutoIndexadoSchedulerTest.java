package online.enfoca.aiservice.programador;

import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.enums.EstadoPlan;
import online.enfoca.aiservice.repositorio.PlanEstudioRepositorio;
import online.enfoca.aiservice.servicio.ServicioPlanEstudio;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutoIndexadoSchedulerTest {

    @Mock PlanEstudioRepositorio planRepositorio;
    @Mock ServicioPlanEstudio servicioPlan;

    @InjectMocks
    AutoIndexadoScheduler scheduler;

    private PlanEstudio buildPlan() {
        return PlanEstudio.builder()
                .id(UUID.randomUUID())
                .usuarioId("user-1")
                .titulo("Plan test")
                .estado(EstadoPlan.EN_REVISION)
                .build();
    }

    @Test
    void ejecutar_sinCandidatos_noEvalua() {
        when(planRepositorio.findParaAutoIndexado(50)).thenReturn(List.of());

        scheduler.ejecutar();

        verify(servicioPlan, never()).evaluarPlan(any());
    }

    @Test
    void ejecutar_conCandidatos_evaluaTodos() {
        PlanEstudio plan1 = buildPlan();
        PlanEstudio plan2 = buildPlan();
        when(planRepositorio.findParaAutoIndexado(50)).thenReturn(List.of(plan1, plan2));
        doNothing().when(servicioPlan).evaluarPlan(any());

        scheduler.ejecutar();

        verify(servicioPlan, times(2)).evaluarPlan(any());
    }

    @Test
    void ejecutar_errorEnUnPlan_continuaConSiguiente() {
        PlanEstudio plan1 = buildPlan();
        PlanEstudio plan2 = buildPlan();
        when(planRepositorio.findParaAutoIndexado(50)).thenReturn(List.of(plan1, plan2));
        doThrow(new RuntimeException("Error evaluando")).when(servicioPlan).evaluarPlan(plan1);
        doNothing().when(servicioPlan).evaluarPlan(plan2);

        scheduler.ejecutar();

        verify(servicioPlan).evaluarPlan(plan2);
    }
}
