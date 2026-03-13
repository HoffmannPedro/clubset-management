package com.clubset.dto;

import com.clubset.enums.Mano;
import lombok.Data;

@Data
public class UsuarioActualizacionRequestDTO {
    private String nombre;
    private String apellido;
    private String telefono;
    private String fotoPerfilUrl;
    private Mano manoHabil;
}
