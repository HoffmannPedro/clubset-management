package com.clubset.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.dto.ReservaDTO;
import com.clubset.service.ReservaService;
import com.clubset.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {
    
    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listar() {
        return ResponseEntity.ok(reservaService.obtenerTodas());
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<ReservaDTO>> listarPorFecha(@PathVariable String fecha) {
        return ResponseEntity.ok(reservaService.obtenerPorFecha(LocalDate.parse(fecha)));
    }

    @PostMapping
    public ResponseEntity<List<ReservaDTO>> crear(@RequestBody ReservaDTO reservaDTO) {
        // Cero lógica, cero manejo de errores. Solo delegar.
        return ResponseEntity.ok(reservaService.guardarReserva(reservaDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelar(@PathVariable Long id) {
        reservaService.cancelarReserva(id);
        return ResponseEntity.ok("Reserva cancelada correctamente");
    }
    
    @DeleteMapping("/{id}/completo")
    public ResponseEntity<String> cancelarGrupo(@PathVariable Long id) {
        String codigo = reservaService.obtenerCodigoPorReservaId(id);
        
        if (codigo == null) {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok("Reserva única eliminada");
        }
        
        reservaService.cancelarTurnoFijo(codigo);
        return ResponseEntity.ok("Turno fijo completo eliminado correctamente");
    }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<ReservaDTO> registrarPago(@PathVariable Long id, @RequestBody PagoRequest request) {
        return ResponseEntity.ok(reservaService.registrarPago(
            id, request.monto(), request.metodoPago(), request.observacion()
        ));
    }

    @PutMapping("/{id}/pago")
    public ResponseEntity<ReservaDTO> togglePago(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.togglePago(id));
    }

    public record PagoRequest(BigDecimal monto, MetodoPago metodoPago, String observacion) {}
}