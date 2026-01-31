package com.clubset.entity; // Tu paquete puede variar

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data   // Le dice a Lombok: "Generame getters, setters y toString automático"
public class Usuario {

    @Id // Esto es la Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremental (1, 2, 3...)
    private Long id;

    private String nombre;
    
    private String apellido;

    @Column(unique = true) // El email no se puede repetir
    private String email;

    private String password; // En el futuro la encriptaremos

    // Por ahora usamos un String simple para el rol, luego lo mejoraremos
    private String rol; // "SOCIO" o "ADMIN"
}