package com.clubset.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PartidoDTO {
    private Long id;
    private LocalDateTime fecha;
    private String fase;
    private Long torneoId;
}