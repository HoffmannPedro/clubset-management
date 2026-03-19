package com.clubset.service;

import com.clubset.entity.RefreshToken;
import com.clubset.repository.RefreshTokenRepository;
import com.clubset.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${application.security.jwt.refresh-token.expiration:604800000}") // 7 días en ms
    private Long refreshTokenDurationMs;

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        var usuario = usuarioRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        refreshTokenRepository.deleteByUsuario(usuario);

        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expirado. Por favor, vuelva a conectarse.");
        }
        return token;
    }
}
