import { useEffect } from 'react';

const CONTENIDO = {
    terminos: {
        titulo: 'Términos y Condiciones de Uso',
        fecha: 'Vigente desde el 1 de enero de 2026',
        secciones: [
            {
                titulo: '1. Identificación del Prestador',
                texto: 'Enfoca (en adelante, "la Plataforma") es un servicio digital de productividad académica desarrollado y operado en la República de Chile. Para consultas legales puede contactar a: legal@enfoca.online.',
            },
            {
                titulo: '2. Objeto del Servicio',
                texto: 'Enfoca proporciona herramientas de gestión del tiempo (técnica Pomodoro), planes de estudio generados con Inteligencia Artificial, métricas de rendimiento académico y funciones de gamificación, con el fin de apoyar el aprendizaje autónomo de sus usuarios.',
            },
            {
                titulo: '3. Condiciones de Uso',
                texto: 'El acceso a Enfoca está permitido a personas mayores de 13 años. El usuario se compromete a: (a) proporcionar información veraz al registrarse; (b) no realizar usos fraudulentos, abusivos o contrarios a la legislación chilena; (c) no intentar vulnerar la seguridad de la plataforma; (d) no reproducir ni distribuir el contenido sin autorización expresa.',
            },
            {
                titulo: '4. Propiedad Intelectual',
                texto: 'Todos los derechos de propiedad intelectual sobre el software, diseño, marca y contenidos de Enfoca son de exclusiva titularidad del proveedor del servicio, conforme a la Ley N° 17.336 sobre Propiedad Intelectual y sus modificaciones. Los planes de estudio generados por IA en base a los datos del usuario son de uso personal y no comercial.',
            },
            {
                titulo: '5. Limitación de Responsabilidad',
                texto: 'Enfoca no garantiza resultados académicos específicos. El servicio se presta "tal como está" y puede experimentar interrupciones por mantenimiento. En ningún caso la responsabilidad de Enfoca superará el monto pagado por el usuario en los últimos 3 meses, si aplica.',
            },
            {
                titulo: '6. Modificaciones del Servicio',
                texto: 'Enfoca se reserva el derecho de modificar, suspender o descontinuar el servicio en cualquier momento, notificando a los usuarios con al menos 15 días de anticipación, salvo en casos de fuerza mayor.',
            },
            {
                titulo: '7. Legislación Aplicable y Jurisdicción',
                texto: 'Estos términos se rigen por las leyes de la República de Chile. Para la resolución de cualquier controversia, las partes se someten a la jurisdicción de los Tribunales Ordinarios de Justicia de Chile, sin perjuicio de los derechos de los consumidores establecidos en la Ley N° 19.496 de Protección al Consumidor.',
            },
        ],
    },
    privacidad: {
        titulo: 'Política de Privacidad',
        fecha: 'Vigente desde el 1 de enero de 2026 · Ley N° 19.628 y Ley N° 21.719',
        secciones: [
            {
                titulo: '1. Responsable del Tratamiento',
                texto: 'Enfoca, con domicilio en Chile, es el responsable del tratamiento de sus datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719 de Protección de Datos Personales. Contacto del Encargado de Datos: privacidad@enfoca.online.',
            },
            {
                titulo: '2. Datos Personales que Recopilamos',
                texto: 'Recopilamos los siguientes datos: (a) Datos de registro: nombre, apellido, correo electrónico, carrera e institución educacional; (b) Datos de uso: sesiones de estudio, planes generados, temas completados, métricas de rendimiento; (c) Datos técnicos: dirección IP, tipo de navegador, sistema operativo y cookies de sesión. No recopilamos datos sensibles según la definición del Art. 2 de la Ley N° 19.628.',
            },
            {
                titulo: '3. Finalidad del Tratamiento',
                texto: 'Sus datos son tratados para: (a) prestar y personalizar el servicio de Enfoca; (b) generar planes de estudio mediante Inteligencia Artificial; (c) calcular métricas y estadísticas de uso; (d) enviar comunicaciones relacionadas con el servicio; (e) cumplir con obligaciones legales. No utilizamos sus datos para publicidad de terceros.',
            },
            {
                titulo: '4. Base Legal del Tratamiento',
                texto: 'El tratamiento de sus datos se sustenta en: (a) el consentimiento otorgado al registrarse en la plataforma (Art. 4 Ley 19.628); (b) la ejecución del contrato de prestación del servicio; (c) el interés legítimo en mejorar la plataforma mediante análisis agregados y anonimizados.',
            },
            {
                titulo: '5. Plazo de Conservación',
                texto: 'Sus datos se conservarán durante la vigencia de su cuenta y por un período adicional de 2 años contados desde su eliminación, salvo que la ley exija un plazo diferente. Los datos de registro se eliminan definitivamente a solicitud del titular.',
            },
            {
                titulo: '6. Destinatarios y Transferencias',
                texto: 'Sus datos pueden ser compartidos con: (a) proveedores de infraestructura en la nube que operan servidores en territorio chileno o con adecuado nivel de protección; (b) servicios de Inteligencia Artificial (Groq, Google Gemini) exclusivamente para generar planes de estudio, bajo contratos que garantizan la confidencialidad. No vendemos datos a terceros.',
            },
            {
                titulo: '7. Derechos del Titular (ARCO)',
                texto: 'Conforme a la Ley N° 19.628, usted tiene derecho a: (a) Acceso: obtener confirmación de si tratamos sus datos y una copia de ellos; (b) Rectificación: corregir datos inexactos o incompletos; (c) Cancelación/Supresión: solicitar la eliminación de sus datos cuando no sean necesarios; (d) Oposición: oponerse al tratamiento en los casos previstos por la ley. Para ejercer estos derechos, envíe su solicitud a privacidad@enfoca.online indicando su nombre completo y correo de registro. Responderemos dentro de 30 días hábiles.',
            },
            {
                titulo: '8. Seguridad de los Datos',
                texto: 'Aplicamos medidas técnicas y organizativas para proteger sus datos: cifrado en tránsito (TLS 1.3), contraseñas almacenadas con hash bcrypt, acceso restringido a la base de datos, y monitoreo de incidentes de seguridad. En caso de vulneración de datos que pueda afectarle, le notificaremos conforme a la normativa vigente.',
            },
            {
                titulo: '9. Cookies',
                texto: 'Utilizamos cookies estrictamente necesarias para la sesión de usuario. No utilizamos cookies de rastreo o publicidad de terceros. Puede configurar su navegador para bloquear cookies, aunque esto puede afectar el funcionamiento del servicio.',
            },
            {
                titulo: '10. Modificaciones a esta Política',
                texto: 'Podemos actualizar esta política periódicamente. Le notificaremos los cambios materiales por correo electrónico o mediante un aviso visible en la plataforma con al menos 15 días de anticipación. El uso continuado del servicio tras la notificación implica la aceptación de los cambios.',
            },
            {
                titulo: '11. Reclamaciones',
                texto: 'Si considera que el tratamiento de sus datos vulnera la normativa vigente, puede interponer una reclamación ante el Consejo para la Transparencia (www.consejotransparencia.cl) o ante los tribunales de justicia competentes en Chile.',
            },
        ],
    },
};

export default function LegalModal({ tipo, onClose }) {
    const contenido = CONTENIDO[tipo];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!contenido) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-start justify-between px-8 py-6 border-b border-neutral-800 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{contenido.titulo}</h2>
                        <p className="text-xs text-neutral-500 mt-1">{contenido.fecha}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-600 hover:text-white transition-colors p-1 ml-4 flex-shrink-0"
                        aria-label="Cerrar"
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Contenido scrollable */}
                <div className="overflow-y-auto px-8 py-6 flex flex-col gap-6">
                    {contenido.secciones.map((sec, i) => (
                        <div key={i}>
                            <h3 className="text-sm font-bold text-white mb-2">{sec.titulo}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{sec.texto}</p>
                        </div>
                    ))}

                    <div className="mt-2 pt-6 border-t border-neutral-800">
                        <p className="text-xs text-neutral-600 text-center">
                            Enfoca · Chile · {new Date().getFullYear()} · legal@enfoca.online
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
