package com.clubset.modules.torneo.mapper;

import com.clubset.modules.torneo.EquipoTorneo;
import com.clubset.modules.torneo.PartidoTorneo;
import com.clubset.modules.torneo.Torneo;
import com.clubset.modules.torneo.dto.EquipoTorneoResponseDTO;
import com.clubset.modules.torneo.dto.PartidoTorneoDTO;
import com.clubset.modules.torneo.dto.TorneoDTO;
import com.clubset.modules.usuario.UsuarioMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = { UsuarioMapper.class })
public interface TorneoMapper {

    TorneoDTO toTorneoDTO(Torneo torneo);
    List<TorneoDTO> toTorneoDTOList(List<Torneo> torneos);

    EquipoTorneoResponseDTO toEquipoTorneoResponseDTO(EquipoTorneo equipoTorneo);
    List<EquipoTorneoResponseDTO> toEquipoTorneoResponseDTOList(List<EquipoTorneo> equipos);

    PartidoTorneoDTO toPartidoTorneoDTO(PartidoTorneo partidoTorneo);
    List<PartidoTorneoDTO> toPartidoTorneoDTOList(List<PartidoTorneo> partidos);
}
