package com.clubset.modules.torneo;

import com.clubset.core.shared.enums.Categoria;
import com.clubset.modules.torneo.enums.EstadoTorneo;
import com.clubset.modules.torneo.enums.FormatoTorneo;
import com.clubset.modules.torneo.enums.ModalidadTorneo;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "torneo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Torneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    private FormatoTorneo formato;

    @Enumerated(EnumType.STRING)
    private ModalidadTorneo modalidad;

    @Enumerated(EnumType.STRING)
    private Categoria categoriaEsperada; // Puede ser null si es 'Libre'

    private BigDecimal costoInscripcion;
    
    private String premiosAdicionales;

    // Puntos automáticos a inyectar al final del torneo
    private Integer puntosCampeon;
    private Integer puntosFinalista;
    private Integer puntosSemi;

    @Enumerated(EnumType.STRING)
    private EstadoTorneo estado;

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<EquipoTorneo> equiposInscriptos;

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<PartidoTorneo> partidos;
}