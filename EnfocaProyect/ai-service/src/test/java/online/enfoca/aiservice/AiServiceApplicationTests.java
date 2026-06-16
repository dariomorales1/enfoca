package online.enfoca.aiservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requiere PostgreSQL, Redis, RabbitMQ y Eureka — cubierto por tests unitarios")
class AiServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
