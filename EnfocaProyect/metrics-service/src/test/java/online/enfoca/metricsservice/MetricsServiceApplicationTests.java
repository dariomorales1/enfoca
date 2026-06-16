package online.enfoca.metricsservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
@Disabled("Requiere PostgreSQL y Eureka — cubierto por tests unitarios")
class MetricsServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}