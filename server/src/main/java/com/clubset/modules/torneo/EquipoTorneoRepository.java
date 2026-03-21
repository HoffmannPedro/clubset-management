package com.clubset.modules.torneo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipoTorneoRepository extends JpaRepository<EquipoTorneo, Long> {

    @Query("SELECT e FROM EquipoTorneo e " +
           "JOIN FETCH e.torneo " +
           "WHERE e.usuario1.id = :usuarioId OR e.usuario2.id = :usuarioId")
    List<EquipoTorneo> findByUsuarioIdIncludingTorneo(@Param("usuarioId") Long usuarioId);

    @Query("SELECT COALESCE(SUM(t.costoInscripcion - (SELECT COALESCE(SUM(p.monto), 0) FROM com.clubset.modules.finanza.Pago p WHERE p.torneoPactado = t AND p.usuarioPagador.id = :usuarioId)), 0) " +
           "FROM EquipoTorneo e JOIN e.torneo t " +
           "WHERE (e.usuario1.id = :usuarioId OR e.usuario2.id = :usuarioId) AND t.costoInscripcion > 0")
    java.math.BigDecimal calcularDeudaTorneosUsuario(@Param("usuarioId") Long usuarioId);
}
