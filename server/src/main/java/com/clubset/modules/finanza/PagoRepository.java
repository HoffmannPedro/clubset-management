package com.clubset.modules.finanza;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    // Busca pagos entre una fecha de inicio y fin (ej: 00:00 a 23:59)
    List<Pago> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
}