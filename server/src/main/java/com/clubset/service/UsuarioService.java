package com.clubset.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.clubset.dto.UsuarioDTO;
import com.clubset.entity.Usuario;
import com.clubset.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    // Inyectamos el repositorio para poder usarlo
    private final UsuarioRepository usuarioRepository;

    // Método para obtener todos los usuarios de la base de datos
    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertirADto)
                .toList();
    }

    // Método para guardar un usuario nuevo
    public UsuarioDTO guardarUsuario(Usuario usuario) {
        // Aquí podrías poner validaciones antes de guardar.
        // Ej: if (usuario.getEmail() == null) ...
        usuarioRepository.save(usuario);
        return convertirADto(usuario);
    }


    // Helpers
    private UsuarioDTO convertirADto(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        return dto;
    }
}