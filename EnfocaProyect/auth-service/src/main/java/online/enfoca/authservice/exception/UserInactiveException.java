package online.enfoca.authservice.exception;

public class UserInactiveException extends RuntimeException {
    public UserInactiveException() {
        super("User account is inactive");
    }
}
