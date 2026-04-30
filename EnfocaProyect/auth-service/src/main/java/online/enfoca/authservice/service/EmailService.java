package online.enfoca.authservice.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;

    @Value("${app.resend.from:onboarding@resend.dev}")
    private String from;

    public EmailService(@Value("${app.resend.api-key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    public void sendPasswordReset(String to, String resetLink) {
        try {
            CreateEmailOptions email = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject("Enfoca — Restablecer contraseña")
                    .text(
                            "Recibiste este correo porque solicitaste restablecer tu contraseña en Enfoca.\n\n" +
                            "Haz clic en el siguiente enlace para continuar (válido por 30 minutos):\n\n" +
                            resetLink + "\n\n" +
                            "Si no solicitaste este cambio, ignora este correo.\n\n" +
                            "— Equipo Enfoca"
                    )
                    .build();

            resend.emails().send(email);
            log.info("Reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", to, e.getMessage());
        }
    }
}
