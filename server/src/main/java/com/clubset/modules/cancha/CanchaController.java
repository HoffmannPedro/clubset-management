package com.clubset.modules.cancha;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.clubset.modules.cancha.dto.CanchaDTO;

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
    
    // NUEVO ENDPOINT PARA ACTIVAR/DESACTIVAR
    @PatchMapping("/{id}/toggle")
    public CanchaDTO toggleEstado(@PathVariable Long id) {
        return canchaService.toggleEstado(id);
    }
}