package com.clubset.dto;
import lombok.Data;
import java.math.BigDecimal; // Importante
import java.time.LocalDateTime;

@Data
public class ReservaDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private String estado;
    private Boolean pagado;
    
    // --- NUEVOS CAMPOS FINANCIEROS ---
    private BigDecimal precio;          // El precio que se pactó
    private BigDecimal saldoPendiente;  // Cuánto falta pagar
    // ---------------------------------

    private Long usuarioId;
    private String nombreUsuario;
    
    // Datos para invitados
    private String nombreContacto; 
    private String telefonoContacto;

    private Long canchaId;
    private String nombreCancha;
    private Integer repetirSemanas; 
    private String codigoTurnoFijo;
}