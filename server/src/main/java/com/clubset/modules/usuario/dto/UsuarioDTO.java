package com.clubset.modules.usuario.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

import com.clubset.core.shared.enums.Categoria;
import com.clubset.core.shared.enums.Genero;
import com.clubset.core.shared.enums.Mano;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono; // Nuevo
    private String rol;

    // Datos Deportivos
    private Categoria categoria;
    private Genero genero;
    private Mano manoHabil;
    private String fotoPerfilUrl;
    private Integer puntosRanking;

    private BigDecimal deudaTotal;
    private Long partidosJugados;
    private List<MovimientoPerfilDTO> ultimosMovimientos;
}