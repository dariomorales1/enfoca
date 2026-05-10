package online.enfoca.gamificationservice.repository;

import online.enfoca.gamificationservice.entity.UsuarioInsignia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UsuarioInsigniaRepository extends JpaRepository<UsuarioInsignia, Long> {
    List<UsuarioInsignia> findByUsuarioId(String usuarioId);
}