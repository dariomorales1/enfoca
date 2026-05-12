package online.enfoca.aiservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "enfoca.ia")
public record PropiedadesIa(
        String proveedorPrincipal,
        Groq groq,
        Gemini gemini,
        Limites limites
) {
    public record Groq(String apiKey, String url, String modelo) {}
    public record Gemini(String apiKey, String url) {}
    public record Limites(int maxLlamadasPorHora, int ttlCacheHoras) {}
}
