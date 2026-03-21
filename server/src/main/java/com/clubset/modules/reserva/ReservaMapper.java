package com.clubset.modules.reserva;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.clubset.modules.reserva.dto.ReservaDTO;

// componentModel = "spring" hace que podamos inyectarlo con @Autowired o constructores
@Mapper(componentModel = "spring")
public interface ReservaMapper {

    @Mapping(source = "cancha.id", target = "canchaId")
    @Mapping(source = "cancha.nombre", target = "nombreCancha")
    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "precioPactado", target = "precio")
    // Resolvemos la lógica de "Socio vs Invitado" directamente en el mapeo
    @Mapping(target = "nombreUsuario", expression = "java(reserva.getUsuario() != null ? reserva.getUsuario().getNombre() + \" \" + reserva.getUsuario().getApellido() : reserva.getNombreContacto() + \" (Inv)\")")
    @Mapping(target = "saldoPendiente", expression = "java(com.clubset.core.shared.util.CalculadoraReserva.calcularSaldoPendiente(reserva))")
    
    // Ignoramos campos exclusivos de entrada (Write-only) para silenciar el warning del compilador
    @Mapping(target = "repetirSemanas", ignore = true)
    @Mapping(target = "montoAbonado", ignore = true)
    @Mapping(target = "metodoPago", ignore = true)
    ReservaDTO toDTO(Reserva reserva);

}