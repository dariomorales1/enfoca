package online.enfoca.certificationservice.servicio;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import online.enfoca.certificationservice.dominio.Certificado;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Service
public class CertificadoPdfService {

    @Value("${enfoca.base-url:https://enfoca.online}")
    private String baseUrl;

    // Paleta visual alineada con la UI de Enfoca
    private static final Color VIOLET      = new Color(124,  58, 237);
    private static final Color VIOLET_SOFT = new Color(139,  92, 246);
    private static final Color AMBER       = new Color(245, 158,  11);
    private static final Color WHITE       = new Color(255, 255, 255);
    private static final Color GRAY_500    = new Color(107, 114, 128);
    private static final Color GRAY_200    = new Color(229, 231, 235);
    private static final Color DARK        = new Color( 17,  24,  39);
    private static final Color VIOLET_PALE = new Color(196, 181, 253);

    public byte[] generar(Certificado cert, String nombreUsuario) throws Exception {
        float W = PageSize.A4.getWidth();
        float H = PageSize.A4.getHeight();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc    = new Document(PageSize.A4, 0, 0, 0, 0);
        PdfWriter writer = PdfWriter.getInstance(doc, baos);
        doc.open();

        PdfContentByte cb    = writer.getDirectContent();
        BaseFont bf          = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont bfLight     = BaseFont.createFont(BaseFont.HELVETICA,      BaseFont.CP1252, BaseFont.NOT_EMBEDDED);

        dibujarFondo(cb, W, H);
        dibujarHeader(cb, bf, bfLight, W, H);
        dibujarCuerpo(cb, bf, bfLight, cert, nombreUsuario, W, H);
        dibujarQr(cb, bfLight, cert, W, H);
        dibujarFooter(cb, bfLight, cert, W);

        doc.close();
        return baos.toByteArray();
    }

    public byte[] generarQrPng(String contenido) throws Exception {
        return qrBytes(contenido, 300);
    }

    // ----------------------------------------------------------------
    //  Secciones del PDF
    // ----------------------------------------------------------------

    private void dibujarFondo(PdfContentByte cb, float W, float H) {
        fillRect(cb, WHITE,  0, 0,      W,  H);

        // Banda superior violeta
        fillRect(cb, VIOLET, 0, H - 85, W,  85);

        // Acento amber — línea superior de la banda
        fillRect(cb, AMBER,  0, H - 88, W,   3);

        // Banda inferior violeta
        fillRect(cb, VIOLET, 0, 0,      W,  60);

        // Línea amber sobre banda inferior
        fillRect(cb, AMBER,  0, 60,     W,   2);

        // Bordes laterales amber
        fillRect(cb, AMBER,  0,     62, 6, H - 150);
        fillRect(cb, AMBER,  W - 6, 62, 6, H - 150);
    }

    private void dibujarHeader(PdfContentByte cb, BaseFont bf, BaseFont bfLight, float W, float H) {
        // Logotipo ENFOCA
        cb.beginText();
        setFill(cb, WHITE);
        cb.setFontAndSize(bf, 30);
        cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "ENFOCA", 42, H - 54, 0);
        cb.endText();

