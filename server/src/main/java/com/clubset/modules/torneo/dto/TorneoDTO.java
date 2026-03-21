package com.clubset.modules.torneo.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TorneoDTO {
    private Long id;
    private String nombre;
    private LocalDate fechaInicio;
}