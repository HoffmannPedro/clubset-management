package com.clubset.modules.torneo;

import com.clubset.modules.reserva.Reserva;
import com.clubset.modules.torneo.enums.EstadoResultado;
import com.clubset.modules.torneo.enums.FaseTorneo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "partido_torneo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartidoTorneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "torneo_id", nullable = false)
    @ToString.Exclude
    private Torneo torneo;

    @Enumerated(EnumType.STRING)
    private FaseTorneo fase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo1_id", nullable = false)
    @ToString.Exclude
    private EquipoTorneo equipo1;

    // Puede ser null si equipo1 pasa por 'Bye' en primera ronda
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo2_id")
    @ToString.Exclude
    private EquipoTorneo equipo2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ganador_id")
    @ToString.Exclude
    private EquipoTorneo ganador;

    // Ej: "6-4 4-6 7-5"
    private String resultado;

    @Enumerated(EnumType.STRING)
    private EstadoResultado estadoResultado;

    // Flag administrativo para W.O
    private boolean huboWalkover = false;

    // Fecha límite para concretarlo
    private LocalDateTime fechaLimiteJuego;

    // Si decidieron reservar una cancha a través de nuestro sistema
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    @ToString.Exclude
    private Reserva reservaAsociada;
}
