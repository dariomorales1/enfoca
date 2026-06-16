package online.enfoca.certificationservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.enfoca.certificationservice.dominio.Certificado;
import online.enfoca.certificationservice.dto.*;
import online.enfoca.certificationservice.servicio.CertificadoPdfService;
import online.enfoca.certificationservice.servicio.ServicioCertificacion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/certificacion")
@RequiredArgsConstructor
public class CertificacionController {

    private final ServicioCertificacion  servicio;
    private final CertificadoPdfService  pdfService;

    @PostMapping("/examenes/iniciar")
    public ResponseEntity<ExamenResponse> iniciar(
            @RequestHeader("X-User-Id") String usuarioId,
            @Valid @RequestBody IniciarExamenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.iniciarExamen(usuarioId, request));
    }

    @PostMapping("/examenes/{id}/responder")
    public ResponseEntity<ResultadoExamenResponse> responder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String usuarioId,
            @Valid @RequestBody ResponderExamenRequest request) {
        return ResponseEntity.ok(servicio.responderExamen(id, usuarioId, request));
    }

    @GetMapping("/certificados")
    public ResponseEntity<List<Certificado>> listar(
            @RequestHeader("X-User-Id") String usuarioId) {
        return ResponseEntity.ok(servicio.listarCertificados(usuarioId));
    }

    // RF-15: Descargar certificado en PDF
    @GetMapping("/certificados/{id}/pdf")
    public ResponseEntity<byte[]> descargarPdf(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String usuarioId,
            @RequestParam(defaultValue = "Participante") String nombre) throws Exception {

        Certificado cert = servicio.listarCertificados(usuarioId).stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new java.util.NoSuchElementException("Certificado no encontrado"));

        byte[] pdf = pdfService.generar(cert, nombre);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                "certificado-enfoca-" + cert.getCodigoVerificacion() + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    // RF-16: Verificación pública por código
    @GetMapping("/verificar/{codigo}")
    public ResponseEntity<Certificado> verificar(@PathVariable UUID codigo) {
        return servicio.verificar(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // RF-16: QR de verificación (imagen PNG pública)
    @GetMapping("/verificar/{codigo}/qr")
    public ResponseEntity<byte[]> qrVerificacion(@PathVariable UUID codigo) throws Exception {
        return servicio.verificar(codigo)
                .map(cert -> {
                    try {
                        String url = "https://enfoca.online/verificar/" + cert.getCodigoVerificacion();
                        byte[] png = pdfService.generarQrPng(url);
                        HttpHeaders h = new HttpHeaders();
                        h.setContentType(MediaType.IMAGE_PNG);
                        h.setCacheControl("public, max-age=86400");
                        return ResponseEntity.ok().headers(h).body(png);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
