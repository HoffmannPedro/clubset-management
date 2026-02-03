package com.clubset.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.entity.Pago;
import com.clubset.entity.Reserva;
import com.clubset.repository.PagoRepository;

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

    @GetMapping("/diarios")
    public ResponseEntity<List<PagoDetalleDTO>> obtenerPagosDiarios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        
        // Si no mandan fecha, usamos HOY
        LocalDate fechaConsulta = (fecha != null) ? fecha : LocalDate.now();

        // Configuramos rango: 00:00:00 a 23:59:59
        LocalDateTime inicio = fechaConsulta.atStartOfDay();
        LocalDateTime fin = fechaConsulta.atTime(LocalTime.MAX);

        List<Pago> pagos = pagoRepository.findByFechaPagoBetween(inicio, fin);

        // Convertimos a DTO plano para la tabla
        List<PagoDetalleDTO> dtos = pagos.stream().map(p -> {
            PagoDetalleDTO dto = new PagoDetalleDTO();
            dto.setId(p.getId());
            dto.setMonto(p.getMonto());
            dto.setMetodoPago(p.getMetodoPago().name());
            dto.setHora(p.getFechaPago().toLocalTime().toString().substring(0, 5)); // HH:mm
            dto.setObservacion(p.getObservacion());
            
            // Datos de la reserva asociada
            Reserva r = p.getReserva();
            dto.setNombreCancha(r.getCancha().getNombre());
            
            if (r.getUsuario() != null) {
                dto.setNombreCliente(r.getUsuario().getNombre() + " " + r.getUsuario().getApellido());
                dto.setTipoCliente("SOCIO");
            } else {
                dto.setNombreCliente(r.getNombreContacto());
                dto.setTipoCliente("INVITADO");
            }
            
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    // DTO interno para respuesta rápida
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
    }
}