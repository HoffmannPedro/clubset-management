package com.clubset.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.clubset.dto.TorneoDTO;
import com.clubset.entity.Torneo;
import com.clubset.repository.TorneoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TorneoService {
    private final TorneoRepository torneoRepository;

    public List<TorneoDTO> obtenerTodos() {
        return torneoRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    public TorneoDTO guardar(Torneo torneo) {
        torneoRepository.save(torneo);
        return convertirADto(torneo);
    }

    // Helpers
    private TorneoDTO convertirADto(Torneo torneo) {
        TorneoDTO dto = new TorneoDTO();
        dto.setId(torneo.getId());
        dto.setNombre(torneo.getNombre());
        dto.setFechaInicio(torneo.getFechaInicio());
        return dto;
    }
}