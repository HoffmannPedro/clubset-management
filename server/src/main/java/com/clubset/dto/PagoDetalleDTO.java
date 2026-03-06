package com.clubset.dto;

import java.math.BigDecimal;

public record PagoDetalleDTO(
    Long id,
    BigDecimal monto,
    String metodoPago,
    String hora,
    String observacion,
    String nombreCliente,
    String tipoCliente,
    String nombreCancha,
    String tipoMovimiento
) {}