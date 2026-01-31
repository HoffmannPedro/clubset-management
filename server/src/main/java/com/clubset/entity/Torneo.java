package com.clubset.entity;

import jakarta.persistence.*;
import lombok.*;
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

    // Relación: Un torneo tiene muchos partidos
    // mappedBy indica que la relación se "manda" desde el campo 'torneo' en la clase Partido
    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Partido> partidos;
}