package com.clubset.modules.torneo.dto;

import lombok.Data;

@Data
public class PartidoManualDTO {
    private Long equipo1Id;
    private Long equipo2Id; // Puede ser null para indicar un Bye
}
