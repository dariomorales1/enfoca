package online.enfoca.gamificationservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "insignias")
@Data
public class Insignia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    private String icono;

    @Column(name = "xp_requerido")
    private Integer xpRequerido = 0;

    private String condicion;
}