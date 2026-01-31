package com.clubset.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "partido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;
    private String fase;

    @ManyToOne
    @JoinColumn(name = "torneo_id", nullable = false)
    @ToString.Exclude
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Torneo torneo;

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL)
    private List<PartidoDetalle> detalles;
}