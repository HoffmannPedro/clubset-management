package com.clubset.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.clubset.dto.PartidoDetalleDTO;
import com.clubset.entity.PartidoDetalle;
import com.clubset.service.PartidoDetalleService;

@RestController
@RequestMapping("/api/partido-detalles")
@RequiredArgsConstructor
public class PartidoDetalleController {

    private final PartidoDetalleService detalleService;

    @GetMapping
    public List<PartidoDetalleDTO> listar() {
        return detalleService.obtenerTodos();
    }
    
    @PostMapping
    public PartidoDetalleDTO cargarResultado(@RequestBody PartidoDetalle detalle) {
        return detalleService.guardar(detalle);
    }
}