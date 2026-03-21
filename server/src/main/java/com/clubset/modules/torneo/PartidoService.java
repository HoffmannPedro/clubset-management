package com.clubset.modules.torneo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.clubset.modules.torneo.dto.PartidoDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartidoService {
    private final PartidoRepository partidoRepository;
    private final TorneoRepository torneoRepository;

    public List<PartidoDTO> obtenerTodos() {
        return partidoRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    public PartidoDTO guardar(Partido partido) {
    if (!torneoRepository.existsById(partido.getTorneo().getId())) {
        throw new RuntimeException("No se puede crear el partido: El torneo no existe.");
    }
    Partido guardado = partidoRepository.save(partido);
    return convertirADto(guardado);
}

    // Helpers
    private PartidoDTO convertirADto(Partido partido) {
        PartidoDTO dto = new PartidoDTO();
        dto.setId(partido.getId());
        dto.setFecha(partido.getFecha());
        dto.setFase(partido.getFase());
        
        // Aplanamos la relación con Torneo
        if (partido.getTorneo() != null) {
            dto.setTorneoId(partido.getTorneo().getId());
        }
        
        return dto;
    }
}