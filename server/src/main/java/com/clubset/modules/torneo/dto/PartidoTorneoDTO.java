package com.clubset.modules.torneo.dto;

import com.clubset.modules.torneo.enums.EstadoResultado;
import com.clubset.modules.torneo.enums.FaseTorneo;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PartidoTorneoDTO {
    private Long id;
    private FaseTorneo fase;
    
    private EquipoTorneoResponseDTO equipo1;
    private EquipoTorneoResponseDTO equipo2;
    private EquipoTorneoResponseDTO ganador;
    
    private String resultado;
    private EstadoResultado estadoResultado;
    private boolean huboWalkover;
    
    private Integer ordenLlave;
    private LocalDateTime fechaLimiteJuego;
}
