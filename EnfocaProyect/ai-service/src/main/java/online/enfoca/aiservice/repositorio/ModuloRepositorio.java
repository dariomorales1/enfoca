package online.enfoca.aiservice.repositorio;

import online.enfoca.aiservice.dominio.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ModuloRepositorio extends JpaRepository<Modulo, UUID> {

    List<Modulo> findByPlanIdOrderByOrdenAsc(UUID planId);

    void deleteByPlanId(UUID planId);
}
