package com.clubset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.clubset.enums.*; // Tus enums

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private String telefono;
    
    // Opcionales (pueden venir null y los manejamos)
    private Categoria categoria;
    private Genero genero;
    private Mano manoHabil;
}