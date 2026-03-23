package com.clubset.core.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query(value = "INSERT INTO refresh_token (token, expiry_date, usuario_id) " +
                   "VALUES (:token, :expiryDate, :usuarioId) " +
                   "ON CONFLICT (usuario_id) DO UPDATE " +
                   "SET token = EXCLUDED.token, expiry_date = EXCLUDED.expiry_date", 
           nativeQuery = true)
    void upsertToken(@Param("token") String token, @Param("expiryDate") Instant expiryDate, @Param("usuarioId") Long usuarioId);
}
