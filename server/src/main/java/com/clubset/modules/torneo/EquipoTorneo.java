package com.clubset.modules.torneo;

import com.clubset.modules.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipo_torneo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipoTorneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "torneo_id", nullable = false)
    @ToString.Exclude
    private Torneo torneo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario1_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario1;

    // Nullable para permitir modalidad Singles (donde solo juega u1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario2_id")
    @ToString.Exclude
    private Usuario usuario2;

    // Ej: "Federer", "Federer / Nadal"
    private String nombreEquipo;
}
