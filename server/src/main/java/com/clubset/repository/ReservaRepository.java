package com.clubset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.clubset.entity.Reserva;

import java.time.LocalDateTime;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    boolean existsByCanchaIdAndFechaHora(Long canchaId, LocalDateTime fechaHora);

    // NUEVO: Borrar todas las reservas que tengan el mismo código de grupo
    @Modifying
    @Transactional
    @Query("DELETE FROM Reserva r WHERE r.codigoTurnoFijo = :codigo")
    void deleteByCodigoTurnoFijo(String codigo);
}