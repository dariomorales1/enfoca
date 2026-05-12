package online.enfoca.aiservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConfiguracionRabbit {

    public static final String EXCHANGE     = "enfoca.eventos";
    public static final String COLA         = "pomodoro.completado.planes";
    public static final String ROUTING_KEY  = "pomodoro.completado";
    public static final String COLA_DLQ     = "pomodoro.completado.planes.dlq";
    public static final String EXCHANGE_DLQ = "enfoca.dlq";

    @Bean
    TopicExchange exchangePrincipal() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    TopicExchange exchangeDlq() {
        return new TopicExchange(EXCHANGE_DLQ, true, false);
    }

    @Bean
    Queue colaPomodoroPlan() {
        return QueueBuilder.durable(COLA)
                .withArgument("x-dead-letter-exchange", EXCHANGE_DLQ)
                .withArgument("x-dead-letter-routing-key", COLA_DLQ)
                .build();
    }

    @Bean
    Queue colaDlq() {
        return QueueBuilder.durable(COLA_DLQ).build();
    }

    @Bean
    Binding bindingPomodoroPlan(Queue colaPomodoroPlan, TopicExchange exchangePrincipal) {
        return BindingBuilder.bind(colaPomodoroPlan).to(exchangePrincipal).with(ROUTING_KEY);
    }

    @Bean
    Jackson2JsonMessageConverter convertidor() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter convertidor) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(convertidor);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
