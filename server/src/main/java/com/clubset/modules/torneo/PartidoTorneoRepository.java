package com.clubset.modules.torneo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidoTorneoRepository extends JpaRepository<PartidoTorneo, Long> {
    List<PartidoTorneo> findByTorneoId(Long torneoId);
}
