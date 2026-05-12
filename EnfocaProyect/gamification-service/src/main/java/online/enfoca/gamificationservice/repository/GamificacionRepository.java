package online.enfoca.gamificationservice.repository;

import online.enfoca.gamificationservice.entity.Gamificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GamificacionRepository extends JpaRepository<Gamificacion, Long> {
    Optional<Gamificacion> findByUsuarioId(String usuarioId);
}