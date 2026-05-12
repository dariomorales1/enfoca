package online.enfoca.aiservice.exception;

public class LimitePeticionesException extends RuntimeException {
    public LimitePeticionesException(String mensaje) {
        super(mensaje);
    }
}
