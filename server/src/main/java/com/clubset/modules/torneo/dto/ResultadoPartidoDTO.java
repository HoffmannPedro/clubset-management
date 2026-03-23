package com.clubset.modules.torneo.dto;

import lombok.Data;

@Data
public class ResultadoPartidoDTO {
    private Long ganadorId;
    private String resultado; // Ej: "6-4 4-6 7-5"
    private boolean walkover;
}
