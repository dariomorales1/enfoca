package online.enfoca.aiservice.ia;

public interface ProveedorIa {

    /**
     * Envía los mensajes de sistema y usuario al proveedor de IA
     * y devuelve el texto de la respuesta.
     *
     * @param mensajeSistema instrucciones de rol y formato
     * @param mensajeUsuario la solicitud específica del usuario
     * @return texto JSON con el plan generado
     */
    String llamar(String mensajeSistema, String mensajeUsuario);

    String nombre();
}
