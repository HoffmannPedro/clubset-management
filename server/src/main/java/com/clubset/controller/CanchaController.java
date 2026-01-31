package com.clubset.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.clubset.dto.CanchaDTO;
import com.clubset.entity.Cancha;
import com.clubset.service.CanchaService;

import java.util.List;

@RestController
@RequestMapping("/api/canchas")
@RequiredArgsConstructor
public class CanchaController {
    private final CanchaService canchaService;

    @GetMapping
    public List<CanchaDTO> listar() {
        return canchaService.obtenerTodas();
    }

    @PostMapping
    public CanchaDTO crear(@RequestBody Cancha cancha) {
        return canchaService.guardarCancha(cancha);
    }
}