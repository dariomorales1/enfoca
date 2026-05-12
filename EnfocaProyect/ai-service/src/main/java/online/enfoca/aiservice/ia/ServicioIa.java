package online.enfoca.aiservice.ia;

import online.enfoca.aiservice.config.PropiedadesIa;
import online.enfoca.aiservice.exception.LimitePeticionesException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;

@Service
public class ServicioIa {

    private static final Logger log = LoggerFactory.getLogger(ServicioIa.class);

    private static final int MAX_LLAMADAS_DEFAULT = 10;
    private static final int TTL_CACHE_DEFAULT    = 24;

    private final ClienteGroq clienteGroq;
    private final ClienteGemini clienteGemini;
    private final StringRedisTemplate redis;
    private final PropiedadesIa propiedades;

    public ServicioIa(ClienteGroq clienteGroq, ClienteGemini clienteGemini,
                      StringRedisTemplate redis, PropiedadesIa propiedades) {
        this.clienteGroq  = clienteGroq;
        this.clienteGemini = clienteGemini;
        this.redis        = redis;
        this.propiedades  = propiedades;
    }

    public String generar(String usuarioId, String mensajeSistema, String mensajeUsuario) {
        verificarLimiteUsuario(usuarioId);

        String claveCache = "ia:plan:" + sha256(mensajeSistema + mensajeUsuario);
        String enCache = redis.opsForValue().get(claveCache);
        if (enCache != null) {
            log.info("Cache hit para usuario {} (clave {})", usuarioId, claveCache.substring(0, 12));
            return enCache;
        }

        String resultado = llamarConFallback(mensajeSistema, mensajeUsuario);

        redis.opsForValue().set(claveCache, resultado, Duration.ofHours(ttlCache()));
        log.info("Resultado cacheado con TTL {}h", ttlCache());

        return resultado;
    }

    private String llamarConFallback(String mensajeSistema, String mensajeUsuario) {
        try {
            log.info("Invocando Groq ({})", propiedades.groq().modelo());
            String respuesta = clienteGroq.llamar(mensajeSistema, mensajeUsuario);
            log.info("Groq respondió correctamente ({} chars)", respuesta.length());
            return respuesta;
        } catch (Exception e) {
            log.warn("Groq falló: {}. Activando Gemini como respaldo...", e.getMessage());
            String respuesta = clienteGemini.llamar(mensajeSistema, mensajeUsuario);
            log.info("Gemini respondió correctamente ({} chars)", respuesta.length());
            return respuesta;
        }
    }

    private void verificarLimiteUsuario(String usuarioId) {
        String clave = "ia:limite:" + usuarioId;
        Long llamadas = redis.opsForValue().increment(clave);
        if (llamadas == 1) {
            redis.expire(clave, Duration.ofHours(1));
        }
        int maxLlamadas = maxLlamadasPorHora();
        if (llamadas != null && llamadas > maxLlamadas) {
            throw new LimitePeticionesException(
                    "Has alcanzado el límite de " + maxLlamadas + " generaciones por hora.");
        }
    }

    private int maxLlamadasPorHora() {
        if (propiedades.limites() == null) return MAX_LLAMADAS_DEFAULT;
        return propiedades.limites().maxLlamadasPorHora() > 0
                ? propiedades.limites().maxLlamadasPorHora()
                : MAX_LLAMADAS_DEFAULT;
    }

    private int ttlCache() {
        if (propiedades.limites() == null) return TTL_CACHE_DEFAULT;
        return propiedades.limites().ttlCacheHoras() > 0
                ? propiedades.limites().ttlCacheHoras()
                : TTL_CACHE_DEFAULT;
    }

    private String sha256(String texto) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(texto.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return String.valueOf(texto.hashCode());
        }
    }
}
