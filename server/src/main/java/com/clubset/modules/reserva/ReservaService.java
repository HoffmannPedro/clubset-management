package com.clubset.modules.reserva;

import com.clubset.modules.finanza.PagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.clubset.modules.reserva.dto.ReservaDTO;
import com.clubset.modules.cancha.Cancha;
import com.clubset.modules.finanza.Pago;
import com.clubset.modules.usuario.Usuario;
import com.clubset.core.shared.enums.MetodoPago;
import com.clubset.core.shared.enums.RolUsuario;
import com.clubset.modules.cancha.CanchaRepository;
import com.clubset.modules.usuario.UsuarioRepository;
import com.clubset.core.shared.util.CalculadoraReserva;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final PagoService pagoService;
    private final ReservaMapper reservaMapper;

    // Inyectamos valores desde application.properties. Si no existen, usan el valor
    // por defecto tras los dos puntos (:)
    @Value("${club.horario.apertura:8}")
    private int horaApertura;

    @Value("${club.horario.cierre:23}")
    private int horaCierre;

    @Value("${club.precio.base:2000.00}")
    private BigDecimal precioBase;

    public Page<ReservaDTO> obtenerTodas(Pageable pageable) {
        return reservaRepository.findAll(pageable)
                .map(reservaMapper::toDTO);
    }

    public List<ReservaDTO> obtenerPorFecha(LocalDate fecha) {
        LocalDateTime inicioDia = fecha.atStartOfDay();
        LocalDateTime finDia = fecha.atTime(LocalTime.MAX);

        return reservaRepository.findByFechaHoraBetween(inicioDia, finDia).stream()
                .map(reservaMapper::toDTO)
                .toList();
    }

    public List<ReservaDTO> obtenerPorRango(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicioDia = fechaInicio.atStartOfDay();
        LocalDateTime finDia = fechaFin.atTime(LocalTime.MAX);

        return reservaRepository.findByFechaHoraBetween(inicioDia, finDia).stream()
                .map(reservaMapper::toDTO)
                .toList();
    }

    @Transactional
    public List<ReservaDTO> guardarReserva(ReservaDTO dto, Usuario usuarioAutenticado) {
        log.info("Iniciando creación de reserva...");

        validarReglasDeHorario(dto.getFechaHora());

        Cancha cancha = canchaRepository.findById(dto.getCanchaId())
                .orElseThrow(() -> new IllegalArgumentException("Error: La cancha no existe."));

        if (!Boolean.TRUE.equals(cancha.getDisponible())) {
            throw new IllegalStateException("Esta cancha está en mantenimiento.");
        }

        Usuario usuario = resolveUsuarioTarget(dto, usuarioAutenticado);

        int semanas = (dto.getRepetirSemanas() == null || dto.getRepetirSemanas() < 1) ? 1 : dto.getRepetirSemanas();
        String codigoGrupo = (semanas > 1) ? UUID.randomUUID().toString() : null;

        for (int i = 0; i < semanas; i++) {
            LocalDateTime fechaChequeo = dto.getFechaHora().plusWeeks(i);
            if (reservaRepository.existsByCanchaIdAndFechaHora(dto.getCanchaId(), fechaChequeo)) {
                throw new IllegalStateException(
                        "Conflicto: La cancha ya está reservada para el día " + fechaChequeo.toString());
            }
        }

        // Eliminamos el hardcodeo new BigDecimal("2000.00"). Usamos la propiedad
        // inyectada.
        // Lo ideal a futuro es que el precio venga de cancha.getPrecio()
        BigDecimal precioInicial = (dto.getPrecio() != null) ? dto.getPrecio() : precioBase;
        BigDecimal totalEsperado = precioInicial.multiply(new BigDecimal(semanas));

        if (dto.getMontoAbonado() != null && dto.getMontoAbonado().compareTo(totalEsperado) > 0) {
            throw new IllegalArgumentException("El monto ingresado ($" + dto.getMontoAbonado()
                    + ") supera el total de la reserva ($" + totalEsperado + ").");
        }

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
                reserva.setNombreContacto(dto.getNombreContacto());
                reserva.setTelefonoContacto(dto.getTelefonoContacto());
            }

            try {
                reservasCreadas.add(reservaRepository.saveAndFlush(reserva));
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                throw new IllegalStateException("Conflicto: La cancha ya fue reservada en otro proceso simultáneo para el día " + fechaFinal.toString());
            }
        }

        imputarSaldoAdelantado(reservasCreadas, dto.getMontoAbonado(), dto.getMetodoPago(), semanas);

        return reservasCreadas.stream().map(reservaMapper::toDTO).toList();
    }

    private void validarReglasDeHorario(LocalDateTime fechaHora) {
        if (fechaHora.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("No se pueden crear reservas en el pasado.");
        }
        if (fechaHora.getMinute() != 0) {
            throw new IllegalArgumentException("Los turnos deben comenzar en hora en punto (ej: 18:00, no 18:30).");
        }
        if (fechaHora.getHour() < horaApertura || fechaHora.getHour() >= horaCierre) {
            throw new IllegalArgumentException(
                    "El club está cerrado. Horario de atención: " + horaApertura + "hs a " + horaCierre + "hs.");
        }
    }

    private Usuario resolveUsuarioTarget(ReservaDTO dto, Usuario usuarioEjecutor) {
        // Verificamos si es un administrador
        boolean isAdmin = usuarioEjecutor.getRol() == RolUsuario.ADMIN; // Expandible a EMPLEADO si lo agregas luego

        if (isAdmin) {
            // ESCENARIO B (Administrador): Tiene permiso para asignar reservas a otros o a
            // invitados
            if (dto.getUsuarioId() != null) {
                return usuarioRepository.findById(dto.getUsuarioId())
                        .orElseThrow(() -> new IllegalArgumentException("Error: El socio seleccionado no existe."));
            } else {
                // Es una reserva para un invitado sin cuenta
                if (dto.getNombreContacto() == null || dto.getNombreContacto().trim().isEmpty()) {
                    throw new IllegalArgumentException("Debe ingresar el Nombre del invitado.");
                }
                if (dto.getTelefonoContacto() == null || dto.getTelefonoContacto().trim().isEmpty()) {
                    throw new IllegalArgumentException("Debe ingresar un Teléfono.");
                }
                return null;
            }
        } else {
            // ESCENARIO A (Socio/Jugador): Solo puede reservar para SÍ MISMO.
            // Ignoramos olímpicamente el usuarioId que venga en el DTO (Evita
            // vulnerabilidad IDOR)
            return usuarioEjecutor;
        }
    }

    @Transactional
    public ReservaDTO registrarPago(Long reservaId, BigDecimal monto, MetodoPago metodo, String observacion) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        BigDecimal saldoActual = CalculadoraReserva.calcularSaldoPendiente(reserva);
        if (monto.compareTo(saldoActual) > 0) {
            throw new IllegalArgumentException(
                    "Error: El monto ingresado ($" + monto + ") supera el saldo pendiente ($" + saldoActual + ").");
        }

        Pago pago = pagoService.asentarPago(reserva, monto, metodo, observacion);
        reserva.getPagos().add(pago);

        if (CalculadoraReserva.calcularSaldoPendiente(reserva).compareTo(BigDecimal.ZERO) <= 0) {
            reserva.setPagado(true);
        } else {
            reserva.setPagado(false);
        }

        return reservaMapper.toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public void cancelarReserva(Long id, Usuario usuarioAutenticado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada."));

        validarPermisoCancelacion(reserva, usuarioAutenticado);

        if (!reserva.getPagos().isEmpty()) {
            throw new IllegalStateException(
                    "CONTABILIDAD: No se puede eliminar una reserva que tiene pagos registrados. Ajuste la caja primero.");
        }

        reservaRepository.delete(reserva);
    }

    @Transactional
    public void cancelarTurnoFijo(String codigo, Usuario usuarioAutenticado) {
        List<Reserva> reservasDelGrupo = reservaRepository.findByCodigoTurnoFijo(codigo);

        if (!reservasDelGrupo.isEmpty()) {
            validarPermisoCancelacion(reservasDelGrupo.get(0), usuarioAutenticado);
        }

        for (Reserva res : reservasDelGrupo) {
            if (!res.getPagos().isEmpty()) {
                throw new IllegalStateException(
                        "CONTABILIDAD: Este turno fijo ya tiene pagos asociados en una o más fechas. No se puede eliminar en bloque.");
            }
        }

        reservaRepository.deleteByCodigoTurnoFijo(codigo);
    }

    private void validarPermisoCancelacion(Reserva reserva, Usuario usuarioAutenticado) {
        boolean isAdmin = usuarioAutenticado.getRol() == RolUsuario.ADMIN;
        boolean isPropietario = reserva.getUsuario() != null
                && reserva.getUsuario().getId().equals(usuarioAutenticado.getId());

        if (!isAdmin && !isPropietario) {
            throw new SecurityException("Acceso denegado: No tienes permiso para cancelar esta reserva.");
        }
    }

    public ReservaDTO togglePago(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
        reserva.setPagado(!reserva.getPagado());
        return reservaMapper.toDTO(reservaRepository.save(reserva));
    }

    public String obtenerCodigoPorReservaId(Long id) {
        return reservaRepository.findById(id).map(Reserva::getCodigoTurnoFijo).orElse(null);
    }

    private void imputarSaldoAdelantado(List<Reserva> reservas, BigDecimal saldoDisponible, String metodoPagoStr, int semanas) {
        if (saldoDisponible == null || saldoDisponible.compareTo(BigDecimal.ZERO) <= 0) return;
        MetodoPago metodo = MetodoPago.valueOf(metodoPagoStr);

        for (Reserva res : reservas) {
            if (saldoDisponible.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal precioCancha = res.getPrecioPactado();
            BigDecimal montoAImputar = (saldoDisponible.compareTo(precioCancha) >= 0) ? precioCancha : saldoDisponible;

            String obs = semanas > 1 ? "Pago adelantado (Turno Fijo)" : "Pago adelantado";
            Pago pago = pagoService.asentarPago(res, montoAImputar, metodo, obs);
            res.getPagos().add(pago);

            if (CalculadoraReserva.calcularSaldoPendiente(res).compareTo(BigDecimal.ZERO) <= 0) {
                res.setPagado(true);
            }
            reservaRepository.save(res);

            saldoDisponible = saldoDisponible.subtract(montoAImputar);
        }
    }
}