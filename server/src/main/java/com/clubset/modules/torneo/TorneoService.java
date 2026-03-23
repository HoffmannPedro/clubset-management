package com.clubset.modules.torneo;

import com.clubset.modules.torneo.dto.PartidoManualDTO;
import com.clubset.modules.torneo.dto.EquipoTorneoDTO;
import com.clubset.modules.torneo.enums.EstadoResultado;
import com.clubset.modules.torneo.enums.EstadoTorneo;
import com.clubset.modules.torneo.enums.FaseTorneo;
import com.clubset.modules.torneo.enums.ModalidadTorneo;
import com.clubset.modules.usuario.Usuario;
import com.clubset.modules.torneo.dto.EquipoTorneoResponseDTO;
import com.clubset.modules.torneo.dto.PartidoTorneoDTO;
import com.clubset.modules.torneo.mapper.TorneoMapper;
import com.clubset.modules.usuario.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;
    private final TorneoMapper torneoMapper;

    public List<com.clubset.modules.torneo.dto.TorneoDTO> obtenerTodos() {
        return torneoMapper.toTorneoDTOList(torneoRepository.findAll());
    }

    @Transactional
    public com.clubset.modules.torneo.dto.TorneoDTO guardar(Torneo torneo) {
        if (torneo.getEstado() == null) {
            torneo.setEstado(com.clubset.modules.torneo.enums.EstadoTorneo.INSCRIPCION_ABIERTA);
        }
        Torneo saved = torneoRepository.save(torneo);
        return torneoMapper.toTorneoDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PartidoTorneoDTO> obtenerPartidosPorTorneo(Long torneoId) {
        // Deben ser recuperados estrictamente en orden de insercion posicional (Fase ASC, Orden Llave ASC)
        // para preservar el orden y la estructura de bracket de la interfaz gráfica de React.
        return torneoMapper.toPartidoTorneoDTOList(
            partidoTorneoRepository.findByTorneoIdOrderByFaseAscOrdenLlaveAsc(torneoId)
        );
    }

    @Transactional(readOnly = true)
    public List<EquipoTorneoResponseDTO> obtenerEquiposPorTorneo(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
        
        org.hibernate.Hibernate.initialize(torneo.getEquiposInscriptos());
        for (EquipoTorneo eq : torneo.getEquiposInscriptos()) {
            org.hibernate.Hibernate.initialize(eq.getUsuario1());
            if (eq.getUsuario2() != null) {
                org.hibernate.Hibernate.initialize(eq.getUsuario2());
            }
        }
        return torneoMapper.toEquipoTorneoResponseDTOList(torneo.getEquiposInscriptos());
    }

    @Transactional
    public EquipoTorneoResponseDTO inscribirEquipo(Long torneoId, EquipoTorneoDTO dto) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        if (torneo.getEstado() == null) {
            torneo.setEstado(com.clubset.modules.torneo.enums.EstadoTorneo.INSCRIPCION_ABIERTA);
            torneoRepository.save(torneo);
        }

        if (torneo.getEstado() != EstadoTorneo.BORRADOR && torneo.getEstado() != EstadoTorneo.INSCRIPCION_ABIERTA) {
            throw new IllegalStateException("El torneo no permite inscripciones en este momento.");
        }

        Usuario u1 = usuarioRepository.findById(dto.getUsuario1Id())
                .orElseThrow(() -> new RuntimeException("Usuario 1 no encontrado"));
        Usuario u2 = null;

        if (torneo.getModalidad() == ModalidadTorneo.DOBLES) {
            if (dto.getUsuario2Id() == null) {
                throw new IllegalArgumentException("La modalidad Dobles exige 2 jugadores.");
            }
            if (dto.getUsuario1Id().equals(dto.getUsuario2Id())) {
                throw new IllegalArgumentException("No puedes inscribir al mismo jugador dos veces en un equipo Dobles.");
            }
            u2 = usuarioRepository.findById(dto.getUsuario2Id())
                    .orElseThrow(() -> new RuntimeException("Usuario 2 no encontrado"));
        } else if (dto.getUsuario2Id() != null) {
            throw new IllegalArgumentException("La modalidad Singles admite 1 solo jugador.");
        }

        // Se podrían chequear inscripciones cruzadas aquí (si u1 ya está en otro EquipoTorneo del mismo torneo)

        EquipoTorneo equipo = new EquipoTorneo();
        equipo.setTorneo(torneo);
        equipo.setUsuario1(u1);
        equipo.setUsuario2(u2);
        
        // Asignación de nombre autogenerado o custom
        if (torneo.getModalidad() == ModalidadTorneo.SINGLES) {
            equipo.setNombreEquipo(u1.getNombre() + " " + u1.getApellido());
        } else {
            equipo.setNombreEquipo(dto.getNombreEquipo() != null && !dto.getNombreEquipo().isBlank() 
                ? dto.getNombreEquipo() 
                : u1.getApellido() + " / " + u2.getApellido());
        }

        EquipoTorneo saved = equipoTorneoRepository.save(equipo);
        return torneoMapper.toEquipoTorneoResponseDTO(saved);
    }

    @Transactional
    public void cambiarEstado(Long torneoId, com.clubset.modules.torneo.enums.EstadoTorneo nuevoEstado) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
        torneo.setEstado(nuevoEstado);
        torneoRepository.save(torneo);
    }

    @Transactional
    public void eliminarTorneo(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
        torneoRepository.delete(torneo);
    }

    @Transactional
    public List<PartidoTorneoDTO> generarFixtureAleatorio(Long torneoId) {
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

        List<PartidoTorneo> partidos = new java.util.ArrayList<>();
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
            partido.setOrdenLlave(i);
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

        // 2. Generar el resto del árbol (Rondas futuras vacías hasta la Final)
        int partidosEnRonda = totalPartidos / 2;
        FaseTorneo faseActual = calcularSiguienteFase(faseInicial);
        
        while (partidosEnRonda >= 1 && faseActual != null) {
            for (int i = 0; i < partidosEnRonda; i++) {
                PartidoTorneo partidoVacio = new PartidoTorneo();
                partidoVacio.setTorneo(torneo);
                partidoVacio.setFase(faseActual);
                partidoVacio.setOrdenLlave(i);
                partidoVacio.setEstadoResultado(EstadoResultado.SIN_JUGAR);
                llaves.add(partidoVacio);
            }
            partidosEnRonda /= 2;
            faseActual = calcularSiguienteFase(faseActual);
        }

        partidoTorneoRepository.saveAll(llaves);

        for (PartidoTorneo pt : llaves) {
            if ("BYE".equals(pt.getResultado()) && pt.getGanador() != null) {
                propagarGanador(torneo.getId(), pt, pt.getGanador());
            }
        }

        // Mutar Torneo
        torneo.setEstado(EstadoTorneo.EN_CURSO);
        torneoRepository.save(torneo);

        return torneoMapper.toPartidoTorneoDTOList(
            partidoTorneoRepository.findByTorneoIdOrderByFaseAscOrdenLlaveAsc(torneoId)
        );
    }

    @Transactional
    public List<PartidoTorneoDTO> generarFixtureManual(Long torneoId, List<PartidoManualDTO> dtoPartidos) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        if (torneo.getEstado() != EstadoTorneo.INSCRIPCION_CERRADA) {
            throw new IllegalStateException("El torneo debe estar en INSCRIPCION_CERRADA para armar llaves");
        }

        List<PartidoTorneo> llaves = new ArrayList<>();
        int p = dtoPartidos.size() * 2;
        FaseTorneo faseInicial = calcularFaseInicial(p);

        int i = 0;
        for (PartidoManualDTO dto : dtoPartidos) {
            PartidoTorneo partido = new PartidoTorneo();
            partido.setTorneo(torneo);
            partido.setFase(faseInicial);
            partido.setOrdenLlave(i++);
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

        // Generar rondas vacías para fixture manual
        int totalPartidosManuales = dtoPartidos.size();
        int partidosEnRonda = totalPartidosManuales / 2;
        FaseTorneo faseActual = calcularSiguienteFase(faseInicial);
        
        while (partidosEnRonda >= 1 && faseActual != null) {
            for (int j = 0; j < partidosEnRonda; j++) {
                PartidoTorneo partidoVacio = new PartidoTorneo();
                partidoVacio.setTorneo(torneo);
                partidoVacio.setFase(faseActual);
                partidoVacio.setOrdenLlave(j);
                partidoVacio.setEstadoResultado(EstadoResultado.SIN_JUGAR);
                llaves.add(partidoVacio);
            }
            partidosEnRonda /= 2;
            faseActual = calcularSiguienteFase(faseActual);
        }

        partidoTorneoRepository.saveAll(llaves);

        for (PartidoTorneo pt : llaves) {
            if ("BYE".equals(pt.getResultado()) && pt.getGanador() != null) {
                propagarGanador(torneo.getId(), pt, pt.getGanador());
            }
        }

        torneo.setEstado(EstadoTorneo.EN_CURSO);
        torneoRepository.save(torneo);

        return torneoMapper.toPartidoTorneoDTOList(
            partidoTorneoRepository.findByTorneoIdOrderByFaseAscOrdenLlaveAsc(torneoId)
        );
    }

    @Transactional
    public PartidoTorneoDTO cargarResultado(Long torneoId, Long partidoId, com.clubset.modules.torneo.dto.ResultadoPartidoDTO dto) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        PartidoTorneo partido = partidoTorneoRepository.findById(partidoId)
                .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

        if (!partido.getTorneo().getId().equals(torneoId)) {
            throw new IllegalArgumentException("El partido no pertenece a este torneo.");
        }

        if (partido.getEstadoResultado() == EstadoResultado.CONFIRMADO) {
            throw new IllegalStateException("Este partido ya tiene un resultado confirmado.");
        }

        // Validar que el ganador sea uno de los dos equipos
        EquipoTorneo ganador = equipoTorneoRepository.findById(dto.getGanadorId())
                .orElseThrow(() -> new RuntimeException("Equipo ganador no encontrado"));

        boolean esEquipo1 = partido.getEquipo1() != null && partido.getEquipo1().getId().equals(dto.getGanadorId());
        boolean esEquipo2 = partido.getEquipo2() != null && partido.getEquipo2().getId().equals(dto.getGanadorId());

        if (!esEquipo1 && !esEquipo2) {
            throw new IllegalArgumentException("El ganador debe ser uno de los equipos del partido.");
        }

        // Asentar resultado
        partido.setGanador(ganador);
        partido.setResultado(dto.getResultado());
        partido.setHuboWalkover(dto.isWalkover());
        partido.setEstadoResultado(EstadoResultado.CONFIRMADO);
        partidoTorneoRepository.save(partido);

        // Propagar al ganador a la siguiente ronda
        propagarGanador(torneoId, partido, ganador);

        return torneoMapper.toPartidoTorneoDTO(partido);
    }

    private void propagarGanador(Long torneoId, PartidoTorneo partido, EquipoTorneo ganador) {
        FaseTorneo faseActual = partido.getFase();
        FaseTorneo siguienteFase = calcularSiguienteFase(faseActual);

        if (siguienteFase != null) {
            List<PartidoTorneo> todosLosPartidos = partidoTorneoRepository.findByTorneoIdOrderByFaseAscOrdenLlaveAsc(torneoId);

            Integer myIndex = partido.getOrdenLlave();

            if (myIndex != null) {
                List<PartidoTorneo> partidosSiguienteFase = todosLosPartidos.stream()
                        .filter(p -> p.getFase() == siguienteFase)
                        .collect(Collectors.toList());

                int nextIndex = myIndex / 2;
                PartidoTorneo siguientePartido = partidosSiguienteFase.stream()
                        .filter(p -> p.getOrdenLlave() != null && p.getOrdenLlave() == nextIndex)
                        .findFirst()
                        .orElse(null);

                if (siguientePartido != null) {
                    if (myIndex % 2 == 0) {
                        siguientePartido.setEquipo1(ganador);
                    } else {
                        siguientePartido.setEquipo2(ganador);
                    }
                    partidoTorneoRepository.save(siguientePartido);
                }
            }
        } else {
            // Es la FINAL → Torneo terminado
            Torneo torneo = torneoRepository.findById(torneoId).orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
            torneo.setEstado(EstadoTorneo.FINALIZADO);
            torneoRepository.save(torneo);
        }
    }

    private FaseTorneo calcularFaseInicial(int potencia) {
        return switch (potencia) {
            case 2 -> FaseTorneo.FINAL;
            case 4 -> FaseTorneo.SEMI;
            case 8 -> FaseTorneo.CUARTOS;
            case 16 -> FaseTorneo.OCTAVOS;
            case 32 -> FaseTorneo.DIECISEISAVOS;
            default -> FaseTorneo.RONDA_PRELIMINAR;
        };
    }

    private FaseTorneo calcularSiguienteFase(FaseTorneo actual) {
        return switch (actual) {
            case RONDA_PRELIMINAR -> FaseTorneo.DIECISEISAVOS;
            case DIECISEISAVOS -> FaseTorneo.OCTAVOS;
            case OCTAVOS -> FaseTorneo.CUARTOS;
            case CUARTOS -> FaseTorneo.SEMI;
            case SEMI -> FaseTorneo.FINAL;
            case FINAL -> null;
            case TERCER_PUESTO -> null;
        };
    }
}