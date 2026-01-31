package com.clubset.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.clubset.entity.Torneo;

public interface TorneoRepository extends JpaRepository<Torneo, Long> { }