        // Tagline
        cb.beginText();
        setFill(cb, VIOLET_PALE);
        cb.setFontAndSize(bfLight, 10);
        cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "Plataforma de Aprendizaje Profundo", 44, H - 74, 0);
        cb.endText();

        // Título del certificado
        cb.beginText();
        setFill(cb, VIOLET);
        cb.setFontAndSize(bf, 20);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "CERTIFICADO DE FINALIZACION", W / 2, H - 128, 0);
        cb.endText();

        // Línea decorativa amber bajo el título
        strokeLine(cb, AMBER, 2f, 55, H - 148, W - 55, H - 148);
    }

    private void dibujarCuerpo(PdfContentByte cb, BaseFont bf, BaseFont bfLight,
                                Certificado cert, String nombre, float W, float H) {
        // "Se certifica que"
        cb.beginText();
        setFill(cb, GRAY_500);
        cb.setFontAndSize(bfLight, 13);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Se certifica que", W / 2, H - 195, 0);
        cb.endText();

        // Nombre del titular
        cb.beginText();
        setFill(cb, DARK);
        int nameFontSize = nombre.length() > 30 ? 26 : nombre.length() > 20 ? 30 : 34;
        cb.setFontAndSize(bf, nameFontSize);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, nombre, W / 2, H - 248, 0);
        cb.endText();

        // Línea bajo el nombre
        strokeLine(cb, GRAY_200, 1f, 70, H - 265, W - 70, H - 265);

        // "ha completado"
        cb.beginText();
        setFill(cb, GRAY_500);
        cb.setFontAndSize(bfLight, 12);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER,
                "ha completado satisfactoriamente el plan de estudio", W / 2, H - 305, 0);
        cb.endText();

        // Título del plan
        String titulo    = cert.getPlanTitulo();
        int    titleSize = titulo.length() > 45 ? 14 : titulo.length() > 30 ? 17 : titulo.length() > 20 ? 19 : 21;
        cb.beginText();
        setFill(cb, VIOLET_SOFT);
        cb.setFontAndSize(bf, titleSize);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, titulo, W / 2, H - 352, 0);
        cb.endText();

        // Puntuación
        cb.beginText();
        setFill(cb, GRAY_500);
        cb.setFontAndSize(bfLight, 11);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER,
                "con una puntuacion de " + cert.getPuntaje() + "/10 respuestas correctas",
                W / 2, H - 390, 0);
        cb.endText();

        // Segunda línea decorativa amber
        strokeLine(cb, AMBER, 1.5f, 55, H - 415, W - 55, H - 415);

        // Fecha
        if (cert.getEmitidoEn() != null) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("es", "CL"));
            cb.beginText();
            setFill(cb, GRAY_500);
            cb.setFontAndSize(bfLight, 10);
            cb.showTextAligned(PdfContentByte.ALIGN_LEFT,
                    "Santiago, Chile  —  " + cert.getEmitidoEn().format(fmt),
                    55, H - 455, 0);
            cb.endText();
        }
    }

    // QR embebido en esquina inferior derecha, sobre la banda del footer
    private void dibujarQr(PdfContentByte cb, BaseFont bfLight,
                             Certificado cert, float W, float H) throws Exception {
        String url  = baseUrl + "/verificar/" + cert.getCodigoVerificacion();
        byte[] png  = qrBytes(url, 150);
        Image  qr   = Image.getInstance(png);
        float  size = 85f;
        float  x    = W - 140f;
        float  y    = 72f;
        qr.setAbsolutePosition(x, y);
        qr.scaleAbsolute(size, size);
        cb.addImage(qr);

        cb.beginText();
        setFill(cb, GRAY_500);
        cb.setFontAndSize(bfLight, 7f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Escanear para verificar", x + size / 2, 66f, 0);
        cb.endText();
    }

    private void dibujarFooter(PdfContentByte cb, BaseFont bfLight, Certificado cert, float W) {
        cb.beginText();
        setFill(cb, WHITE);
        cb.setFontAndSize(bfLight, 7.5f);
        String linea = "Codigo: " + cert.getCodigoVerificacion()
                + "   ·   " + baseUrl + "/verificar/" + cert.getCodigoVerificacion();
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, linea, W / 2, 24, 0);
        cb.endText();
    }

    // ----------------------------------------------------------------
    //  Utilidades gráficas
    // ----------------------------------------------------------------

    // setRGBColorFill emite el operador PDF "rg" directamente — correcto para paths y texto
    private void setFill(PdfContentByte cb, Color c) {
        cb.setRGBColorFill(c.getRed(), c.getGreen(), c.getBlue());
    }

    private void fillRect(PdfContentByte cb, Color c, float x, float y, float w, float h) {
        cb.setRGBColorFill(c.getRed(), c.getGreen(), c.getBlue());
        cb.rectangle(x, y, w, h);
        cb.fill();
    }

    private void strokeLine(PdfContentByte cb, Color c, float width,
                             float x1, float y1, float x2, float y2) {
        cb.setRGBColorStroke(c.getRed(), c.getGreen(), c.getBlue());
        cb.setLineWidth(width);
        cb.moveTo(x1, y1);
        cb.lineTo(x2, y2);
        cb.stroke();
    }

    private byte[] qrBytes(String contenido, int tamano) throws Exception {
        var matrix = new QRCodeWriter().encode(
                contenido, BarcodeFormat.QR_CODE, tamano, tamano,
                Map.of(EncodeHintType.MARGIN, 1));
        BufferedImage img = MatrixToImageWriter.toBufferedImage(matrix);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(img, "PNG", out);
            return out.toByteArray();
        }
    }
}
