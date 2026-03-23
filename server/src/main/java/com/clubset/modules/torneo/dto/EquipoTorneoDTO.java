package com.clubset.modules.torneo.dto;

import lombok.Data;

@Data
public class EquipoTorneoDTO {
    private Long usuario1Id;
    
    // Nullable en Singles
    private Long usuario2Id;
    
    // Ej: "Federer" (generado en front) o "Kasi / Diaz"
    private String nombreEquipo;
}
