package com.clubset.modules.usuario.dto;

import com.clubset.core.shared.enums.Mano;
import com.clubset.core.shared.enums.Categoria;
import lombok.Data;

@Data
public class UsuarioActualizacionRequestDTO {
    private String nombre;
    private String apellido;
    private String telefono;
    private String fotoPerfilUrl;
    private Mano manoHabil;
    private Categoria categoria;
}
