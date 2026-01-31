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

    private String nombre; // Ej: "Cancha 1", "Central"
    private String superficie; // Ej: "Polvo de Ladrillo", "Cemento"
}