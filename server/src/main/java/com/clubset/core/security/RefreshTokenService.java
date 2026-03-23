package com.clubset.core.security;

import com.clubset.modules.usuario.UsuarioRepository;
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
        
        String tokenStr = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusMillis(refreshTokenDurationMs);

        // Utilizamos Upsert nativo para evitar race conditions causadas por múltiples 
        // peticiones de login que ocurren en paralelo (ej, por React rendering dos veces).
        refreshTokenRepository.upsertToken(tokenStr, expiry, userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setToken(tokenStr);
        refreshToken.setExpiryDate(expiry);

        return refreshToken;
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
