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
        return canchaRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    public CanchaDTO guardarCancha(Cancha cancha) {
        if (cancha.getDisponible() == null)
            cancha.setDisponible(true);
        return convertirADto(canchaRepository.save(cancha));
    }

    // Método necesario para activar/desactivar canchas
    public CanchaDTO toggleEstado(Long id) {
        Cancha cancha = canchaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        // Invertimos el valor (true -> false / false -> true)
        // Usamos Boolean.TRUE.equals para evitar nulos
        boolean nuevoEstado = !Boolean.TRUE.equals(cancha.getDisponible());
        cancha.setDisponible(nuevoEstado);

        Cancha actualizada = canchaRepository.save(cancha);
        return convertirADto(actualizada);
    }

    // Helpers
    private CanchaDTO convertirADto(Cancha cancha) {
        CanchaDTO dto = new CanchaDTO();
        dto.setId(cancha.getId());
        dto.setNombre(cancha.getNombre());
        dto.setSuperficie(cancha.getSuperficie());
        dto.setDisponible(cancha.getDisponible());
        return dto;
    }
}