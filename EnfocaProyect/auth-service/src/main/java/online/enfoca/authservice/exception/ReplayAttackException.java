package online.enfoca.authservice.exception;

public class ReplayAttackException extends RuntimeException {
    public ReplayAttackException() {
        super("Replay attack detected: token chain revoked, re-authentication required");
    }
}
