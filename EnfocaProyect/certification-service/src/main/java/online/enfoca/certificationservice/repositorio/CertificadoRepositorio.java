package online.enfoca.certificationservice.repositorio;

import online.enfoca.certificationservice.dominio.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificadoRepositorio extends JpaRepository<Certificado, UUID> {

    List<Certificado> findByUsuarioIdOrderByEmitidoEnDesc(String usuarioId);

    boolean existsByUsuarioIdAndPlanMaestroId(String usuarioId, UUID planMaestroId);

    Optional<Certificado> findByCodigoVerificacion(UUID codigo);

    Optional<Certificado> findFirstByPlanMaestroId(UUID planMaestroId);
}
