package online.enfoca.aiservice.ia;

import online.enfoca.aiservice.config.PropiedadesIa;
import online.enfoca.aiservice.exception.LimitePeticionesException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicioIaTest {

    @Mock ClienteGroq clienteGroq;
    @Mock ClienteGemini clienteGemini;
    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;

    private ServicioIa servicioIa;

    @BeforeEach
    void setUp() {
        PropiedadesIa.Groq groq = new PropiedadesIa.Groq("test-key", "http://localhost:9991", "test-model");
        PropiedadesIa.Limites limites = new PropiedadesIa.Limites(10, 24);
        PropiedadesIa propiedades = new PropiedadesIa("groq", groq, null, limites);
        when(redis.opsForValue()).thenReturn(valueOps);
        servicioIa = new ServicioIa(clienteGroq, clienteGemini, redis, propiedades);
    }

    @Test
    void generar_cacheHit_retornaCacheado() {
        when(valueOps.increment(anyString())).thenReturn(5L);
        when(valueOps.get(anyString())).thenReturn("respuesta-cacheada");

        String result = servicioIa.generar("user-1", "sistema", "usuario");

        assertThat(result).isEqualTo("respuesta-cacheada");
        verify(clienteGroq, never()).llamar(anyString(), anyString());
    }

    @Test
    void generar_cacheMiss_llamaGroqYCachea() {
        when(valueOps.increment(anyString())).thenReturn(2L);
        when(valueOps.get(anyString())).thenReturn(null);
        when(clienteGroq.llamar(anyString(), anyString())).thenReturn("respuesta-groq");
        doNothing().when(valueOps).set(anyString(), anyString(), any(Duration.class));

        String result = servicioIa.generar("user-1", "sistema", "usuario");

        assertThat(result).isEqualTo("respuesta-groq");
        verify(valueOps).set(anyString(), eq("respuesta-groq"), any(Duration.class));
    }

    @Test
    void generar_primeraLlamada_estableceExpiracion() {
        when(valueOps.increment(anyString())).thenReturn(1L);
        when(valueOps.get(anyString())).thenReturn("cached");

        servicioIa.generar("user-1", "sistema", "usuario");

        verify(redis).expire(anyString(), eq(Duration.ofHours(1)));
    }

    @Test
    void generar_groqFalla_activaGeminiComoRespaldo() {
        when(valueOps.increment(anyString())).thenReturn(3L);
        when(valueOps.get(anyString())).thenReturn(null);
        when(clienteGroq.llamar(anyString(), anyString())).thenThrow(new RuntimeException("Groq error"));
        when(clienteGemini.llamar(anyString(), anyString())).thenReturn("respuesta-gemini");
        doNothing().when(valueOps).set(anyString(), anyString(), any(Duration.class));

        String result = servicioIa.generar("user-1", "sistema", "usuario");

        assertThat(result).isEqualTo("respuesta-gemini");
        verify(clienteGemini).llamar(anyString(), anyString());
    }

    @Test
    void generar_limiteSuperado_lanzaLimitePeticionesException() {
        when(valueOps.increment(anyString())).thenReturn(15L);

        assertThatThrownBy(() -> servicioIa.generar("user-1", "sistema", "usuario"))
                .isInstanceOf(LimitePeticionesException.class)
                .hasMessageContaining("10 generaciones");
        verify(valueOps, never()).get(anyString());
    }

    @Test
    void generar_sinPropiedadesLimites_usaValoresPorDefecto() {
        PropiedadesIa.Groq groq = new PropiedadesIa.Groq("key", "http://localhost:9991", "model");
        PropiedadesIa sinLimites = new PropiedadesIa("groq", groq, null, null);
        ServicioIa servSinLimites = new ServicioIa(clienteGroq, clienteGemini, redis, sinLimites);
        when(valueOps.increment(anyString())).thenReturn(5L);
        when(valueOps.get(anyString())).thenReturn("cached");

        String result = servSinLimites.generar("user-1", "sistema", "usuario");

        assertThat(result).isEqualTo("cached");
    }

    @Test
    void generar_limitesCeroEnPropiedades_usaValoresPorDefecto() {
        PropiedadesIa.Groq groq = new PropiedadesIa.Groq("key", "http://url", "model");
        PropiedadesIa.Limites limitesVacios = new PropiedadesIa.Limites(0, 0);
        PropiedadesIa conLimitesVacios = new PropiedadesIa("groq", groq, null, limitesVacios);
        ServicioIa servConLimitesVacios = new ServicioIa(clienteGroq, clienteGemini, redis, conLimitesVacios);
        when(valueOps.increment(anyString())).thenReturn(5L);
        when(valueOps.get(anyString())).thenReturn("cached");

        String result = servConLimitesVacios.generar("user-1", "sistema", "usuario");

        assertThat(result).isEqualTo("cached");
    }
}
