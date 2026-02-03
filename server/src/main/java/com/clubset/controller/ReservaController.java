package com.clubset.controller;

import lombok.Data; // Necesario para la clase interna
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.dto.ReservaDTO;
import com.clubset.service.ReservaService;
import com.clubset.enums.MetodoPago; // Asegúrate de importar esto

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@Slf4j
public class ReservaController {
    
    private final ReservaService reservaService;

    @GetMapping
    public List<ReservaDTO> listar() {
        return reservaService.obtenerTodas();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ReservaDTO reservaDTO) {
        try {
            List<ReservaDTO> nuevasReservas = reservaService.guardarReserva(reservaDTO);
            return ResponseEntity.ok(nuevasReservas);
        } catch (RuntimeException e) {
            log.warn("Error creando reserva: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok("Reserva cancelada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}/completo")
    public ResponseEntity<?> cancelarGrupo(@PathVariable Long id) {
        try {
            String codigo = reservaService.obtenerCodigoPorReservaId(id);
            
            if (codigo == null) {
                reservaService.cancelarReserva(id);
                return ResponseEntity.ok("Reserva única eliminada");
            }
            
            reservaService.cancelarTurnoFijo(codigo);
            return ResponseEntity.ok("Turno fijo completo eliminado correctamente");
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NUEVO ENDPOINT DE CAJA ---
    // Recibe un JSON como: { "monto": 500, "metodoPago": "EFECTIVO", "observacion": "Seña" }
    @PostMapping("/{id}/pagos")
    public ResponseEntity<?> registrarPago(@PathVariable Long id, @RequestBody PagoRequest request) {
        try {
            ReservaDTO actualizado = reservaService.registrarPago(
                id, 
                request.getMonto(), 
                request.getMetodoPago(), 
                request.getObservacion()
            );
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Mantenemos este por compatibilidad, pero idealmente el frontend migrará al de arriba
    @PutMapping("/{id}/pago")
    public ResponseEntity<?> togglePago(@PathVariable Long id) {
        try {
            ReservaDTO reservaActualizada = reservaService.togglePago(id);
            return ResponseEntity.ok(reservaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- DTO INTERNO PARA EL REQUEST DE PAGO ---
    // Al ser estático y pequeño, puede vivir aquí. 
    @Data
    public static class PagoRequest {
        private BigDecimal monto;
        private MetodoPago metodoPago;
        private String observacion;
    }
}