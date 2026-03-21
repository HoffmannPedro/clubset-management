package com.clubset.modules.cancha.dto;
import lombok.Data;

@Data
public class CanchaDTO {
    private Long id;
    private String nombre;
    private String superficie;
    private Boolean disponible;
}