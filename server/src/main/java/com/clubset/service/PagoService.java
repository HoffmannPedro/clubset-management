package com.clubset.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubset.entity.Pago;
import com.clubset.enums.MetodoPago;
import com.clubset.repository.PagoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;

    @Transactional
    public void registrarGasto(BigDecimal monto, MetodoPago metodo, String observacion) {
        Pago gasto = new Pago();
        gasto.setMonto(monto);
        gasto.setMetodoPago(metodo);
        gasto.setFechaPago(LocalDateTime.now());
        gasto.setObservacion(observacion);
        gasto.setTipoMovimiento("EGRESO"); // Marcamos como salida de dinero
        
        pagoRepository.save(gasto);
    }
}