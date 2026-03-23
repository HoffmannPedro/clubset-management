package com.clubset.modules.torneo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.clubset.modules.torneo.dto.TorneoDTO;
import com.clubset.modules.torneo.dto.EquipoTorneoDTO;
import com.clubset.modules.torneo.dto.EquipoTorneoResponseDTO;
import com.clubset.modules.torneo.dto.PartidoTorneoDTO;

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
    public org.springframework.http.ResponseEntity<List<PartidoTorneoDTO>> generarFixtureAleatorio(@PathVariable Long id) {
        List<PartidoTorneoDTO> fixture = torneoService.generarFixtureAleatorio(id);
        return org.springframework.http.ResponseEntity.ok(fixture);
    }

    @PostMapping("/{id}/fixture/manual")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<List<PartidoTorneoDTO>> generarFixtureManual(
            @PathVariable Long id, 
            @RequestBody List<com.clubset.modules.torneo.dto.PartidoManualDTO> partidos) {
        
        List<PartidoTorneoDTO> fixture = torneoService.generarFixtureManual(id, partidos);
        return org.springframework.http.ResponseEntity.ok(fixture);
    }

    @GetMapping("/{id}/partidos")
    public org.springframework.http.ResponseEntity<List<PartidoTorneoDTO>> obtenerPartidos(@PathVariable Long id) {
        return org.springframework.http.ResponseEntity.ok(torneoService.obtenerPartidosPorTorneo(id));
    }

    @GetMapping("/{id}/equipos")
    public org.springframework.http.ResponseEntity<List<EquipoTorneoResponseDTO>> obtenerEquipos(@PathVariable Long id) {
        return org.springframework.http.ResponseEntity.ok(torneoService.obtenerEquiposPorTorneo(id));
    }

    @PostMapping("/{id}/equipos")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<EquipoTorneoResponseDTO> inscribirEquipo(
            @PathVariable Long id, 
            @RequestBody EquipoTorneoDTO dto) {
        EquipoTorneoResponseDTO inscripto = torneoService.inscribirEquipo(id, dto);
        return org.springframework.http.ResponseEntity.ok(inscripto);
    }

    @PutMapping("/{id}/estado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id, 
            @RequestParam com.clubset.modules.torneo.enums.EstadoTorneo estado) {
        torneoService.cambiarEstado(id, estado);
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<Void> eliminarTorneo(@PathVariable Long id) {
        torneoService.eliminarTorneo(id);
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @PutMapping("/{torneoId}/partidos/{partidoId}/resultado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<PartidoTorneoDTO> cargarResultado(
            @PathVariable Long torneoId,
            @PathVariable Long partidoId,
            @RequestBody com.clubset.modules.torneo.dto.ResultadoPartidoDTO dto) {
        PartidoTorneoDTO actualizado = torneoService.cargarResultado(torneoId, partidoId, dto);
        return org.springframework.http.ResponseEntity.ok(actualizado);
    }
}