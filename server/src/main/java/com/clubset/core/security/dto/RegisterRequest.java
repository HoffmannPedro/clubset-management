package com.clubset.core.security.dto;

import com.clubset.core.shared.enums.Categoria;
import com.clubset.core.shared.enums.Genero;
import com.clubset.core.shared.enums.Mano;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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