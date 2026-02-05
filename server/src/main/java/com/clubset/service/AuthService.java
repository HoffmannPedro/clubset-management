package com.clubset.service;

import com.clubset.config.JwtService;
import com.clubset.dto.AuthResponse;
import com.clubset.dto.LoginRequest;
import com.clubset.dto.RegisterRequest;
import com.clubset.entity.Usuario;
import com.clubset.enums.Categoria;
import com.clubset.enums.Genero;
import com.clubset.enums.Mano;
import com.clubset.repository.UsuarioRepository;
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
        user.setRol("SOCIO"); // Por defecto todos son SOCIOS al registrarse públicamente
        
        // Datos deportivos
        user.setCategoria(cat);
        user.setGenero(gen);
        user.setManoHabil(mano);
        user.setPuntosRanking(0);

        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
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
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
}