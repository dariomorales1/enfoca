package online.enfoca.aiservice.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ConfiguracionRabbitTest {

    @Mock
    private ConnectionFactory connectionFactory;

    private final ConfiguracionRabbit config = new ConfiguracionRabbit();

    @Test
    void exchangePrincipal_retornaTopic() {
        TopicExchange exchange = config.exchangePrincipal();
        assertThat(exchange.getName()).isEqualTo(ConfiguracionRabbit.EXCHANGE);
    }

    @Test
    void exchangeDlq_retornaTopic() {
        TopicExchange exchange = config.exchangeDlq();
        assertThat(exchange.getName()).isEqualTo(ConfiguracionRabbit.EXCHANGE_DLQ);
    }

    @Test
    void colaPomodoroPlan_retornaCola() {
        Queue cola = config.colaPomodoroPlan();
        assertThat(cola.getName()).isEqualTo(ConfiguracionRabbit.COLA);
    }

    @Test
    void colaDlq_retornaCola() {
        Queue cola = config.colaDlq();
        assertThat(cola.getName()).isEqualTo(ConfiguracionRabbit.COLA_DLQ);
    }

    @Test
    void bindingPomodoroPlan_retornaBinding() {
        Queue cola = config.colaPomodoroPlan();
        TopicExchange exchange = config.exchangePrincipal();
        Binding binding = config.bindingPomodoroPlan(cola, exchange);
        assertThat(binding).isNotNull();
        assertThat(binding.getRoutingKey()).isEqualTo(ConfiguracionRabbit.ROUTING_KEY);
    }

    @Test
    void convertidor_retornaJackson2JsonConverter() {
        Jackson2JsonMessageConverter convertidor = config.convertidor();
        assertThat(convertidor).isNotNull();
    }

    @Test
    void rabbitListenerContainerFactory_retornaFactory() {
        Jackson2JsonMessageConverter convertidor = config.convertidor();
        SimpleRabbitListenerContainerFactory factory = config.rabbitListenerContainerFactory(connectionFactory, convertidor);
        assertThat(factory).isNotNull();
    }
}
