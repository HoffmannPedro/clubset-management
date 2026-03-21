package com.clubset.modules.torneo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.clubset.modules.torneo.dto.PartidoDTO;

import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@RequiredArgsConstructor
public class PartidoController {

    private final PartidoService partidoService;

    @GetMapping
    public List<PartidoDTO> listar() {
        return partidoService.obtenerTodos();
    }

    @PostMapping
    public PartidoDTO crear(@RequestBody Partido partido) {
        return partidoService.guardar(partido);
    }
}