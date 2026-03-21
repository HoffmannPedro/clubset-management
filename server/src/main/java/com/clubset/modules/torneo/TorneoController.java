package com.clubset.modules.torneo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.clubset.modules.torneo.dto.TorneoDTO;

import java.util.List;

@RestController
@RequestMapping("/api/torneos")
@RequiredArgsConstructor
public class TorneoController {

    private final TorneoService torneoService;

    @GetMapping
    public List<TorneoDTO> listar() {
        return torneoService.obtenerTodos();
    }

    @PostMapping
    public TorneoDTO crear(@RequestBody Torneo torneo) {
        return torneoService.guardar(torneo);
    }
}