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
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public TorneoDTO crear(@RequestBody Torneo torneo) {
        return torneoService.guardar(torneo);
    }

    @PostMapping("/{id}/fixture/aleatorio")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<List<PartidoTorneo>> generarFixtureAleatorio(@PathVariable Long id) {
        List<PartidoTorneo> fixture = torneoService.generarFixtureAleatorio(id);
        return org.springframework.http.ResponseEntity.ok(fixture);
    }

    @PostMapping("/{id}/fixture/manual")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<List<PartidoTorneo>> generarFixtureManual(
            @PathVariable Long id, 
            @RequestBody List<com.clubset.modules.torneo.dto.PartidoManualDTO> partidos) {
        
        List<PartidoTorneo> fixture = torneoService.generarFixtureManual(id, partidos);
        return org.springframework.http.ResponseEntity.ok(fixture);
    }
}