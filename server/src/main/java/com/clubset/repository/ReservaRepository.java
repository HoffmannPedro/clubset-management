package com.clubset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.clubset.entity.Reserva;

import java.time.LocalDateTime;
import java.util.List; // <--- Importante

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

        boolean existsByCanchaIdAndFechaHora(Long canchaId, LocalDateTime fechaHora);

        // --- ELIMINAMOS LA QUERY QUE DABA ERROR ---
        // En su lugar, usamos este método mágico de Spring Data:
        List<Reserva> findByUsuarioIdAndPagadoFalse(Long usuarioId);

        // Mantenemos el historial
        List<Reserva> findTop5ByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);

        Long countByUsuarioId(Long usuarioId);

        @Modifying
        @Query("DELETE FROM Reserva r WHERE r.codigoTurnoFijo = :codigo")
        void deleteByCodigoTurnoFijo(@Param("codigo") String codigo);
}