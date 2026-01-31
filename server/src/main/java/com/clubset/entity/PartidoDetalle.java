package com.clubset.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Entity
@Table(name = "partido_detalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartidoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int setsGanados;
    private int gamesGanados;
    private boolean esGanador;

    @ManyToOne
    @JoinColumn(name = "partido_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private Partido partido;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    // Aquí NO solemos poner Ignore porque queremos saber qué usuario es
    private Usuario usuario;
}