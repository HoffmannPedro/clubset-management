package com.clubset.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubset.dto.ReservaDTO;
import com.clubset.entity.Cancha;
import com.clubset.entity.Pago;
import com.clubset.entity.Reserva;
import com.clubset.entity.Usuario;
import com.clubset.enums.MetodoPago;
import com.clubset.repository.CanchaRepository;
import com.clubset.repository.PagoRepository;
import com.clubset.repository.ReservaRepository;
import com.clubset.repository.UsuarioRepository;

import java.math.BigDecimal;
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
    private final PagoRepository pagoRepository;

    public List<ReservaDTO> obtenerTodas() {
        return reservaRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    @Transactional
    public List<ReservaDTO> guardarReserva(ReservaDTO dto) {
        log.info("Iniciando creación de reserva...");

        Cancha cancha = canchaRepository.findById(dto.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Error: La cancha no existe."));

        if (!Boolean.TRUE.equals(cancha.getDisponible())) {
            throw new RuntimeException("Esta cancha está en mantenimiento.");
        }

        Usuario usuario = null;
        String nombreFinal = dto.getNombreContacto();
        String telefonoFinal = dto.getTelefonoContacto();

        if (dto.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Error: El usuario no existe."));
        } else {
            if (dto.getNombreContacto() == null || dto.getNombreContacto().trim().isEmpty()) {
                throw new RuntimeException("Debe ingresar el Nombre del invitado.");
            }
            if (dto.getTelefonoContacto() == null || dto.getTelefonoContacto().trim().isEmpty()) {
                throw new RuntimeException("Debe ingresar un Teléfono.");
            }
        }

        if (dto.getFechaHora().getMinute() != 0) {
            throw new RuntimeException("Los turnos deben comenzar en hora en punto.");
        }
        int hora = dto.getFechaHora().getHour();
        if (hora < 9 || hora > 22) {
            throw new RuntimeException("El club está cerrado.");
        }

        int semanas = (dto.getRepetirSemanas() == null || dto.getRepetirSemanas() < 1) ? 1 : dto.getRepetirSemanas();
        String codigoGrupo = (semanas > 1) ? UUID.randomUUID().toString() : null;

        for (int i = 0; i < semanas; i++) {
            LocalDateTime fechaChequeo = dto.getFechaHora().plusWeeks(i);
            boolean ocupada = reservaRepository.existsByCanchaIdAndFechaHora(dto.getCanchaId(), fechaChequeo);
            if (ocupada) {
                throw new RuntimeException("Conflicto: La fecha " + fechaChequeo.toString() + " ocupada.");
            }
        }

        BigDecimal precioInicial = (dto.getPrecio() != null) ? dto.getPrecio() : new BigDecimal("2000.00");

        List<Reserva> reservasCreadas = new ArrayList<>();
        for (int i = 0; i < semanas; i++) {
            LocalDateTime fechaFinal = dto.getFechaHora().plusWeeks(i);

            Reserva reserva = new Reserva();
            reserva.setFechaHora(fechaFinal);
            reserva.setEstado("RESERVADA");
            reserva.setPagado(false);
            reserva.setCancha(cancha);
            reserva.setCodigoTurnoFijo(codigoGrupo);
            reserva.setPrecioPactado(precioInicial);
            
            if (usuario != null) {
                reserva.setUsuario(usuario);
            } else {
                reserva.setNombreContacto(nombreFinal);
                reserva.setTelefonoContacto(telefonoFinal);
            }

            reservasCreadas.add(reservaRepository.save(reserva));
        }
        
        return reservasCreadas.stream().map(this::convertirADto).toList();
    }

    @Transactional
    public ReservaDTO registrarPago(Long reservaId, BigDecimal monto, MetodoPago metodo, String observacion) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // --- VALIDACIÓN DE SEGURIDAD FINANCIERA ---
        // Impedimos que se pague más de lo que se debe.
        BigDecimal saldoActual = reserva.getSaldoPendiente();
        if (monto.compareTo(saldoActual) > 0) {
            throw new RuntimeException("Error: El monto ingresado ($" + monto + 
                                     ") supera el saldo pendiente ($" + saldoActual + ").");
        }
        // ------------------------------------------

        Pago pago = new Pago();
        pago.setMonto(monto);
        pago.setMetodoPago(metodo);
        pago.setFechaPago(LocalDateTime.now());
        pago.setObservacion(observacion);
        pago.setReserva(reserva);

        pagoRepository.save(pago);

        reserva.getPagos().add(pago); 
        
        if (reserva.getSaldoPendiente().compareTo(BigDecimal.ZERO) <= 0) {
            reserva.setPagado(true);
        } else {
            reserva.setPagado(false);
        }
        
        return convertirADto(reservaRepository.save(reserva));
    }

    public void cancelarReserva(Long id) {
        if (!reservaRepository.existsById(id)) throw new RuntimeException("Reserva no encontrada.");
        reservaRepository.deleteById(id);
    }

    public void cancelarTurnoFijo(String codigo) {
        reservaRepository.deleteByCodigoTurnoFijo(codigo);
    }
    
    public ReservaDTO togglePago(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setPagado(!reserva.getPagado());
        return convertirADto(reservaRepository.save(reserva));
    }

    public String obtenerCodigoPorReservaId(Long id) {
        return reservaRepository.findById(id).map(Reserva::getCodigoTurnoFijo).orElse(null);
    }

    private ReservaDTO convertirADto(Reserva reserva) {
        ReservaDTO dto = new ReservaDTO();
        dto.setId(reserva.getId());
        dto.setFechaHora(reserva.getFechaHora());
        dto.setEstado(reserva.getEstado());
        dto.setPagado(reserva.getPagado());
        
        dto.setPrecio(reserva.getPrecioPactado());
        dto.setSaldoPendiente(reserva.getSaldoPendiente());

        dto.setCanchaId(reserva.getCancha().getId());
        dto.setNombreCancha(reserva.getCancha().getNombre());
        dto.setCodigoTurnoFijo(reserva.getCodigoTurnoFijo());
        dto.setNombreContacto(reserva.getNombreContacto());
        dto.setTelefonoContacto(reserva.getTelefonoContacto());

        if (reserva.getUsuario() != null) {
            dto.setUsuarioId(reserva.getUsuario().getId());
            dto.setNombreUsuario(reserva.getUsuario().getNombre() + " " + reserva.getUsuario().getApellido());
        } else {
            dto.setUsuarioId(null);
            dto.setNombreUsuario(reserva.getNombreContacto() + " (Inv)");
        }
        
        return dto;
    }
}