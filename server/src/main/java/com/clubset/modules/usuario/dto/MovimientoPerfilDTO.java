package com.clubset.modules.usuario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoPerfilDTO {
    private String tipo; // "CARGO" (Reserva) o "ABONO" (Pago)
    private String concepto; // "Cancha 1 (Polvo)" o "Pago Efectivo"
    private LocalDateTime fecha;
    private BigDecimal monto;
    private String estado; // "PENDIENTE", "PAGADO" o "COMPLETADO"
}