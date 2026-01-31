package com.clubset.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubset.dto.ReservaDTO;
import com.clubset.entity.Cancha;
import com.clubset.entity.Reserva;
import com.clubset.entity.Usuario;
import com.clubset.repository.CanchaRepository;
import com.clubset.repository.ReservaRepository;
import com.clubset.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CanchaRepository canchaRepository;

    public List<ReservaDTO> obtenerTodas() {
        return reservaRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    @Transactional
    public List<ReservaDTO> guardarReserva(ReservaDTO dto) {
        log.info("Iniciando creación de reserva...");

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Error: El usuario no existe."));

        Cancha cancha = canchaRepository.findById(dto.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Error: La cancha no existe."));

        if (dto.getFechaHora().getMinute() != 0) {
            throw new RuntimeException("Los turnos deben comenzar en hora en punto.");
        }

        int hora = dto.getFechaHora().getHour();
        if (hora < 9 || hora > 22) {
            throw new RuntimeException("El club permanece cerrado en ese horario.");
        }

        int semanas = (dto.getRepetirSemanas() == null || dto.getRepetirSemanas() < 1) ? 1 : dto.getRepetirSemanas();
        
        // Generamos código de grupo solo si son varias semanas
        String codigoGrupo = (semanas > 1) ? UUID.randomUUID().toString() : null;

        // VALIDACIÓN
        for (int i = 0; i < semanas; i++) {
            LocalDateTime fechaChequeo = dto.getFechaHora().plusWeeks(i);
            boolean ocupada = reservaRepository.existsByCanchaIdAndFechaHora(dto.getCanchaId(), fechaChequeo);
            if (ocupada) {
                throw new RuntimeException("No se puede crear el la reserva: La fecha " + fechaChequeo.toString() + " ya está ocupada.");
            }
        }

        // GUARDADO
        List<Reserva> reservasCreadas = new ArrayList<>();
        for (int i = 0; i < semanas; i++) {
            LocalDateTime fechaFinal = dto.getFechaHora().plusWeeks(i);

            Reserva reserva = new Reserva();
            reserva.setFechaHora(fechaFinal);
            reserva.setEstado("RESERVADA");
            reserva.setPagado(false);
            reserva.setUsuario(usuario);
            reserva.setCancha(cancha);
            reserva.setCodigoTurnoFijo(codigoGrupo);

            reservasCreadas.add(reservaRepository.save(reserva));
        }
        
        return reservasCreadas.stream().map(this::convertirADto).toList();
    }

    public void cancelarReserva(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new RuntimeException("No se puede cancelar: La reserva no existe.");
        }
        reservaRepository.deleteById(id);
    }

    public void cancelarTurnoFijo(String codigo) {
        log.info("Cancelando todo el grupo de reservas con código: {}", codigo);
        reservaRepository.deleteByCodigoTurnoFijo(codigo);
    }

    public ReservaDTO togglePago(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setPagado(!reserva.getPagado());
        Reserva actualizada = reservaRepository.save(reserva);
        return convertirADto(actualizada);
    }

    public String obtenerCodigoPorReservaId(Long id) {
        return reservaRepository.findById(id)
                .map(Reserva::getCodigoTurnoFijo)
                .orElse(null);
    }

    private ReservaDTO convertirADto(Reserva reserva) {
        ReservaDTO dto = new ReservaDTO();
        dto.setId(reserva.getId());
        dto.setFechaHora(reserva.getFechaHora());
        dto.setEstado(reserva.getEstado());
        dto.setPagado(reserva.getPagado());
        dto.setUsuarioId(reserva.getUsuario().getId());
        dto.setNombreUsuario(reserva.getUsuario().getNombre() + " " + reserva.getUsuario().getApellido());
        dto.setCanchaId(reserva.getCancha().getId());
        dto.setNombreCancha(reserva.getCancha().getNombre());
        
        // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
        // Ahora sí enviamos el código real al frontend
        dto.setCodigoTurnoFijo(reserva.getCodigoTurnoFijo());
        
        return dto;
    }
}