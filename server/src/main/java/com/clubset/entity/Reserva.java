package com.clubset.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal; // Importante
import java.util.List;       // Importante
import java.util.ArrayList;  // Importante

@Entity
@Table(name = "reserva")
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
    private List<Pago> pagos = new ArrayList<>();

    private String codigoTurnoFijo;

    // Nombre manual para invitados
    private String nombreContacto;
    
    // NUEVO: Teléfono obligatorio para invitados
    private String telefonoContacto;

    // MODIFICADO: Puede ser NULL (nullable = true)
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = true) 
    @ToString.Exclude
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "cancha_id", nullable = false)
    @ToString.Exclude
    private Cancha cancha;
    
    // Helper para saber cuánto falta pagar (Lógica de negocio en la entidad)
    public BigDecimal getSaldoPendiente() {
        if (precioPactado == null) return BigDecimal.ZERO;
        
        BigDecimal totalPagado = pagos.stream()
            .map(Pago::getMonto)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return precioPactado.subtract(totalPagado);
    }
}