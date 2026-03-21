package com.clubset.modules.finanza;

import com.clubset.core.shared.util.CalculadoraReserva;
import com.clubset.modules.usuario.dto.MovimientoPerfilDTO;
import com.clubset.modules.reserva.Reserva;
import com.clubset.modules.reserva.ReservaRepository;
import com.clubset.modules.torneo.EquipoTorneo;
import com.clubset.modules.torneo.EquipoTorneoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanzasService {

    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final EquipoTorneoRepository equipoTorneoRepository;

    public List<MovimientoPerfilDTO> obtenerHistorialFinanciero(Long usuarioId) {
        List<MovimientoPerfilDTO> historial = new ArrayList<>();

        // 1. Historial de Reservas
        List<Reserva> reservas = reservaRepository.findByUsuarioId(usuarioId);
        for (Reserva r : reservas) {
            BigDecimal saldo = CalculadoraReserva.calcularSaldoPendiente(r);
            String estadoCondicional;
            if (saldo.compareTo(BigDecimal.ZERO) <= 0) {
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
                    r.getPrecioPactado(),
                    estadoCondicional));
        }

        // 2. Historial de Torneos
        List<EquipoTorneo> equipos = equipoTorneoRepository.findByUsuarioIdIncludingTorneo(usuarioId);
        for (EquipoTorneo e : equipos) {
            BigDecimal costo = e.getTorneo().getCostoInscripcion();
            if (costo != null && costo.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pagado = pagoRepository.sumMontoByTorneoAndUsuario(e.getTorneo().getId(), usuarioId);
                BigDecimal saldo = costo.subtract(pagado);

                String estadoCondicional;
                if (saldo.compareTo(BigDecimal.ZERO) <= 0) {
                    estadoCondicional = "PAGADO";
                } else if (saldo.compareTo(costo) < 0) {
                    estadoCondicional = "PAGO PARCIAL";
                } else {
                    estadoCondicional = "PENDIENTE";
                }

                // Generamos una fecha artificial (fechaInicio) para ordenarlo cronológicamente
                java.time.LocalDateTime fechaRef = e.getTorneo().getFechaInicio() != null 
                        ? e.getTorneo().getFechaInicio().atStartOfDay() 
                        : java.time.LocalDateTime.now();
                        
                historial.add(new MovimientoPerfilDTO(
                        "TORNEO",
                        "Inscripción Torneo: " + e.getTorneo().getNombre(),
                        fechaRef,
                        costo,
                        estadoCondicional));
            }
        }

        // 3. Ordenamos cronológicamente (del más reciente al más antiguo)
        return historial.stream()
                .sorted(Comparator.comparing(MovimientoPerfilDTO::getFecha).reversed())
                .collect(Collectors.toList());
    }

    public Page<MovimientoPerfilDTO> obtenerHistorialFinancieroPaginado(Long usuarioId, Pageable pageable) {
        List<MovimientoPerfilDTO> todoHistorial = obtenerHistorialFinanciero(usuarioId);
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), todoHistorial.size());
        
        List<MovimientoPerfilDTO> subList = (start <= todoHistorial.size()) ? todoHistorial.subList(start, end) : new ArrayList<>();
        
        return new PageImpl<>(subList, pageable, todoHistorial.size());
    }
}