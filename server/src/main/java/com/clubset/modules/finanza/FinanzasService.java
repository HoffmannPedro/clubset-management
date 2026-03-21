package com.clubset.modules.finanza;

import com.clubset.core.shared.util.CalculadoraReserva;
import com.clubset.modules.usuario.dto.MovimientoPerfilDTO;
import com.clubset.modules.reserva.Reserva;
import com.clubset.modules.reserva.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanzasService {

    private final ReservaRepository reservaRepository;

    public List<MovimientoPerfilDTO> obtenerHistorialFinanciero(Long usuarioId) {
        List<MovimientoPerfilDTO> historial = new ArrayList<>();

        // 1. Buscamos todas las reservas del usuario (Cargos / Deudas)
        List<Reserva> reservas = reservaRepository.findByUsuarioId(usuarioId);

        for (Reserva r : reservas) {
            java.math.BigDecimal saldo = CalculadoraReserva.calcularSaldoPendiente(r);
            String estadoCondicional;
            if (saldo.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                estadoCondicional = "PAGADO";
            } else if (saldo.compareTo(r.getPrecioPactado()) < 0) {
                estadoCondicional = "PAGO PARCIAL";
            } else {
                estadoCondicional = "PENDIENTE";
            }

            historial.add(new MovimientoPerfilDTO(
                    "RESERVA",
                    "Alquiler Cancha: " + r.getCancha().getNombre(),
                    r.getFechaHora(),
                    r.getPrecioPactado(), // Valor histórico inmutable del consumo
                    estadoCondicional));
        }

        // 3. Ordenamos todo cronológicamente (del más nuevo al más viejo)
        return historial.stream()
                .sorted(Comparator.comparing(MovimientoPerfilDTO::getFecha).reversed())
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<MovimientoPerfilDTO> obtenerHistorialFinancieroPaginado(Long usuarioId, org.springframework.data.domain.Pageable pageable) {
        return reservaRepository.findByUsuarioId(usuarioId, pageable)
                .map(r -> {
                    java.math.BigDecimal saldo = CalculadoraReserva.calcularSaldoPendiente(r);
                    String estadoCondicional;
                    if (saldo.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                        estadoCondicional = "PAGADO";
                    } else if (saldo.compareTo(r.getPrecioPactado()) < 0) {
                        estadoCondicional = "PAGO PARCIAL";
                    } else {
                        estadoCondicional = "PENDIENTE";
                    }
                    return new MovimientoPerfilDTO(
                            "RESERVA",
                            "Alquiler Cancha: " + r.getCancha().getNombre(),
                            r.getFechaHora(),
                            r.getPrecioPactado(),
                            estadoCondicional);
                });
    }
}