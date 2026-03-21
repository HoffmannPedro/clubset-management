package com.clubset.core.security;

import com.clubset.core.security.dto.TokenRefreshRequest;
import com.clubset.core.security.dto.AuthResponse;
import com.clubset.core.security.dto.LoginRequest;
import com.clubset.core.security.dto.RegisterRequest;
import com.clubset.modules.usuario.Usuario;
import com.clubset.core.shared.enums.Categoria;
import com.clubset.core.shared.enums.Genero;
import com.clubset.core.shared.enums.Mano;
import com.clubset.core.shared.enums.RolUsuario;
import com.clubset.modules.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        // Valores por defecto si vienen nulos
        Categoria cat = request.getCategoria() != null ? request.getCategoria() : Categoria.PRINCIPIANTE;
        Genero gen = request.getGenero() != null ? request.getGenero() : Genero.MASCULINO;
        Mano mano = request.getManoHabil() != null ? request.getManoHabil() : Mano.DIESTRO;

        var user = new Usuario();
        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // ENCRIPTAMOS
        user.setRol(RolUsuario.SOCIO); // Por defecto todos son SOCIOS al registrarse públicamente
        
        // Datos deportivos
        user.setCategoria(cat);
        user.setGenero(gen);
        user.setManoHabil(mano);
        user.setPuntosRanking(0);

        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Esto autentica contra Spring Security. Si falla, lanza excepción.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        // Si llegamos acá, es que el usuario y contraseña son correctos
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUsuario)
                .map(usuario -> {
                    String token = jwtService.generateToken(usuario);
                    return AuthResponse.builder()
                            .token(token)
                            .refreshToken(requestRefreshToken) // devolvemos el mismo RT válido, o podríamos rotarlo
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("El Refresh Token no existe o es inválido."));
    }
}