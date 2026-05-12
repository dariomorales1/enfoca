package online.enfoca.aiservice.repositorio;

import online.enfoca.aiservice.dominio.Validacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ValidacionRepositorio extends JpaRepository<Validacion, UUID> {

    boolean existsByPlanIdAndUsuarioId(UUID planId, String usuarioId);

    long countByPlanId(UUID planId);
}
