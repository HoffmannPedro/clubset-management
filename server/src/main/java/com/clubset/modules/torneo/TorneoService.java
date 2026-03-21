package com.clubset.modules.torneo;

import com.clubset.modules.torneo.dto.PartidoManualDTO;
import com.clubset.modules.torneo.enums.EstadoResultado;
import com.clubset.modules.torneo.enums.EstadoTorneo;
import com.clubset.modules.torneo.enums.FaseTorneo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TorneoService {

    private final TorneoRepository torneoRepository;
    private final EquipoTorneoRepository equipoTorneoRepository;
    private final PartidoTorneoRepository partidoTorneoRepository;

    public List<com.clubset.modules.torneo.dto.TorneoDTO> obtenerTodos() {
        return torneoRepository.findAll().stream().map(t -> {
            com.clubset.modules.torneo.dto.TorneoDTO dto = new com.clubset.modules.torneo.dto.TorneoDTO();
            dto.setId(t.getId());
            dto.setNombre(t.getNombre());
            dto.setFechaInicio(t.getFechaInicio());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public com.clubset.modules.torneo.dto.TorneoDTO guardar(Torneo torneo) {
        Torneo saved = torneoRepository.save(torneo);
        com.clubset.modules.torneo.dto.TorneoDTO dto = new com.clubset.modules.torneo.dto.TorneoDTO();
        dto.setId(saved.getId());
        dto.setNombre(saved.getNombre());
        dto.setFechaInicio(saved.getFechaInicio());
        return dto;
    }

    @Transactional
    public List<PartidoTorneo> generarFixtureAleatorio(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        if (torneo.getEstado() != EstadoTorneo.INSCRIPCION_CERRADA) {
            throw new IllegalStateException("El torneo debe estar en INSCRIPCION_CERRADA para armar llaves");
        }

        List<EquipoTorneo> inscriptos = torneo.getEquiposInscriptos();
        int n = inscriptos.size();
        if (n < 2) {
            throw new IllegalStateException("No hay suficientes inscriptos para armar llaves");
        }

        // 1. Calcular Potencia de 2 más cercana hacia arriba
        int p = Integer.highestOneBit(n - 1) * 2;
        int byes = p - n;

        // 2. Mezclar Equipos
        List<EquipoTorneo> shuffled = new ArrayList<>(inscriptos);
        Collections.shuffle(shuffled);

        List<PartidoTorneo> llaves = new ArrayList<>();
        FaseTorneo faseInicial = calcularFaseInicial(p);

        int equipoIndex = 0;
        int totalPartidos = p / 2;

        for (int i = 0; i < totalPartidos; i++) {
            PartidoTorneo partido = new PartidoTorneo();
            partido.setTorneo(torneo);
            partido.setFase(faseInicial);
            partido.setEstadoResultado(EstadoResultado.SIN_JUGAR);

            if (i < byes) {
                // Generar Bye (Pasa directo el equipo1)
                partido.setEquipo1(shuffled.get(equipoIndex++));
                partido.setEquipo2(null);
                partido.setGanador(partido.getEquipo1());
                partido.setHuboWalkover(false);
                partido.setResultado("BYE");
                partido.setEstadoResultado(EstadoResultado.CONFIRMADO);
            } else {
                // Partido Normal
                partido.setEquipo1(shuffled.get(equipoIndex++));
                partido.setEquipo2(shuffled.get(equipoIndex++));
            }
            llaves.add(partido);
        }

        partidoTorneoRepository.saveAll(llaves);

        // Mutar Torneo
        torneo.setEstado(EstadoTorneo.EN_CURSO);
        torneoRepository.save(torneo);

        return llaves;
    }

    @Transactional
    public List<PartidoTorneo> generarFixtureManual(Long torneoId, List<PartidoManualDTO> dtoPartidos) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        if (torneo.getEstado() != EstadoTorneo.INSCRIPCION_CERRADA) {
            throw new IllegalStateException("El torneo debe estar en INSCRIPCION_CERRADA para armar llaves");
        }

        List<PartidoTorneo> llaves = new ArrayList<>();
        int p = dtoPartidos.size() * 2;
        FaseTorneo faseInicial = calcularFaseInicial(p);

        for (PartidoManualDTO dto : dtoPartidos) {
            PartidoTorneo partido = new PartidoTorneo();
            partido.setTorneo(torneo);
            partido.setFase(faseInicial);
            partido.setEstadoResultado(EstadoResultado.SIN_JUGAR);

            EquipoTorneo eq1 = equipoTorneoRepository.findById(dto.getEquipo1Id())
                    .orElseThrow(() -> new RuntimeException("Equipo 1 no encontrado"));
            partido.setEquipo1(eq1);

            if (dto.getEquipo2Id() == null) {
                // Es un Bye manual
                partido.setEquipo2(null);
                partido.setGanador(eq1);
                partido.setHuboWalkover(false);
                partido.setResultado("BYE");
                partido.setEstadoResultado(EstadoResultado.CONFIRMADO);
            } else {
                EquipoTorneo eq2 = equipoTorneoRepository.findById(dto.getEquipo2Id())
                        .orElseThrow(() -> new RuntimeException("Equipo 2 no encontrado"));
                partido.setEquipo2(eq2);
            }

            llaves.add(partido);
        }

        partidoTorneoRepository.saveAll(llaves);

        torneo.setEstado(EstadoTorneo.EN_CURSO);
        torneoRepository.save(torneo);

        return llaves;
    }

    private FaseTorneo calcularFaseInicial(int potencia) {
        return switch (potencia) {
            case 2 -> FaseTorneo.FINAL;
            case 4 -> FaseTorneo.SEMI;
            case 8 -> FaseTorneo.CUARTOS;
            case 16 -> FaseTorneo.OCTAVOS;
            case 32 -> FaseTorneo.DIECISEISAVOS;
            default -> FaseTorneo.RONDA_PRELIMINAR; // Mas de 32 equipos
        };
    }
}