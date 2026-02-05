package com.clubset.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- 1. NUEVO IMPORT

import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Usuario;
import com.clubset.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // <--- 2. INYECCIÓN DEL ENCRIPTADOR

    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    public UsuarioDTO guardarUsuario(Usuario usuario) {
        // Inicializar puntos si es null (nuevo usuario)
        if (usuario.getPuntosRanking() == null) {
            usuario.setPuntosRanking(0);
        }
        
        // <--- 3. LÓGICA DE ENCRIPTADO
        // Si el admin manda una contraseña (no está vacía), la encriptamos antes de guardar.
        // Así el sistema de Login podrá validarla después.
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        // -----------------------------

        // Validación básica de duplicados (opcional pero recomendada)
        // if (usuario.getId() == null && usuarioRepository.existsByEmail(usuario.getEmail())) ...

        usuarioRepository.save(usuario);
        return convertirADto(usuario);
    }
    
    public UsuarioDTO obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::convertirADto)
                .orElse(null);
    }

    // --- NUEVO MÉTODO PARA PERFIL ---
    public UsuarioDTO buscarPorEmail(String email) {
        // Usamos el mismo repositorio que ya configuraste para el Auth
        return usuarioRepository.findByEmail(email)
                .map(this::convertirADto)
                .orElse(null);
    }

    public void eliminarUsuario(Long id) {
        // Validamos si existe antes de intentar borrar (opcional, pero buena práctica)
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
        }
    }

    // Mapper actualizado
    private UsuarioDTO convertirADto(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono()); // Nuevo
        dto.setRol(usuario.getRol());
        
        // Mapeo deportivo
        dto.setCategoria(usuario.getCategoria());
        dto.setGenero(usuario.getGenero());
        dto.setManoHabil(usuario.getManoHabil());
        dto.setFotoPerfilUrl(usuario.getFotoPerfilUrl());
        dto.setPuntosRanking(usuario.getPuntosRanking());
        
        return dto;
    }
}