package com.clubset.core.shared.util;

import com.clubset.modules.reserva.Reserva;
import com.clubset.modules.finanza.Pago;

import java.math.BigDecimal;

public class CalculadoraReserva {

    private CalculadoraReserva() {
        // Constructor privado para ocultar el implícito público (regla Sonar/Clean Code)
    }

    public static BigDecimal calcularSaldoPendiente(Reserva reserva) {
        if (reserva.getPrecioPactado() == null) return BigDecimal.ZERO;
        BigDecimal totalPagado = reserva.getPagos() != null ? 
                reserva.getPagos().stream()
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add) 
                : BigDecimal.ZERO;
        return reserva.getPrecioPactado().subtract(totalPagado);
    }
}
