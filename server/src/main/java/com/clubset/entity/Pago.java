package com.clubset.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.clubset.enums.MetodoPago;
import com.clubset.enums.TipoMovimiento;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Getter
@Setter
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipoMovimiento = TipoMovimiento.INGRESO;

    @ManyToOne(fetch = FetchType.LAZY) // Agregamos LAZY por performance
    @JoinColumn(name = "reserva_id", nullable = true)
    private Reserva reserva;

    
    // Sobrescribimos Equals y HashCode manualmente basándonos solo en el ID
    // Esto evita ciclos infinitos y problemas con Hibernate
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pago pago = (Pago) o;
        return id != null && id.equals(pago.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}