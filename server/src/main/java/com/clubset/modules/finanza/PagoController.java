package com.clubset.modules.finanza;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.modules.finanza.dto.ResumenCajaDTO;
import com.clubset.core.shared.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;


@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService; // <-- NUEVO

    @GetMapping("/diarios")
    public ResponseEntity<ResumenCajaDTO> obtenerPagosDiarios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        LocalDate fechaConsulta = (fecha != null) ? fecha : LocalDate.now();
        return ResponseEntity.ok(pagoService.obtenerResumenDiario(fechaConsulta));
    }

    @PostMapping("/gasto")
    public ResponseEntity<String> registrarGasto(@RequestBody java.util.Map<String, Object> payload) {
        try {
            BigDecimal monto = new BigDecimal(payload.get("monto").toString());
            MetodoPago metodo = MetodoPago.valueOf(payload.get("metodoPago").toString());
            String observacion = (String) payload.get("observacion");

            pagoService.registrarGasto(monto, metodo, observacion);
            return ResponseEntity.ok("Gasto registrado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar el gasto: " + e.getMessage());
        }
    }
}