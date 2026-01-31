package com.clubset.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reserva")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;
    private String estado;

    @Column(nullable = false)
    private Boolean pagado = false;

    // NUEVO CAMPO: Identificador del grupo (para turnos fijos)
    // Si es reserva única, puede ser null o tener un ID único.
    private String codigoTurnoFijo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "cancha_id", nullable = false)
    @ToString.Exclude
    private Cancha cancha;
}