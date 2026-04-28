package online.enfoca.authservice.exception;

public class OAuth2Exception extends RuntimeException {

    private final String errorCode;

    public OAuth2Exception(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
