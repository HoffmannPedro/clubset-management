package com.clubset.service;

import com.clubset.dto.PagoDetalleDTO;
import com.clubset.dto.ResumenCajaDTO;
import com.clubset.entity.Pago;
import com.clubset.entity.Reserva;
import com.clubset.enums.MetodoPago;
import com.clubset.enums.TipoMovimiento;
import com.clubset.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;

    @Transactional(readOnly = true)
    public ResumenCajaDTO obtenerResumenDiario(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Pago> pagos = pagoRepository.findByFechaPagoBetween(inicio, fin);

        // Mapeamos a DTOs
        List<PagoDetalleDTO> movimientos = pagos.stream()
                .map(this::mapToDetalleDTO)
                .toList();

        // Calculamos totales usando BigDecimal de forma segura
        BigDecimal ingresos = pagos.stream()
                .filter(p -> p.getTipoMovimiento() == TipoMovimiento.INGRESO)
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal egresos = pagos.stream()
                .filter(p -> p.getTipoMovimiento() == TipoMovimiento.EGRESO)
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ResumenCajaDTO(
                movimientos,
                ingresos,
                egresos,
                ingresos.subtract(egresos));
    }

    private PagoDetalleDTO mapToDetalleDTO(Pago p) {
        Reserva r = p.getReserva();
        String nombreCliente = (p.getTipoMovimiento() == TipoMovimiento.EGRESO) ? "GASTO OPERATIVO" : "SIN CLIENTE";
        String tipoCliente = (p.getTipoMovimiento() == TipoMovimiento.EGRESO) ? "EGRESO" : "OTRO";
        String nombreCancha = "-";

        if (r != null) {
            nombreCancha = r.getCancha().getNombre();
            if (r.getUsuario() != null) {
                nombreCliente = r.getUsuario().getNombre() + " " + r.getUsuario().getApellido();
                tipoCliente = "SOCIO";
            } else {
                nombreCliente = r.getNombreContacto();
                tipoCliente = "INVITADO";
            }
        }

        // Uso de Formatter en lugar de substring para evitar errores de índice
        String horaFormateada = p.getFechaPago().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));

        return new PagoDetalleDTO(
                p.getId(),
                p.getMonto(),
                p.getMetodoPago().name(),
                horaFormateada,
                p.getObservacion(),
                nombreCliente,
                tipoCliente,
                nombreCancha,
                p.getTipoMovimiento().name());
    }

    @Transactional
    public void registrarGasto(BigDecimal monto, MetodoPago metodo, String observacion) {
        Pago gasto = new Pago();
        gasto.setMonto(monto);
        gasto.setMetodoPago(metodo);
        gasto.setFechaPago(LocalDateTime.now());
        gasto.setObservacion(observacion);
        gasto.setTipoMovimiento(TipoMovimiento.EGRESO);

        pagoRepository.save(gasto);
    }
}