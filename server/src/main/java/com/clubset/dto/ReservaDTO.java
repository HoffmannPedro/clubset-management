package com.clubset.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservaDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private String estado;
    private Boolean pagado;
    private Long usuarioId;
    private String nombreUsuario;
    private Long canchaId;
    private String nombreCancha;
    
    private Integer repetirSemanas; 
    
    // NUEVO: Para que el frontend sepa si esta reserva pertenece a un grupo
    private String codigoTurnoFijo;
}