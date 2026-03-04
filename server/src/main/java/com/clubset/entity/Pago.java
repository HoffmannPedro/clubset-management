package com.clubset.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.clubset.enums.MetodoPago;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPago metodoPago;

    private LocalDateTime fechaPago;
    
    private String observacion;

    // --- NUEVO: ¿Entra o sale plata? ---
    // Usamos String por simplicidad ("INGRESO" o "EGRESO")
    
    private String tipoMovimiento = "INGRESO";

    // --- EL CAMBIO CLAVE: nullable = true ---
    // Ahora un pago puede existir sin estar atado a un partido
    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = true)
    private Reserva reserva;
}