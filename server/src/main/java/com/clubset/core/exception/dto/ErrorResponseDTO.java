package com.clubset.core.exception.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponseDTO(
    int status,
    String error,
    String message,
    String path,
    List<String> details,
    LocalDateTime timestamp
) {}