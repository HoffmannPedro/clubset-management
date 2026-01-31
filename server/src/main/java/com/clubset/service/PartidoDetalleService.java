package com.clubset.service;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

import com.clubset.dto.PartidoDetalleDTO;
import com.clubset.entity.PartidoDetalle;
import com.clubset.repository.PartidoDetalleRepository;
import com.clubset.repository.PartidoRepository;
import com.clubset.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PartidoDetalleService {
    private final PartidoDetalleRepository detalleRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<PartidoDetalleDTO> obtenerTodos() {
        return detalleRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    public PartidoDetalleDTO guardar(PartidoDetalle detalle) {
        if (!partidoRepository.existsById(detalle.getPartido().getId())) {
            throw new RuntimeException("Partido no encontrado.");
        }
        if (!usuarioRepository.existsById(detalle.getUsuario().getId())) {
            throw new RuntimeException("Usuario/Jugador no encontrado.");
        }
        detalleRepository.save(detalle);
        return convertirADto(detalle);
    }

    // Helpers
    private PartidoDetalleDTO convertirADto(PartidoDetalle detalle) {
        PartidoDetalleDTO dto = new PartidoDetalleDTO();
        dto.setId(detalle.getId());
        dto.setSetsGanados(detalle.getSetsGanados());
        dto.setGamesGanados(detalle.getGamesGanados());
        dto.setEsGanador(detalle.isEsGanador());
        
        // Extraemos IDs y nombres de las relaciones
        if (detalle.getPartido() != null) {
            dto.setPartidoId(detalle.getPartido().getId());
        }
        
        if (detalle.getUsuario() != null) {
            dto.setUsuarioId(detalle.getUsuario().getId());
            dto.setNombreUsuario(detalle.getUsuario().getNombre());
        }
        
        return dto;
    }
}