package online.enfoca.aiservice.repositorio;

import online.enfoca.aiservice.dominio.Tema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TemaRepositorio extends JpaRepository<Tema, UUID> {

    Optional<Tema> findById(UUID id);
}
