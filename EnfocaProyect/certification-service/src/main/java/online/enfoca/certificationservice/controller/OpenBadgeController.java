package online.enfoca.certificationservice.controller;

import lombok.RequiredArgsConstructor;
import online.enfoca.certificationservice.dominio.Certificado;
import online.enfoca.certificationservice.repositorio.CertificadoRepositorio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/certificacion")
@RequiredArgsConstructor
public class OpenBadgeController {

    @Value("${enfoca.base-url:https://enfoca.online}")
    private String baseUrl;

    private final CertificadoRepositorio certificadoRepo;

    private static final String LD_JSON = "application/ld+json";
    private static final String CONTEXT  = "https://w3id.org/openbadges/v2";
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // RF-17: Emisor (issuer)
    @GetMapping(value = "/issuer", produces = LD_JSON)
    public ResponseEntity<Map<String, Object>> issuer() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("@context", CONTEXT);
        body.put("type",        "Issuer");
        body.put("id",          baseUrl + "/certificacion/issuer");
        body.put("name",        "Enfoca — Plataforma de Aprendizaje Profundo");
        body.put("url",         baseUrl);
        body.put("email",       "certificacion@enfoca.online");
        body.put("description", "Plataforma de aprendizaje profundo con técnicas de estudio científicamente probadas.");
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(LD_JSON)).body(body);
    }

    // RF-17: Clase de badge (por plan maestro)
    @GetMapping(value = "/badges/{planMaestroId}", produces = LD_JSON)
    public ResponseEntity<Map<String, Object>> badgeClass(@PathVariable UUID planMaestroId) {
        return certificadoRepo.findFirstByPlanMaestroId(planMaestroId)
                .map(cert -> {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("@context",    CONTEXT);
                    body.put("type",        "BadgeClass");
                    body.put("id",          baseUrl + "/certificacion/badges/" + planMaestroId);
                    body.put("name",        cert.getPlanTitulo());
                    body.put("description", "Certificado de finalización del plan de estudio «" + cert.getPlanTitulo() + "» en Enfoca.");
                    body.put("image",       baseUrl + "/badge-enfoca.png");
                    body.put("criteria",    Map.of("narrative",
                            "Completar el plan de estudio y aprobar el examen de certificación con al menos 7/10 respuestas correctas."));
                    body.put("issuer",      baseUrl + "/certificacion/issuer");
                    return ResponseEntity.ok().contentType(MediaType.parseMediaType(LD_JSON)).body(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // RF-17: Aserción (certificado individual)
    @GetMapping(value = "/assertions/{certificadoId}", produces = LD_JSON)
    public ResponseEntity<Map<String, Object>> assertion(@PathVariable UUID certificadoId) {
        return certificadoRepo.findById(certificadoId)
                .map(cert -> {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("@context",   CONTEXT);
                    body.put("type",       "Assertion");
                    body.put("id",         baseUrl + "/certificacion/assertions/" + cert.getId());
                    body.put("uid",        cert.getCodigoVerificacion().toString());
                    body.put("recipient",  Map.of(
                            "type",     "id",
                            "identity", cert.getUsuarioId(),
                            "hashed",   false));
                    body.put("badge",      baseUrl + "/certificacion/badges/" + cert.getPlanMaestroId());
                    body.put("verify",     Map.of(
                            "type", "hosted",
                            "url",  baseUrl + "/certificacion/assertions/" + cert.getId()));
                    body.put("issuedOn",   cert.getEmitidoEn() != null ? cert.getEmitidoEn().format(ISO) : null);
                    body.put("evidence",   baseUrl + "/verificar/" + cert.getCodigoVerificacion());
                    return ResponseEntity.ok().contentType(MediaType.parseMediaType(LD_JSON)).body(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
