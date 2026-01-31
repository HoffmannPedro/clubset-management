package com.clubset.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.clubset.dto.CanchaDTO;
import com.clubset.entity.Cancha;
import com.clubset.repository.CanchaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CanchaService {
    private final CanchaRepository canchaRepository;

    public List<CanchaDTO> obtenerTodas() {
        return canchaRepository.findAll().stream().map(
                this::convertirADto
        ).toList(
        );
    }

    public CanchaDTO guardarCancha(Cancha cancha) {
        Cancha guardada = canchaRepository.save(cancha);
        return convertirADto(guardada);
    }

    // Helpers
    private CanchaDTO convertirADto(Cancha cancha) {
        CanchaDTO dto = new CanchaDTO();
        dto.setId(cancha.getId());
        dto.setNombre(cancha.getNombre());
        dto.setSuperficie(cancha.getSuperficie());
        return dto;
    }
}