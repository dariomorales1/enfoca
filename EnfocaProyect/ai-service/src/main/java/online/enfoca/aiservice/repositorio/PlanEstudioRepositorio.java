package online.enfoca.aiservice.repositorio;

import online.enfoca.aiservice.dominio.PlanEstudio;
import online.enfoca.aiservice.enums.EstadoPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PlanEstudioRepositorio extends JpaRepository<PlanEstudio, UUID> {

    List<PlanEstudio> findByUsuarioIdOrderByCreadoEnDesc(String usuarioId);

    List<PlanEstudio> findByEstadoOrderByCreadoEnDesc(EstadoPlan estado);

    @Query("""
            SELECT p FROM PlanEstudio p
            WHERE p.estado IN ('ACTIVO', 'EN_REVISION')
            AND p.totalValidaciones >= :umbral
            """)
    List<PlanEstudio> findParaAutoIndexado(@Param("umbral") int umbral);
}
