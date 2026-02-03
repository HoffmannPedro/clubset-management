package com.clubset.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cancha")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String superficie;

    // NUEVO: Para saber si la cancha se puede usar o está en "Mantenimiento General"
    // El @Column con default asegura que las canchas viejas nazcan activas
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean disponible = true;
}