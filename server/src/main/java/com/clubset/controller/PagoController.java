package com.clubset.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clubset.dto.ResumenCajaDTO;
import com.clubset.repository.PagoRepository;
import com.clubset.service.PagoService;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PagoService pagoService; // <-- NUEVO

    @GetMapping("/diarios")
    public ResponseEntity<ResumenCajaDTO> obtenerPagosDiarios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        LocalDate fechaConsulta = (fecha != null) ? fecha : LocalDate.now();
        return ResponseEntity.ok(pagoService.obtenerResumenDiario(fechaConsulta));
    }
}