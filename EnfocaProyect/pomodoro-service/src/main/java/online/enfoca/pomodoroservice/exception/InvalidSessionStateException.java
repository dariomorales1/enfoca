package online.enfoca.pomodoroservice.exception;

public class InvalidSessionStateException extends RuntimeException{

    public InvalidSessionStateException(String message){
        super(message);
    }

}
