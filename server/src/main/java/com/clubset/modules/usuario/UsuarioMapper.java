package com.clubset.modules.usuario;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.clubset.modules.usuario.dto.UsuarioDTO;
import com.clubset.modules.usuario.dto.MovimientoPerfilDTO;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    // Mapeamos los campos calculados que vienen por parámetro
    @Mapping(target = "deudaTotal", source = "deuda")
    @Mapping(target = "partidosJugados", source = "partidos")
    @Mapping(target = "ultimosMovimientos", source = "movimientos")
    // El resto de los campos (nombre, email, rol, etc.) MapStruct los saca de 'usuario' automáticamente
    UsuarioDTO toDTO(Usuario usuario, BigDecimal deuda, Long partidos, List<MovimientoPerfilDTO> movimientos);
}