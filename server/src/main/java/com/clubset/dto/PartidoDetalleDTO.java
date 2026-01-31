package com.clubset.dto;
import lombok.Data;

@Data
public class PartidoDetalleDTO {
    private Long id;
    private int setsGanados;
    private int gamesGanados;
    private boolean esGanador;
    private Long partidoId;
    private Long usuarioId;
    private String nombreUsuario;
}