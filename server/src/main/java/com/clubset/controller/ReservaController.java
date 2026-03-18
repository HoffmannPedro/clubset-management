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
import java.security.Principal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {
    
    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<Page<ReservaDTO>> listar(
            @PageableDefault(size = 20, sort = "fechaHora", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reservaService.obtenerTodas(pageable));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<ReservaDTO>> listarPorFecha(@PathVariable String fecha) {
        return ResponseEntity.ok(reservaService.obtenerPorFecha(LocalDate.parse(fecha)));
    }

    @GetMapping("/rango")
    public ResponseEntity<List<ReservaDTO>> listarPorRango(
            @RequestParam String inicio, 
            @RequestParam String fin) {
        LocalDate fechaInicio = LocalDate.parse(inicio);
        LocalDate fechaFin = LocalDate.parse(fin);
        return ResponseEntity.ok(reservaService.obtenerPorRango(fechaInicio, fechaFin));
    }

    @PostMapping
    public ResponseEntity<List<ReservaDTO>> crear(@RequestBody ReservaDTO reservaDTO, Principal principal) {
        // Cero lógica, cero manejo de errores. Solo delegar.
        return ResponseEntity.ok(reservaService.guardarReserva(reservaDTO, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelar(@PathVariable Long id, Principal principal) {
        reservaService.cancelarReserva(id, principal.getName());
        return ResponseEntity.ok("Reserva cancelada correctamente");
    }
    
    @DeleteMapping("/{id}/completo")
    public ResponseEntity<String> cancelarGrupo(@PathVariable Long id, Principal principal) {
        String codigo = reservaService.obtenerCodigoPorReservaId(id);
        
        if (codigo == null) {
            reservaService.cancelarReserva(id, principal.getName());
            return ResponseEntity.ok("Reserva única eliminada");
        }
        
        reservaService.cancelarTurnoFijo(codigo, principal.getName());
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