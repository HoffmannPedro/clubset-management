package com.clubset.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.entity.Pago;
import com.clubset.entity.Reserva;
import com.clubset.repository.PagoRepository;
import com.clubset.service.PagoService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PagoService pagoService; // <-- NUEVO

    @GetMapping("/diarios")
    public ResponseEntity<List<PagoDetalleDTO>> obtenerPagosDiarios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        
        LocalDate fechaConsulta = (fecha != null) ? fecha : LocalDate.now();

        LocalDateTime inicio = fechaConsulta.atStartOfDay();
        LocalDateTime fin = fechaConsulta.atTime(LocalTime.MAX);

        List<Pago> pagos = pagoRepository.findByFechaPagoBetween(inicio, fin);

        List<PagoDetalleDTO> dtos = pagos.stream().map(p -> {
            PagoDetalleDTO dto = new PagoDetalleDTO();
            dto.setId(p.getId());
            dto.setMonto(p.getMonto());
            dto.setMetodoPago(p.getMetodoPago().name());
            dto.setHora(p.getFechaPago().toLocalTime().toString().substring(0, 5));
            dto.setObservacion(p.getObservacion());
            dto.setTipoMovimiento(p.getTipoMovimiento()); // <-- NUEVO

            Reserva r = p.getReserva();
            
            // Lógica segura: ¿Es ingreso de cancha o es un gasto del club?
            if (r != null) {
                dto.setNombreCancha(r.getCancha().getNombre());
                if (r.getUsuario() != null) {
                    dto.setNombreCliente(r.getUsuario().getNombre() + " " + r.getUsuario().getApellido());
                    dto.setTipoCliente("SOCIO");
                } else {
                    dto.setNombreCliente(r.getNombreContacto());
                    dto.setTipoCliente("INVITADO");
                }
            } else {
                dto.setNombreCancha("-");
                dto.setNombreCliente("GASTO OPERATIVO");
                dto.setTipoCliente("EGRESO");
            }
            
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    // --- NUEVO ENDPOINT PARA GASTOS ---
    @PostMapping("/gasto")
    public ResponseEntity<?> registrarGastoManual(@RequestBody GastoRequestDTO request) {
        pagoService.registrarGasto(
            request.getMonto(),
            com.clubset.enums.MetodoPago.valueOf(request.getMetodoPago()),
            request.getObservacion()
        );
        return ResponseEntity.ok().body("Gasto registrado correctamente");
    }

    // DTO interno para recibir el gasto
    @Data
    public static class GastoRequestDTO {
        private BigDecimal monto;
        private String metodoPago;
        private String observacion;
    }

    @Data
    public static class PagoDetalleDTO {
        private Long id;
        private BigDecimal monto;
        private String metodoPago;
        private String hora;
        private String observacion;
        private String nombreCliente;
        private String tipoCliente;
        private String nombreCancha;
        private String tipoMovimiento; // <-- NUEVO
    }
}