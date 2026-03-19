package com.clubset.dto.response;

import java.time.LocalDateTime;

public record ErrorResponseDTO(
    int status,
    String error,
    String message,
    LocalDateTime timestamp
) {}