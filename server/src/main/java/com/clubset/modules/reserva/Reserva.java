package com.clubset.modules.reserva;

import com.clubset.modules.usuario.Usuario;
import com.clubset.modules.cancha.Cancha;
import com.clubset.modules.finanza.Pago;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal; // Importante
import java.util.List;       // Importante
import java.util.ArrayList;  // Importante

@Entity
@Table(name = "reserva", 
       indexes = {@Index(name = "idx_reserva_fecha_hora", columnList = "fechaHora")},
       uniqueConstraints = {@UniqueConstraint(name = "uk_cancha_fecha", columnNames = {"cancha_id", "fecha_hora"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;
    private String estado;

    // Mantenemos este booleano para consultas rápidas visuales (semáforo rojo/verde)
    @Column(nullable = false)
    private Boolean pagado = false; 
    
    // NUEVO: Precio pactado al momento de reservar.
    @Column(precision = 10, scale = 2)
    private BigDecimal precioPactado;

    // NUEVO: Relación inversa para poder acceder a los pagos desde la reserva
    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 50)
    private List<Pago> pagos = new ArrayList<>();

    private String codigoTurnoFijo;

    // Nombre manual para invitados
    private String nombreContacto;
    
    // NUEVO: Teléfono obligatorio para invitados
    private String telefonoContacto;

    // MODIFICADO: Puede ser NULL (nullable = true)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = true) 
    @ToString.Exclude
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancha_id", nullable = false)
    @ToString.Exclude
    private Cancha cancha;
    

}