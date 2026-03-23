package com.clubset.modules.torneo.dto;
import com.clubset.modules.torneo.enums.ModalidadTorneo;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TorneoDTO {
    private Long id;
    private String nombre;
    private LocalDate fechaInicio;
    private ModalidadTorneo modalidad;
}