package com.clubset.service;

import com.clubset.dto.MovimientoPerfilDTO;
import com.clubset.entity.Pago;
import com.clubset.entity.Reserva;
import com.clubset.repository.ReservaRepository;
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
            historial.add(new MovimientoPerfilDTO(
                    "CARGO",
                    "Reserva: " + r.getCancha().getNombre(),
                    r.getFechaHora(),
                    r.getPrecioPactado(), // El monto total que costaba
                    r.getPagado() ? "PAGADO" : "PENDIENTE"));

            // 2. Por cada reserva, buscamos sus pagos (Abonos)
            // Ya que el Pago tiene el reserva_id, los iteramos
            for (Pago p : r.getPagos()) {
                // Validación estricta para ignorar nulls, vacíos ("") o espacios (" ")
                String textoObservacion = (p.getObservacion() != null && !p.getObservacion().isBlank())
                        ? " (" + p.getObservacion().trim() + ")"
                        : "";

                historial.add(new MovimientoPerfilDTO(
                        "ABONO",
                        "Pago: " + p.getMetodoPago().name() + textoObservacion,
                        p.getFechaPago(),
                        p.getMonto(),
                        "COMPLETADO"));
            }
        }

        // 3. Ordenamos todo cronológicamente (del más nuevo al más viejo)
        return historial.stream()
                .sorted(Comparator.comparing(MovimientoPerfilDTO::getFecha).reversed())
                .collect(Collectors.toList());
    }
}