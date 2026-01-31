package com.clubset.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.dto.ReservaDTO;
import com.clubset.service.ReservaService;

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
    
    // --- NUEVO ENDPOINT: Cancelar TODO el grupo ---
    // Usamos el ID de UNA de las reservas para encontrar el grupo y borrarlo
    @DeleteMapping("/{id}/completo")
    public ResponseEntity<?> cancelarGrupo(@PathVariable Long id) {
        try {
            // 1. Buscamos el código del grupo usando el ID de la reserva
            String codigo = reservaService.obtenerCodigoPorReservaId(id);
            
            if (codigo == null) {
                // Si no tiene código (es reserva vieja o única), borramos solo esa
                reservaService.cancelarReserva(id);
                return ResponseEntity.ok("Reserva única eliminada (no pertenecía a un grupo)");
            }
            
            // 2. Si tiene código, borramos TODAS
            reservaService.cancelarTurnoFijo(codigo);
            return ResponseEntity.ok("Turno fijo completo eliminado correctamente");
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/pago")
    public ResponseEntity<?> togglePago(@PathVariable Long id) {
        try {
            ReservaDTO reservaActualizada = reservaService.togglePago(id);
            return ResponseEntity.ok(reservaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}