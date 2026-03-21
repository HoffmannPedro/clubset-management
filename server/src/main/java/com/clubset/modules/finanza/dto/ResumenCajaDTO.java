package com.clubset.modules.finanza.dto;

import java.math.BigDecimal;
import java.util.List;

// Este DTO envuelve toda la respuesta de la caja
public record ResumenCajaDTO(
    List<PagoDetalleDTO> movimientos,
    BigDecimal totalIngresos,
    BigDecimal totalEgresos,
    BigDecimal saldoTotal
) {}