package com.clubset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    // Podríamos devolver también datos básicos del usuario aquí si quisiéramos
    // private String nombre;
    // private String rol;
}