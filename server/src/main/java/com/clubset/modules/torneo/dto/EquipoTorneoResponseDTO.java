package com.clubset.modules.torneo.dto;

import com.clubset.modules.usuario.dto.UsuarioDTO;
import lombok.Data;

@Data
public class EquipoTorneoResponseDTO {
    private Long id;
    private String nombreEquipo;
    private UsuarioDTO usuario1;
    private UsuarioDTO usuario2;
}
